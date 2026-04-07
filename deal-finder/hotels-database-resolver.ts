import { NormalizedBookRequest, GoogleHotelMatch, DealFinderError, } from "./types";

import { findHotelByPlatformId, findHotelByName, saveUnresolvedRequest, updateHotelInDatabase, } from "./hotels.database";
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
export async function resolveHotel(request: ResolveRequest): Promise<GoogleHotelMatch | DealFinderError> {
	try {
		logSearchStart(request);

		// 1️⃣ Platform match (fast & reliable)
		const platformResult = await tryPlatformMatch(request);
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
async function tryPlatformMatch(request: ResolveRequest): Promise<GoogleHotelMatch | DealFinderError | null> {
	const match = await findHotelByPlatformId(request.origin.name, request.origin.hotel_id);

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

	const topCandidates = candidates.slice(0, 5);

	const prompt = `
You are an expert in hotel matching.

Task:
Determine which hotel from the candidate list is the SAME physical hotel as the input.

Input hotel:
Name: "${request.hotelName}"
Address: "${request.address || "N/A"}"
City: "${request.destination}"

Candidates:
${topCandidates.map((h, i) => `
Index : ${i + 1}.
Name: "${h.name}"
Address: "${h.location?.address || "N/A"}"
City: "${h.location?.city || "N/A"}"
`).join("\n")}

Rules:
- Match based on name similarity + address + city
- Ignore accents, word order, and common words like "hotel", "paris", "city"
- Be strict: only match if it is clearly the same hotel

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
	const googleId = matchedHotel.platformIds["google"];

	if (!googleId) {
		return null;
	}

	console.log(`🤖 AI Match: ${matchedHotel.name} (confidence: ${result.confidence})`);

	await updateHotelInDatabase(matchedHotel, request.origin.name, request.origin.hotel_id);
	return buildSuccess(googleId);
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

function buildSuccess(googleId: string): GoogleHotelMatch {
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
