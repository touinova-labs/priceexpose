import { BookingOffer } from "../scraper";

const GROQ_API_KEY = process.env.GROQ_API_KEY; // Ta clé Groq

interface NormalizedBookingOffer {
    provider: string;
    room: string;
    link: string;

    totalStay: number,       // Price for the ENTIRE stay. Number only.
    currency: string,    // ISO 4217 code (e.g., "$"" -> "USD", "€" -> "EUR")
    // is_refundable: boolean,
    // deadline: string | null, // cancellation deadline Date or null. the format : YYYY-MM-DD, if the year is missing, use ${new Date().getFullYear()}.
    // breakfast: boolean, // true if breakfast is included, false otherwise
    // breakfast_value: number // if "breakfast" is included, extract the price of the breakfast if specified. Otherwise 0.
}

export async function normalize_BookingOffers(offers: BookingOffer[]): Promise<NormalizedBookingOffer[]> {

    const minimalOffers = offers.map((obj, index) => ({
        id: index,
        source_data: {
            // raw_options: obj.options,
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
    "totalStay": 0.0,        // Mandatory: Price for the ENTIRE stay. Number only.
    "currency": "EUR",   // ISO 4217 code (e.g., "$"" -> "USD", "€" -> "EUR")
    }]
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
                totalStay: extracted.totalStay,
                currency: extracted.currency
            };
        })
            .filter((offer): offer is NormalizedBookingOffer => offer !== null); // Filtre les offres nulles
        return finalData;

    } catch (error) {
        console.error("Critical Error:", error);
        return [];
    }
}
