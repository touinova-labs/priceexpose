import { BookingOffer, NormalizedBookingOffer } from "../../../../public-data/google_detail";

interface Occupancy {
    adults: number;
    children: number;
    rooms: number;
}

export interface RawBookRequest {
    // Basic hotel information
    hotelName: string;
    address: string;

    // Dates and occupancy
    checkIn: string;
    checkOut: string;
    destination: string;
    travelers: string;

    // Detailed per-room data from hprt-table
    bookingOffers: BookingOffer[];

    gl: string; // Google locale (e.g., "us", "fr")
    hl: string// Google language (e.g., "en", "fr")
}






const GROQ_API_KEY = process.env.GROQ_API_KEY; // Ta clé Groq

export async function parseOccupancy(rawText: string): Promise<Occupancy> {

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

export async function normalizeRoom(name: string, facilities: string[] = []): Promise<any> {
    const prompt = `
        Normalize this hotel room:
        Name: "${name}"
        Facilities: "${facilities.join(', ')}"
        Return JSON only:
        {
          "standard_category": "SINGLE|DOUBLE|TWIN|TRIPLE|SUITE|APARTMENT|OTHER",
          "is_breakfast_included": boolean,
          "is_refundable": boolean
        }
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            model: 'llama-3.1-8b-instant',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0,
            response_format: { type: "json_object" }
        })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
}

export async function normalizeHotelOffers(offers: any) {
    const systemPrompt = `You are a hotel data extractor. You must ALWAYS return a valid JSON object starting with {. 
    Do not include any explanations or markdown.`;

    const userPrompt = `
    Analyze these hotel options: ${JSON.stringify(offers)}

    STRICT RULES:
    1. "base_price": Extract the number. IMPORTANT: Ignore thousands separators (e.g., "1,056" becomes 1056).
    2. "breakfast_value": 
       - is_included: true if "breakfast" is the package of the option.
       - value_included: If a price (e.g., "€ 14") is next to breakfast, extract that number. Otherwise 0.
    3. "is_refundable": true if "Free cancellation" is present. false if "Non-refundable" is present.
    4. "is_genius_discount_applied": true if "Genius" is mentioned.

    JSON SCHEMA TO FOLLOW:
    {
      "options": [
        {
          "base_price": number,
          "currency": "EUR",
          "breakfast": { "is_included": boolean, "value_included": number },
          "is_refundable": boolean,
          "is_genius_discount_applied": boolean
        }
      ]
    }`;

    try {
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

        if (data.error) {
            console.error("Groq Error:", data.error.message);
            return null;
        }

        const content = JSON.parse(data.choices[0].message.content);
        // On retourne directement le tableau pour rester compatible avec ton code actuel
        return content.options;

    } catch (error) {
        console.error("Critical Error:", error);
        return null;
    }
}

export async function normalizeGoogleOffers(offers: BookingOffer[]): Promise<NormalizedBookingOffer[]> {

    const minimalOffers = offers.map((obj, index) => ({
        id: index,
        source_data: {
            raw_options: obj.options,
            price_per_night_label: obj.price_per_night, 
            total_stay_label: obj.total_stay 
        }
    }));


    const systemPrompt = `You are a hotel data extractor. You must ALWAYS return a valid JSON. 
    Do not include any explanations or markdown.`;

    const userPrompt = `
Extract data from these hotel offers, keep the "id" for each. ${JSON.stringify(minimalOffers)}

JSON Format:
{
  "results": [{
    "id": number,
    ""nightly": 0.0,    // Mandatory: Price for ONE night only. Number only.
    "total": 0.0,        // Mandatory: Price for the ENTIRE stay. Number only.
    "currency": "EUR",   // ISO 4217 code (e.g., "$"" -> "USD", "€" -> "EUR")
    "is_refundable": boolean,
    "deadline": "string|null", // cancellation deadline Date or null. the format : YYYY-MM-DD, if the year is missing, use ${new Date().getFullYear()}.
    "breakfast": boolean // true if breakfast is included, false otherwise
    "breakfast_value": if "breakfast" is included, extract the price of the breakfast if specified. Otherwise 0.
}]
}

Note: Clean prices (remove symbols) and infer options from the provided text.`;

    try {
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

        if (data.error) {
            console.error("Groq Error:", data.error.message);
            return [];
        }

        console.log("Raw AI Response:", data.usage.total_tokens, "tokens used");
        const aiResponse = JSON.parse(data.choices[0].message.content);
        const finalData = offers.map((original, index) => {
            const extracted = aiResponse.results.find((r: any) => r.id === index);
            if (!extracted) {
                console.warn(`No AI data for offer id ${index}, using defaults.`);
                return null
            }
            return {
                provider: original.provider,
                room: original.room,
                link: original.link,
                total: extracted ? extracted.total : 0,
                nightly: extracted ? extracted.nightly : 0,
                currency: extracted ? extracted.currency : "EUR",
                is_refundable: extracted ? extracted.is_refundable : false,
                deadline: extracted ? extracted.deadline : null,
                breakfast: extracted ? extracted.breakfast : false,
                breakfast_value: extracted ? extracted.breakfast_value : 0
            };
        })
            .filter((offer): offer is NormalizedBookingOffer => offer !== null); // Filtre les offres nulles
        return finalData;

    } catch (error) {
        console.error("Critical Error:", error);
        return [];
    }
}


export async function getLeadOffer(offers: BookingOffer[]): Promise<BookingOffer & { parsed_total: number; currency: string } | null> {
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