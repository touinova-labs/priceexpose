import * as fs from "fs/promises";
import * as path from "path";
import { UnresolvedHotelRequest } from "./types";

/**
 * =========================
 * TYPES
 * =========================
 */

export interface HotelDBEntry {
    id: string;
    name: string;
    location: {
        address: string;
        postal_code: string;
        city: string;
        country: string;
    };
    telephone_number?: string;
    platformIds: Record<string, string>;
    resolvedAt: string;
    resolvedBy?: string;
}

export interface HotelDatabaseMatch {
    found: boolean;
    hotel?: HotelDBEntry;
    platform?: string;
    platformId?: string;
    score?: number;
}



/**
 * =========================
 * CACHE
 * =========================
 */

let hotelsDBCache: HotelDBEntry[] | null = null;

export async function loadHotelsDatabase(): Promise<HotelDBEntry[]> {
    if (hotelsDBCache) return hotelsDBCache;

    try {
        const dbPath = path.join(process.cwd(), "hotels_db.json");
        const data = await fs.readFile(dbPath, "utf-8");
        hotelsDBCache = JSON.parse(data);
        console.log(`📚 BD chargée: ${hotelsDBCache!.length}`);
        return hotelsDBCache!;
    } catch {
        return [];
    }
}

/**
 * =========================
 * PLATFORM MATCH
 * =========================
 */

export async function findHotelByPlatformId(platform: string, platformId: string): Promise<HotelDatabaseMatch> {
    const db = await loadHotelsDatabase();

    const hotel = db.find((h) => h.platformIds && h.platformIds[platform] === platformId);

    if (!hotel) return { found: false };

    return { found: true, hotel, platform, platformId };
}

/**
 * =========================
 * 🔥 ADVANCED NAME MATCH
 * =========================
 */

export async function findHotelByName(
    hotelName: string,
    destination: string,
    address?: string
): Promise<HotelDBEntry[]> {

    let db = await loadHotelsDatabase();

    const input = {
        name: normalize(hotelName),
        city: normalize(destination),
        address: normalize(address || "")
    };

    const potentialMatches: { hotel: HotelDBEntry; score: number }[] = [];
    const THRESHOLD = 0.65;
    db = db.filter(h => h.name === "Hôtel Monge"); // Filter out entries with missing location data
    for (const hotel of db) {

        const target = {
            name: normalize(hotel.name),
            city: normalize(hotel.location?.city),
            address: normalize(hotel.location?.address)
        };

        // 🔹 Scores
        const nameScore = similarity(input.name, target.name);
        const cityScore = similarity(input.city, target.city);
        const addressScore = address
            ? similarity(input.address, target.address)
            : 0;

        // 🔥 Score global
        let score =
            nameScore * 0.6 +
            cityScore * 0.3 +
            addressScore * 0.1;

        // 🔥 Boosts
        if (input.city === target.city) score += 0.05;
        if (nameScore > 0.9) score += 0.1;

        // ❌ Pénalités
        if (cityScore < 0.3) score -= 0.25;
        if (nameScore < 0.3) score -= 0.2;

        score = clamp(score);

        if (score >= THRESHOLD) {
            potentialMatches.push({ hotel, score });
        }
    }
    potentialMatches.sort((a, b) => b.score - a.score);
    return potentialMatches.map((m) => m.hotel)
}

/**
 * =========================
 * DB WRITE
 * =========================
 */

export async function addHotelToDatabase(hotelEntry: Omit<HotelDBEntry, "resolvedAt" | "resolvedBy">): Promise<{ success: boolean; error?: string }> {

    const db = await loadHotelsDatabase();

    for (const platform in hotelEntry.platformIds) {
        const exists = db.some(
            (h) => h.platformIds[platform] === hotelEntry.platformIds[platform]
        );
        if (exists) {
            return { success: false, error: "Duplicate platformId" };
        }
    }

    const newEntry: HotelDBEntry = {
        ...hotelEntry,
        resolvedAt: new Date().toISOString(),
        resolvedBy: "DATABASE_IMPORT",
    };

    db.push(newEntry);
    hotelsDBCache = db;

    await saveDB(db);

    return { success: true };
}
export async function updateHotelInDatabase(hotelEntry: HotelDBEntry, platform: string, platformId: string): Promise<{ success: boolean; error?: string }> {

    const db = await loadHotelsDatabase();

    const hotel = db.find((h) => h.id === hotelEntry.id);

    if (!hotel) {
        console.error(`❌ Hotel not found in DB for update: ${hotelEntry.id}`);
        return {
            success: false,
            error: "Hotel not found in database",
        };
    }

    // 🔒 2. Vérifier si ce platformId existe déjà ailleurs
    const duplicate = hotel.platformIds[platform] && hotel.platformIds[platform] !== platformId
    if (duplicate) {
        console.error(`❌ Duplicate platformId detected for ${platform}: ${platformId}`);
        return {
            success: false,
            error: `Duplicate ${platform} platformId`,
        };
    }

    // 🔄 3. Update platformId
    hotel.platformIds[platform] = platformId;

    // 🕒 4. Update metadata
    hotel.resolvedAt = new Date().toISOString();
    hotel.resolvedBy = "AI_MATCH";

    // 💾 5. Save
    await saveDB(db);
    hotelsDBCache = db;

    console.log(`✅ Updated ${hotel.name} with ${platform} ID`);

    return { success: true };
}

/**
 * =========================
 * UNRESOLVED
 * =========================
 */

export async function loadUnresolvedRequests(): Promise<UnresolvedHotelRequest[]> {
    try {
        const file = path.join(process.cwd(), "hotels_resolve.json");
        const data = await fs.readFile(file, "utf-8");
        return JSON.parse(data);
    } catch {
        return [];
    }
}

export async function saveUnresolvedRequest(hotelName: string, address: string, destination: string, sourcePlatform: string, sourcePlatformId: string)
    : Promise<void> {

    const file = path.join(process.cwd(), "hotels_resolve.json");
    const list = await loadUnresolvedRequests();

    const key = `${sourcePlatform}|${sourcePlatformId}`;
    const existing = list.find((i) =>
        `${i.sourcePlatform}|${i.sourcePlatformId}` === key
    );

    if (existing) {
        existing.attempted++;
        existing.timestamp = new Date().toISOString();
    } else {
        list.push({
            hotelName,
            address,
            destination,
            sourcePlatform,
            sourcePlatformId,
            timestamp: new Date().toISOString(),
            attempted: 1,
        });
    }

    await fs.writeFile(file, JSON.stringify(list, null, 2));
}

export async function removeFromUnresolved(sourcePlatform: string, sourcePlatformId: string)
    : Promise<{ success: boolean }> {

    const file = path.join(process.cwd(), "hotels_resolve.json");
    const list = await loadUnresolvedRequests();

    const filtered = list.filter(
        (i) =>
            !(i.sourcePlatform === sourcePlatform &&
                i.sourcePlatformId === sourcePlatformId)
    );

    await fs.writeFile(file, JSON.stringify(filtered, null, 2));

    return { success: filtered.length !== list.length };
}

/**
 * =========================
 * HELPERS
 * =========================
 */

async function saveDB(db: HotelDBEntry[]) {
    const dbPath = path.join(process.cwd(), "hotels_db.json");
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}

const STOP_WORDS = [
    "hotel", "hôtel", "residence", "appart", "apart", "inn", "lodge", "motel", "hostel",
    "the", "a", "an", "and", "or", "of", "in", "on", "at", "to", "for", "with",
];

function normalize(str?: string): string {
    if (!str) return "";
    return str
        .toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s]/g, " ")
        .replace(/\n+/g, " ")
        .split(" ")
        .filter(w => w && !STOP_WORDS.includes(w))
        .join(" ")
        .trim();
}

function similarity(a: string, b: string): number {
    if (!a || !b || a.trim() === "" || b.trim() === "") return 0;

    const A = a.split(" ");
    const B = b.split(" ");

    let matches = 0;
    for (const w of A) {
        if (B.includes(w)) matches++;
    }

    return matches / Math.max(A.length, B.length);
}

function clamp(n: number): number {
    return Math.max(0, Math.min(1, n));
}