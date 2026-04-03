import { RawBookRequest, NormalizedBookRequest, DealFinderError, RawBookingOffer, NormalizedBookingOffer } from "./types";

const GROQ_API_KEY = process.env.GROQ_API_KEY; // Ta clé Groq


/**
 * Parse la string "travelers" en nombre d'adultes et enfants
 * Format attendu: "2 adults, 1 child" ou "2 adults" ou "2a, 1c"
 */
export async function parseOccupancy(rawText: string): Promise<{ adults: number, children: number, rooms: number }> {

    try {
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant', // Très rapide et souvent gratuit
                messages: [
                    {
                        role: 'system',
                        content: 'You are a data extractor. Output JSON only.'
                    },
                    {
                        role: 'user',
                        content: `Text: "${rawText}". Extract: adults, children, rooms.`
                    }
                ],
                temperature: 0,
                response_format: { type: "json_object" } // Force le format JSON
            })
        });

        const data = await response.json();
        const result = JSON.parse(data.choices[0].message.content);

        return {
            adults: result.adults ?? 2,
            children: result.children ?? 0,
            rooms: result.rooms ?? 1
        };
    } catch (error) {
        console.error("Erreur Groq:", error);
        // Fallback par défaut pour ne pas bloquer l'extension
        return { adults: 2, children: 0, rooms: 1 };
    }
}

export async function parseTravelDates(checkInRaw: string, checkOutRaw: string): Promise<{ check_in: string, check_out: string } | null> {
    // On génère la date d'aujourd'hui dynamiquement
    const today = new Date();
    const todayString = today.toLocaleDateString('fr-FR', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });

    const systemPrompt = `
        Tu es un expert en extraction de dates de voyage.
        CONTEXTE : Aujourd'hui nous sommes le ${todayString}.
        TACHE : Convertis les dates fournies en format ISO YYYY-MM-DD.
        REGLES :
        1. Si l'année est absente, utilise ${today.getFullYear()}.
        2. Si une date semble être dans le passé par rapport à aujourd'hui (ex: Janvier alors qu'on est en Mars), utilise l'année suivante.
        3. Réponds UNIQUEMENT avec un objet JSON : {"check_in": "YYYY-MM-DD", "check_out": "YYYY-MM-DD"}.
    `;

    const userPrompt = `Check-in: "${checkInRaw}", Check-out: "${checkOutRaw}"`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0
        })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}


export async function getLeadOffer(offers: RawBookingOffer[]): Promise<NormalizedBookingOffer | null> {
    // On n'envoie que l'ID et le prix pour économiser 80% des tokens
    const minimalOffers = offers.map((obj, index) => ({
        id: index,
        price: obj.total_stay // Ex: "$ 696"
    }));

    const systemPrompt = `
    Tu es un extracteur de données financières ultra-précis.
    TACHE : Extraire le montant numérique et le code ISO 4217 de la devise.
    
    CORRESPONDANCE SYMBOLES :
    - € = EUR
    - $ = USD
    - £ = GBP
    - CHF = CHF
    - AED = AED
    - zł = PLN
    
    REGLES :
    1. "total" doit être un NUMBER (pas de string, pas d'espaces).
    2. "currency" doit être le code ISO de 3 lettres.
    3. Si le symbole est inconnu, renvoie "UNKNOWN".
    4. Réponds UNIQUEMENT en JSON.
`;

    const userPrompt = `
    Offers to process: ${JSON.stringify(minimalOffers)}
    
    Format attendu :
    {"results": [{"id": number, "total": number, "currency": "ISO_CODE"}]}
`;

    try {
        console.log("Sending to AI for Lead Extraction:", GROQ_API_KEY);
        const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'llama-3.1-8b-instant',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature: 0,
                response_format: { type: "json_object" }
            })
        });

        const data = await response.json();
        const aiResponse = JSON.parse(data.choices[0].message.content);

        // 1. On associe les données de l'IA aux objets originaux
        const normalized = offers.map((original, index) => {
            const extracted = aiResponse.results.find((r: any) => r.id === index);
            return {
                ...original,
                parsed_total: extracted?.total || Infinity, // Infinity pour ne pas choisir une erreur comme "min"
                currency: extracted?.currency || "EUR"
            };
        });

        // 2. On extrait DIRECTEMENT le minimum (le Lead)
        const leadOffer = normalized.reduce((min, current) =>
            (current.parsed_total < min.parsed_total) ? current : min
            , normalized[0]);

        // On trie pour mettre la moins chère en premier (index 0)
        return leadOffer;

    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

/**
 * Normalise une requête de booking brute
 */
export async function normalizeBookRequest(rawRequest: RawBookRequest): Promise<NormalizedBookRequest | DealFinderError> {
    try {
        // Validation des champs obligatoires
        if (!rawRequest.hotelName?.trim()) {
            return {
                code: "INVALID_HOTEL_NAME",
                message: "Hotel name is required"
            };
        }

        // Validation du format des dates (YYYY-MM-DD)
        var travel_dates = await parseTravelDates(rawRequest.checkIn, rawRequest.checkOut);
        if (!rawRequest.checkIn || !rawRequest.checkOut || !travel_dates) {
            return {
                code: "INVALID_DATES",
                message: "Check-in and check-out dates are required"
            };
        }
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(travel_dates.check_in) || !dateRegex.test(travel_dates.check_out)) {
            return {
                code: "INVALID_DATE_FORMAT",
                message: "Dates must be in YYYY-MM-DD format"
            };
        }

        // Vérifier que checkOut > checkIn
        if (new Date(rawRequest.checkOut) <= new Date(rawRequest.checkIn)) {
            return {
                code: "INVALID_DATE_RANGE",
                message: "Check-out date must be after check-in date"
            };
        }

        const occupancy = await parseOccupancy(rawRequest.travelers || "1 adult");
        const leadOffer = await getLeadOffer(rawRequest.bookingOffers || []);

        if (leadOffer === null) {
            return {
                code: "LEAD_OFFER_NOT_FOUND",
                message: "No valid lead offer found in booking offers"
            };
        }

        return {
            hotelName: rawRequest.hotelName.trim(),
            address: rawRequest.address?.trim() || "",
            checkIn: travel_dates.check_in,
            checkOut: travel_dates.check_out,
            destination: rawRequest.destination?.trim() || "",
            adults: occupancy.adults,
            children: occupancy.children,
            rooms: occupancy.rooms,
            currency : leadOffer.currency,
            locale: rawRequest.gl,
            language: rawRequest.hl,
            leadOffer: leadOffer,
            origin: rawRequest.origin
        };
    } catch (error) {
        return {
            code: "NORMALIZATION_ERROR",
            message: "Failed to normalize booking request",
            details: (error as Error).message
        };
    }
}

/**
 * Vérifie si le résultat est une erreur
 */
export function isError(result: any): result is DealFinderError {
    return  !result || result && typeof result === "object" && "code" in result && "message" in result;
}
