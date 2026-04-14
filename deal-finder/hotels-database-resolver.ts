import { NormalizedBookRequest, GoogleId, DealFinderError, UnresolvedHotelRequest, } from "./types";

import { findHotelByPlatformId, findHotelByName, saveUnresolvedRequest, updateHotelInDatabase, HotelDBEntry, } from "./hotels.database";
const GROQ_API_KEY = process.env.GROQ_API_KEY; // Ta clé Groq

export type { HotelDBEntry } from "./hotels.database";

/**
 * =========================
 * MAIN RESOLVER
 * =========================
 */

interface ResolveRequest {
	address: string;
	destination: string;
	origin: {
		name: string;
		hotel_id: string;
	};
	hotelName: any;
}
export async function resolveHotel(request: ResolveRequest): Promise<GoogleId | DealFinderError> {
	try {
		logSearchStart(request);

		// 1️⃣ Platform match (fast & reliable)
		const platformResult = await getGoogleId(request.origin.name, request.origin.hotel_id);
		if (platformResult) return platformResult;

		// 2️⃣ Fuzzy name match
		const nameResult = await tryNameMatch(request);
		if (nameResult) return nameResult;

		// 3️⃣ Not found → enqueue
		return await handleNotFound(request);

	} catch (error) {
		return buildError(
			"DATABASE_RESOLUTION_ERROR",
			"Erreur lors de la résolution d'hôtel",
			(error as Error).message
		);
	}
}

/**
 * =========================
 * STEP 1: PLATFORM MATCH
 * =========================
 */
export async function getGoogleId(platform: string, platformId: string): Promise<GoogleId | null> {
	const match = await findHotelByPlatformId(platform, platformId);

	if (!match.found || !match.hotel) return null;

	const googleId = match.hotel.platformIds["google"];

	if (!googleId) {
		console.warn(`⚠️ Hôtel trouvé sans googleId: ${match.hotel.name}`);
		return null;
	}

	console.log(`✅ Match plateforme: ${match.hotel.name}`);

	return buildSuccess(googleId);
}

/**
 * =========================
 * STEP 2: NAME MATCH
 * =========================
 */
async function tryNameMatch(request: ResolveRequest) {
	console.log("🔍 Recherche fuzzy...");

	const candidates = await findHotelByName(request.hotelName, request.destination, request.address);

	if (!candidates.length) {
		return null;
	}

	const topCandidates = candidates.slice(0, 20);

	const matchedHotel = await getMatchUsingAI(topCandidates, {
		name: request.hotelName,
		city: request.destination,
		address: request.address,
		country: "N/A"
	})
	if (matchedHotel === null) return null;
	const googleId = matchedHotel.platformIds["google"];

	if (!googleId) {
		console.log("Could not find Google id", matchedHotel)
		return null;
	}

	console.log(`🤖 AI Match: ${matchedHotel.name}`);

	await updateHotelInDatabase(matchedHotel, request.origin.name.toLowerCase(), request.origin.hotel_id);
	return buildSuccess(googleId);
}

export async function getMatchUsingAI(candidates: HotelDBEntry[], hotel: { name: string, address: string, city: string, country: string }) {
	console.log("🔍 Recherche fuzzy...");

	if (!candidates.length) {
		return null;
	}

	const topCandidates = candidates.slice(0, 20);

	const prompt = `
You are an expert in hotel matching.

Task:
Determine which hotel from the candidate list is the SAME physical hotel as the input.

Input hotel:
Name: "${hotel.name}"
Address: "${hotel.address || "N/A"}"
City: "${hotel.city}"
Country: "${hotel.country}"

Candidates:
${topCandidates.map((h, i) => `
Index : ${i + 1}.
Name: "${h.name}"
Address: "${h.location?.address || "N/A"}"
City: "${h.location?.city || "N/A"}"
Country: "${h.location?.country || "N/A"}"
Postal code: "${h.location?.postal_code || "N/A"}"
`).join("\n")}

Rules:
- Match based on name similarity + address + city
- Ignore accents, word order, and common words like "hotel", "paris", "city"
- Be strict: only match if it is clearly the same hotel

Important:
Use geographic subdivisions strongly when matching hotels.

Treat equivalent administrative/location indicators as evidence when they correspond, including:
- arrondissement ↔ postal code
- district ↔ ZIP/postcode
- borough ↔ postcode
- ward ↔ neighborhood code
- municipality ↔ district
- airport zone ↔ terminal area
- neighborhood ↔ local postal sector

Examples:
- Paris 15th arrondissement ↔ 75015
- London SW1 ↔ Westminster
- Tokyo Shinjuku-ku ↔ Shinjuku postal area
- Barcelona Eixample ↔ matching district postcode

If hotel names are common or duplicated, prioritize exact local-area consistency.

Return JSON only:
{
  "match_index": number | null,
  "confidence": number (0-1)
}
`;

	const response = await fetch(
		"https://api.groq.com/openai/v1/chat/completions",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${GROQ_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "llama-3.3-70b-versatile",
				temperature: 0,
				response_format: { type: "json_object" },
				messages: [{ role: "user", content: prompt }],
			}),
		}
	);

	const data = await response.json();

	let result;
	try {
		result = JSON.parse(data.choices[0].message.content);
		console.log(`🤖 AI result: match_index=${result.match_index}, confidence=${result.confidence}`);
	} catch {
		console.error("❌ JSON parse error:", data);
		return null;
	}

	if (result.match_index == null || result.match_index < 1 || result.match_index > topCandidates.length) {
		console.log("❌ No confident AI match");
		return null;
	}

	if (result.confidence < 0.7) {
		console.log(`⚠️ Low confidence: ${result.confidence}`);
		return null;
	}

	const matchedHotel = topCandidates[result.match_index - 1];
	return matchedHotel;
}

/**
 * =========================
 * STEP 3: NOT FOUND
 * =========================
 */
async function handleNotFound(request: ResolveRequest): Promise<DealFinderError> {

	await saveUnresolvedRequest(
		request.hotelName,
		request.address,
		request.destination,
		request.origin.name,
		request.origin.hotel_id
	);

	return buildError("HOTEL_NOT_FOUND_IN_DATABASE", "Hôtel non trouvé", {
		hotelName: request.hotelName,
		destination: request.destination,
		sourcePlatform: request.origin.name,
		sourcePlatformId: request.origin.hotel_id
	});
}

/**
 * =========================
 * HELPERS
 * =========================
 */

function buildSuccess(googleId: string): GoogleId {
	return {
		propertyToken: googleId
	};
}

function buildError(
	code: string,
	message: string,
	details?: any
): DealFinderError {
	return { code, message, details };
}

function logSearchStart(request: ResolveRequest) {
	console.log(`🔍 Recherche: "${request.hotelName}" (${request.origin.name}/${request.origin.hotel_id})`);
}

export async function cleanHotelName(request: UnresolvedHotelRequest) {


	const prompt = `

You are a data normalization and entity resolution expert specializing in hotel names. Your task is to extract the canonical hotel name and generate a high-precision search query for cross-platform matching (e.g., Booking.com → Google Hotels → Maps).

INPUT:
You will receive:
- name (raw hotel listing name, may contain promotional text)
- address (location information)
- url (source slug, may contain brand hints)
- search context (target city/region)

OBJECTIVE:
Return a normalized hotel entity with:
1. clean_name → canonical hotel name only
2. search_query → optimized query for finding the same hotel on Google Hotels / Maps
3. confidence → probability score (0 to 1) indicating correctness

RULES FOR clean_name:
- Remove all promotional text (e.g., “Awarded Best Hotel 2025”, “Budget Category”, “Top Rated”)
- Remove marketing adjectives and rankings
- Remove neighborhood/city descriptors unless part of official brand name
- Ignore booking platform artifacts unless they clearly indicate brand (e.g., OYO, FabHotel, Marriott)
- Keep only the official or most commonly recognized hotel name
- Normalize capitalization (Title Case)
- Remove extra punctuation and redundant whitespace

RULES FOR search_query:
- Start with clean_name
- Add minimal disambiguation if needed:
  - Neighborhood (only if required for uniqueness)
  - City (always include)
  - Country (inculde)
- Use address/url clues if helpful for disambiguation
- Avoid promotional words and reviews
- Keep query short, search-engine optimized, and high-recall

CONFIDENCE SCORING:
- 0.90–1.00: Strong canonical match (well-known or highly certain)
- 0.70–0.89: Likely correct with minor uncertainty
- 0.40–0.69: Moderate inference required
- <0.40: Weak or ambiguous match

OUTPUT FORMAT:
Return ONLY valid JSON:
{
  "clean_name": string,
  "search_query": string,
  "confidence": number
}

Input:
name : ${request.hotelName}
adress : ${request.address}
url : ${request.sourcePlatformId}
related to search in : ${request.destination} 
`;


	const response = await fetch(
		"https://api.groq.com/openai/v1/chat/completions",
		{
			method: "POST",
			headers: {
				Authorization: `Bearer ${GROQ_API_KEY}`,
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				model: "llama-3.3-70b-versatile",
				temperature: 0,
				response_format: { type: "json_object" },
				messages: [
					{
						role: "system",
						content:
							"You are a strict JSON generator. Always return valid JSON only. No explanations.",
					},
					{
						role: "user",
						content: prompt,
					},
				],
			}),
		}
	);

	const data = await response.json();

	let result;
	try {
		result = JSON.parse(data.choices[0].message.content);
		console.log(`🤖 AI result: search_query=${result.search_query}, confidence=${result.confidence}`);
	} catch {
		console.error("❌ JSON parse error:", data);
		return null;
	}

	if (result.confidence < 0.7) {
		console.log(`⚠️ Low confidence: ${result.confidence}`);
		return null;
	}
	return { search_query: result.search_query, clean_name: result.clean_name }

}