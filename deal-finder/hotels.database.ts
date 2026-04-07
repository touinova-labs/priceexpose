import { UnresolvedHotelRequest } from "./types";
import { pool } from "./db";

/**
 * =========================
 * TYPES
 * =========================
 */

export interface HotelDBEntry {
    id: string;
    name: string;
    location?: {
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

export async function loadHotelsDatabase(): Promise<HotelDBEntry[]> {
    const result = await pool.query("SELECT * FROM hotels");
    return result.rows.map(row => ({
        ...row,
        location: row.location,
        platformIds: row.platform_ids,
        resolvedAt: row.resolved_at,
        resolvedBy: row.resolved_by,
    }));
}

/**
 * =========================
 * PLATFORM MATCH
 * =========================
 */

export async function findHotelByPlatformId(platform: string, platformId: string) {
    const query = `
        SELECT * FROM hotels
        WHERE platform_ids->>$1 = $2
    `;

    const result = await pool.query(query, [platform, platformId]);

    if (result.rows.length === 0) return { found: false };

    const hotel = result.rows[0];

    return {
        found: true,
        hotel: {
            ...hotel,
            location: hotel.location,
            platformIds: hotel.platform_ids,
            resolvedAt: hotel.resolved_at,
            resolvedBy: hotel.resolved_by,
        }
    };
}

/**
 * =========================
 * 🔥 ADVANCED NAME MATCH
 * =========================
 */


export async function findHotelByName(hotelName: string, destination: string, address?: string): Promise<HotelDBEntry[]> {

    const name = hotelName.toLowerCase();
    const city = destination.toLowerCase();
    const addr = address?.toLowerCase() || "";

    const result = await pool.query(`
    WITH scored AS (
        SELECT *,
            similarity(name, $1) AS name_score,
            similarity(location->>'city', $2) AS city_score,
            similarity(location->>'address', $3) AS address_score,
            (
                similarity(name, $1) * 0.6 +
                similarity(location->>'city', $2) * 0.3 +
                similarity(location->>'address', $3) * 0.1
            ) AS score
        FROM hotels
    )
    SELECT *
    FROM scored
    WHERE score > 0.65
    ORDER BY score DESC
    LIMIT 20
`, [name, city, addr]);

    return result.rows.map(hotel => ({
        id: hotel.id,
        name: hotel.name,
        location: hotel.location,
        telephone_number: hotel.telephone_number,
        platformIds: hotel.platform_ids,
        resolvedAt: hotel.resolved_at,
        resolvedBy: hotel.resolved_by,
    }));
}

/**
 * =========================
 * DB WRITE
 * =========================
 */

export async function addHotelToDatabase(hotelEntry: Omit<HotelDBEntry, "resolvedAt" | "resolvedBy">) {

    const query = `
        INSERT INTO hotels (id, name, location, telephone_number, platform_ids, resolved_at, resolved_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `;

    await pool.query(query, [
        hotelEntry.id,
        hotelEntry.name,
        JSON.stringify(hotelEntry.location || null),
        hotelEntry.telephone_number || null,
        JSON.stringify(hotelEntry.platformIds),
        new Date(),
        "DATABASE_IMPORT"
    ]);

    return { success: true };
}


export async function updateHotelInDatabase(hotelEntry: HotelDBEntry, platform: string, platformId: string) {
    const query = `
        UPDATE hotels
        SET platform_ids = jsonb_set(platform_ids, $1, $2::jsonb),
            resolved_at = $3,
            resolved_by = 'AI_MATCH'
        WHERE id = $4
    `;

    await pool.query(query, [
        `{${platform}}`,
        JSON.stringify(platformId),
        new Date(),
        hotelEntry.id
    ]);

    return { success: true };
}


export async function upsertHotelInDB(updates: Partial<HotelDBEntry>): Promise<{ success: boolean; error?: string }> {

    try {
        await pool.query(`
            INSERT INTO hotels (
                id,
                name,
                location,
                telephone_number,
                platform_ids,
                resolved_at,
                resolved_by
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)

            ON CONFLICT (id)
            DO UPDATE SET
                name = COALESCE(EXCLUDED.name, hotels.name),
                location = COALESCE(EXCLUDED.location, hotels.location),
                telephone_number = COALESCE(EXCLUDED.telephone_number, hotels.telephone_number),
                platform_ids = hotels.platform_ids || EXCLUDED.platform_ids,
                resolved_at = EXCLUDED.resolved_at,
                resolved_by = EXCLUDED.resolved_by
        `, [
            updates.id,
            updates.name || null,
            updates.location ? JSON.stringify(updates.location) : null,
            updates.telephone_number || null,
            updates.platformIds ? JSON.stringify(updates.platformIds) : null,
            new Date(),
            "UPSERT"
        ]);

        return { success: true };

    } catch (err: any) {
        console.error(err);
        return { success: false, error: err.message };
    }
}

/**
 * =========================
 * UNRESOLVED
 * =========================
 */

export async function loadUnresolvedRequests(): Promise<UnresolvedHotelRequest[]> {
    const result = await pool.query(`
        SELECT * FROM unresolved_hotels
        ORDER BY timestamp DESC
    `);

    return result.rows.map(r => ({
        hotelName: r.hotel_name,
        address: r.address,
        destination: r.destination,
        sourcePlatform: r.source_platform,
        sourcePlatformId: r.source_platform_id,
        timestamp: r.timestamp,
        attempted: r.attempted,
    }));
}

export async function saveUnresolvedRequest(
    hotelName: string,
    address: string,
    destination: string,
    sourcePlatform: string,
    sourcePlatformId: string
): Promise<void> {

    await pool.query(`
        INSERT INTO unresolved_hotels (
            hotel_name,
            address,
            destination,
            source_platform,
            source_platform_id,
            timestamp,
            attempted
        )
        VALUES ($1, $2, $3, $4, $5, $6, 1)

        ON CONFLICT (source_platform, source_platform_id)
        DO UPDATE SET
            attempted = unresolved_hotels.attempted + 1,
            address = CASE 
                WHEN length(EXCLUDED.address) > length(unresolved_hotels.address)
                THEN EXCLUDED.address
                ELSE unresolved_hotels.address
            END,
            timestamp = EXCLUDED.timestamp
    `, [
        hotelName,
        address,
        destination,
        sourcePlatform,
        sourcePlatformId,
        new Date()
    ]);
}

export async function removeFromUnresolved(
    sourcePlatform: string,
    sourcePlatformId: string
): Promise<{ success: boolean }> {

    const result = await pool.query(`
        DELETE FROM unresolved_hotels
        WHERE source_platform = $1
        AND source_platform_id = $2
    `, [sourcePlatform, sourcePlatformId]);

    return { success: true };
}
