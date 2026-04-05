import * as fs from "fs/promises";
import * as path from "path";
import * as crypto from "crypto";

/**
 * Generate a hash key from request properties
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
 * Get cache directory path
 */
function getCachePath(): string {
    return path.join(process.cwd(), ".cache", "responses");
}

/**
 * Get full cache file path for a key
 */
function getCacheFilePath(key: string): string {
    return path.join(getCachePath(), `${key}.json`);
}

/**
 * Read cached response if it exists
 */
export async function getCachedResponse(key: string): Promise<any | null> {
    try {
        const filePath = getCacheFilePath(key);
        const data = await fs.readFile(filePath, "utf-8");
        const cached = JSON.parse(data);
        console.log(`✅ Cache hit for key: ${key.substring(0, 8)}...`);
        return cached;
    } catch {
        return null;
    }
}

/**
 * Save response to cache
 */
export async function saveCachedResponse(key: string, response: any): Promise<void> {
    try {
        const cacheDir = getCachePath();
        
        // 🔒 Create cache directory if it doesn't exist
        try {
            await fs.mkdir(cacheDir, { recursive: true });
        } catch {
            // Directory might already exist
        }

        const filePath = getCacheFilePath(key);
        await fs.writeFile(filePath, JSON.stringify(response, null, 2));
        console.log(`💾 Cached response for key: ${key.substring(0, 8)}...`);
    } catch (error) {
        console.error(`❌ Failed to cache response: ${error}`);
        // Don't throw - caching failure shouldn't break the request
    }
}

/**
 * Clear cache for a specific key
 */
export async function clearCache(key: string): Promise<void> {
    try {
        const filePath = getCacheFilePath(key);
        await fs.unlink(filePath);
        console.log(`🗑️ Cleared cache for key: ${key.substring(0, 8)}...`);
    } catch {
        // File might not exist
    }
}

/**
 * Clear all cached responses
 */
export async function clearAllCache(): Promise<void> {
    try {
        const cacheDir = getCachePath();
        const files = await fs.readdir(cacheDir);
        for (const file of files) {
            await fs.unlink(path.join(cacheDir, file));
        }
        console.log(`🗑️ Cleared all cached responses`);
    } catch {
        // Directory might not exist
    }
}
