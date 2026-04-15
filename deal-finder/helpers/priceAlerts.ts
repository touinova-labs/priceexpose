/**
 * Database helper functions for PriceAlert operations (PostgreSQL)
 */

import { pool } from '../db';
import crypto from 'crypto';
import { PriceAlert } from '@/lib/db/types';

interface CreatePriceAlertInput {
  email: string;
  favoriteRoute: string;
  consentGiven: boolean;
}

interface PriceAlertResponse {
  success: boolean;
  subscriptionId: string;
  message: string;
  email: string;
}

/**
 * Create or update a price alert subscription
 */
export async function createPriceAlert(input: CreatePriceAlertInput): Promise<PriceAlertResponse> {
  const client = await pool.connect();

  try {
    // Check if subscription already exists
    const existingResult = await client.query(
      `SELECT id FROM price_alerts WHERE email = $1`,
      [input.email]
    );

    if (existingResult.rows.length > 0) {
      // Update existing subscription
      const updateResult = await client.query(
        `
        UPDATE price_alerts 
        SET favorite_route = $1, consent_given = $2, is_active = true, updated_at = NOW()
        WHERE email = $3
        RETURNING id
        `,
        [input.favoriteRoute, input.consentGiven, input.email]
      );

      return {
        success: true,
        subscriptionId: updateResult.rows[0].id,
        message: 'Subscription updated successfully',
        email: input.email,
      };
    }

    // Create new subscription
    const unsubscribeToken = generateUnsubscribeToken();

    const insertResult = await client.query(
      `
      INSERT INTO price_alerts (email, favorite_route, consent_given, unsubscribe_token)
      VALUES ($1, $2, $3, $4)
      RETURNING id
      `,
      [input.email, input.favoriteRoute, input.consentGiven, unsubscribeToken]
    );

    return {
      success: true,
      subscriptionId: insertResult.rows[0].id,
      message: 'Subscription created successfully',
      email: input.email,
    };
  } catch (error) {
    console.error('Error creating price alert:', error);
    throw new Error('Failed to create price alert subscription');
  } finally {
    client.release();
  }
}

/**
 * Get all active price alert subscriptions
 */
export async function getActiveAlerts(limit: number = 1000, offset: number = 0): Promise<PriceAlert[]> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT * FROM price_alerts 
      WHERE is_active = true 
      ORDER BY subscribed_at DESC 
      LIMIT $1 OFFSET $2
      `,
      [limit, offset]
    );

    return result.rows.map((row: any) => ({
      id: row.id,
      email: row.email,
      favorite_route: row.favorite_route,
      consent_given: row.consent_given,
      is_active: row.is_active,
      unsubscribe_token: row.unsubscribe_token,
      subscribed_at: row.subscribed_at,
      last_alert_sent: row.last_alert_sent,
      alert_count: row.alert_count,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  } catch (error) {
    console.error('Error getting active alerts:', error);
    throw new Error('Failed to get active alerts');
  } finally {
    client.release();
  }
}

/**
 * Get alerts by route for sending notifications
 */
export async function getAlertsByRoute(route: string): Promise<PriceAlert[]> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT * FROM price_alerts 
      WHERE favorite_route = $1 AND is_active = true
      `,
      [route]
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting alerts by route:', error);
    throw new Error('Failed to get alerts by route');
  } finally {
    client.release();
  }
}

/**
 * Unsubscribe using token
 */
export async function unsubscribeByToken(token: string): Promise<boolean> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `UPDATE price_alerts SET is_active = false WHERE unsubscribe_token = $1`,
      [token]
    );

    return result.rowCount! > 0;
  } catch (error) {
    console.error('Error unsubscribing:', error);
    throw new Error('Failed to unsubscribe');
  } finally {
    client.release();
  }
}

/**
 * Update last alert sent time
 */
export async function updateLastAlertSent(email: string): Promise<boolean> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      UPDATE price_alerts 
      SET last_alert_sent = NOW(), alert_count = alert_count + 1
      WHERE email = $1
      `,
      [email]
    );

    return result.rowCount! > 0;
  } catch (error) {
    console.error('Error updating last alert sent:', error);
    throw new Error('Failed to update last alert sent');
  } finally {
    client.release();
  }
}

/**
 * Delete subscription by email
 */
export async function deleteSubscription(email: string): Promise<boolean> {
  const client = await pool.connect();

  try {
    const result = await client.query(`DELETE FROM price_alerts WHERE email = $1`, [email]);
    return result.rowCount! > 0;
  } catch (error) {
    console.error('Error deleting subscription:', error);
    throw new Error('Failed to delete subscription');
  } finally {
    client.release();
  }
}

/**
 * Generate unsubscribe token
 */
function generateUnsubscribeToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Get alerts that haven't received an alert in X days
 */
export async function getAlertsForNotification(daysSinceLastAlert: number = 7): Promise<PriceAlert[]> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      SELECT * FROM price_alerts 
      WHERE is_active = true 
      AND (last_alert_sent IS NULL OR last_alert_sent < NOW() - INTERVAL '${daysSinceLastAlert} days')
      LIMIT 100
      `
    );

    return result.rows;
  } catch (error) {
    console.error('Error getting alerts for notification:', error);
    throw new Error('Failed to get alerts for notification');
  } finally {
    client.release();
  }
}

/**
 * Bulk update email sent status
 */
export async function updateMultipleAlertsSent(emails: string[]): Promise<number> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `
      UPDATE price_alerts 
      SET last_alert_sent = NOW(), alert_count = alert_count + 1
      WHERE email = ANY($1)
      `,
      [emails]
    );

    return result.rowCount || 0;
  } catch (error) {
    console.error('Error bulk updating alerts:', error);
    throw new Error('Failed to bulk update alerts');
  } finally {
    client.release();
  }
}

/**
 * Check if an email is subscribed to price alerts
 */
export async function isEmailSubscribed(email: string): Promise<boolean> {
  const client = await pool.connect();

  try {
    const result = await client.query(
      `SELECT id FROM price_alerts WHERE email = $1 AND is_active = true`,
      [email]
    );

    return result.rows.length > 0;
  } catch (error) {
    console.error('Error checking subscription:', error);
    throw new Error('Failed to check subscription status');
  } finally {
    client.release();
  }
}
