import * as crypto from "crypto";
import { pool } from "../../deal-finder/db";

/**
 * =========================
 * Generate cache key
 * =========================
 */
export function generateCacheKey(properties: {
    hotelName: string;
    address: string;
    checkIn: string;
    checkOut: string;
    travelers: string;
}): string {
    const cacheString = `${properties.hotelName}|${properties.address}|${properties.checkIn}|${properties.checkOut}|${properties.travelers}`;
    return crypto.createHash("sha256").update(cacheString).digest("hex");
}

/**
 * =========================
 * Ensure cache table exists
 * (run once at startup if needed)
 * =========================
 */
export async function initCacheTable() {
    await pool.query(`
        CREATE TABLE IF NOT EXISTS cache (
            key TEXT PRIMARY KEY,
            value JSONB,
            created_at TIMESTAMP DEFAULT now()
        );
    `);
}

/**
 * =========================
 * Get cached response
 * =========================
 */
export async function getCachedResponse(key: string): Promise<any | null> {
    try {
        const result = await pool.query(
            `SELECT value FROM cache WHERE key = $1`,
            [key]
        );

        if (result.rows.length === 0) return null;

        console.log(`✅ Cache hit: ${key.substring(0, 8)}...`);
        return result.rows[0].value;

    } catch (error) {
        console.error("❌ Cache read error:", error);
        return null;
    }
}

/**
 * =========================
 * Save cached response
 * =========================
 */
export async function saveCachedResponse(key: string, response: any): Promise<void> {
    try {
        await pool.query(`
            INSERT INTO cache (key, value)
            VALUES ($1, $2)
            ON CONFLICT (key)
            DO UPDATE SET
                value = EXCLUDED.value,
                created_at = now()
        `, [key, response]);

        console.log(`💾 Cached: ${key.substring(0, 8)}...`);

    } catch (error) {
        console.error("❌ Cache write error:", error);
        // do not break app
    }
}

/**
 * =========================
 * Clear cache (single key)
 * =========================
 */
export async function clearCache(key: string): Promise<void> {
    try {
        await pool.query(
            `DELETE FROM cache WHERE key = $1`,
            [key]
        );

        console.log(`🗑️ Cleared cache: ${key.substring(0, 8)}...`);

    } catch (error) {
        console.error("❌ Cache delete error:", error);
    }
}

/**
 * =========================
 * Clear all cache
 * =========================
 */
export async function clearAllCache(): Promise<void> {
    try {
        await pool.query(`DELETE FROM cache`);
        console.log(`🗑️ Cleared all cache`);

    } catch (error) {
        console.error("❌ Clear all cache error:", error);
    }
}