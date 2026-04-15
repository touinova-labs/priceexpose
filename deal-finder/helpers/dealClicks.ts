/**
 * Database helper functions for DealClick operations (PostgreSQL)
 */

import { pool } from '../db';

interface CreateDealClickInput {
  providerId: number;
  selectedProviderId: number;
  selectedProviderPrice: number;
  propertyId: string;
  travelSettings: string;
  bookingPrice: number;
  currency: string;
  userAgent?: string;
  ipAddress?: string;
}

interface DealClickResponse {
  success: boolean;
  clickId: string;
  message: string;
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
 * Log a user's deal click with travel settings, price, and selected provider
 */
export async function logDealClick(input: CreateDealClickInput): Promise<DealClickResponse> {
  const client = await pool.connect();

  try {
    const query = `
      INSERT INTO deal_clicks (
        provider_id,
        selected_provider_id,
        selected_provider_price,
        property_id,
        travel_settings,
        booking_price,
        currency,
        user_agent,
        ip_address
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id;
    `;

    const result = await client.query(query, [
      input.providerId,
      input.selectedProviderId,
      input.selectedProviderPrice,
      input.propertyId,
      input.travelSettings,
      input.bookingPrice,
      input.currency,
      input.userAgent || null,
      input.ipAddress || null,
    ]);

    const clickId = result.rows[0]?.id;

    return {
      success: true,
      clickId,
      message: 'Click logged successfully',
    };
  } catch (error) {
    console.error('Error logging deal click:', error);
    throw new Error('Failed to log deal click');
  } finally {
    client.release();
  }
}
