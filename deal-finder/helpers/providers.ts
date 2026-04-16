/**
 * Database helper functions for Provider operations (PostgreSQL)
 */

import { pool } from '../db';

/**
 * Normalize provider name to consistent format
 */
function normalizeProviderName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '_');
}

/**
 * Get all available providers
 */
export async function getAllProviders(): Promise<
  Array<{
    id: number;
    name: string;
    enabled: boolean;
  }>
> {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT id, name, enabled
      FROM providers
      ORDER BY name ASC
    `);

    return result.rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      enabled: row.enabled,
    }));
  } catch (error) {
    console.error('Error getting providers:', error);
    throw new Error('Failed to get providers');
  } finally {
    client.release();
  }
}

/**
 * Get provider by name or create if not found
 * Normalizes the name to ensure consistent formatting
 */
export async function getOrCreateProvider(
  name: string
): Promise<{
  id: number;
  name: string;
  enabled: boolean;
}> {
  const client = await pool.connect();
  const normalizedName = normalizeProviderName(name);

  try {
    // Try to find existing provider
    const selectResult = await client.query(
      `
      SELECT id, name, enabled
      FROM providers
      WHERE LOWER(name) = LOWER($1) OR LOWER(name) = $2
      LIMIT 1
      `,
      [name, normalizedName]
    );

    if (selectResult.rows.length > 0) {
      return {
        id: selectResult.rows[0].id,
        name: selectResult.rows[0].name,
        enabled: selectResult.rows[0].enabled,
      };
    }

    // Create new provider if not found
    const insertResult = await client.query(
      `
      INSERT INTO providers (name, enabled)
      VALUES ($1, $2)
      RETURNING id, name, enabled
      `,
      [normalizedName, true]
    );

    return {
      id: insertResult.rows[0].id,
      name: insertResult.rows[0].name,
      enabled: insertResult.rows[0].enabled,
    };
  } catch (error) {
    console.error('Error getting or creating provider:', error);
    throw new Error('Failed to get or create provider');
  } finally {
    client.release();
  }
}
