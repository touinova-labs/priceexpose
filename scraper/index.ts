/**
 * Hotel Scraper API Client
 * High-level TypeScript client for hotel discovery, enrichment, and booking offers
 *
 * const hotels = await client.discoverHotels('https://www.google.com/travel/search?q=hotels+paris');
 * const details = await client.enrichHotel(hotels[0].googleId);
 * const offers = await client.getBookingOffers(hotels[0].googleId, '2026-04-13', '2026-04-16');
 * ```
 */

import {
  HotelDetails,
  BookingOffer,
  DiscoverResult,
  BookingOffersResult,
  HotelScraperClientConfig,
  BookingOffersOptions,
  HotelScraperError,
} from './types';

export class HotelScraperClient {
  private baseUrl: string;
  private timeout: number;

  constructor(config: HotelScraperClientConfig) {
    this.baseUrl = config.baseUrl;
    this.timeout = config.timeout || 60000;
  }

  async getBookingFullAddress(url: string): Promise<{ address: string, title: string }> {
    const response = await fetch(`${this.baseUrl}${'/booking'}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url: url,
      }),
    });

    const data = await response.json();

    return data;
  }

  /**
   * Discover hotels from a Google Hotels search URL
   * @param searchUrl - Google Hotels search URL
   * @returns Array of discovered hotels
   * @throws HotelScraperError if the request fails
   *
   * @example
   * const hotels = await client.discoverHotels(
   *   'https://www.google.com/travel/search?q=hotels+paris'
   * );
   * console.log(`Found ${hotels.length} hotels`);
   */
  async discoverHotels(searchUrl: string): Promise<DiscoverResult['data']> {
    return this.makeRequest<DiscoverResult>('/discover', {
      url: searchUrl,
    }).then(result => result.data);
  }

  /**
   * Enrich hotel with detailed information
   * @param googleId - Google Hotel ID from discoverHotels
   * @returns Detailed hotel information
   * @throws HotelScraperError if the request fails
   *
   * @example
   * const details = await client.enrichHotel('ChgIqav798XohJB3GgwvZy8xMXI5cXF6eGQQAQ');
   * console.log(`${details.hotelName} in ${details.city}`);
   */
  async enrichHotel(googleId: string): Promise<HotelDetails> {
    const result = await this.makeRequest<{ data: HotelDetails }>('/enrich', {
      propertyToken: googleId,
    });

    return {
      hotel_name: result.data.hotel_name,
      street_address: result.data.street_address,
      postal_code: result.data.postal_code,
      city: result.data.city,
      country: result.data.country,
      telephone_number: result.data.telephone_number,
    };
  }

  /**
   * Get booking offers for a hotel on specific dates
   * @param googleId - Google Hotel ID from discoverHotels
   * @param checkin - Check-in date (YYYY-MM-DD)
   * @param checkout - Check-out date (YYYY-MM-DD)
   * @param options - Optional parameters (currency, guests, children)
   * @returns Array of available booking offers
   * @throws HotelScraperError if the request fails
   *
   * @example
   * const offers = await client.getBookingOffers(
   *   'ChgIqav798XohJB3GgwvZy8xMXI5cXF6eGQQAQ',
   *   '2026-04-13',
   *   '2026-04-16',
   *   { currency: 'USD', guests: 2 }
   * );
   */
  async getBookingOffers(
    googleId: string,
    checkin: string,
    checkout: string,
    options?: BookingOffersOptions
  ): Promise<BookingOffer[]> {
    return this.makeRequest<BookingOffersResult>('/offers', {
      propertyToken: googleId,
      checkin,
      checkout,
      currency: options?.currency || 'EUR',
      guests: options?.guests || 2,
      children: options?.children || 0,
    }).then(result => result.data);
  }

  /**
   * Private method to make HTTP requests with error handling
   */
  private async makeRequest<T>(
    endpoint: string,
    body: Record<string, any>
  ): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new HotelScraperError(
          data.error || `Request failed with status ${response.status}`,
          response.status,
          data
        );
      }

      return data;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof HotelScraperError) {
        throw error;
      }

      if (error instanceof TypeError && 'cause' in error) {
        throw new HotelScraperError(
          'Request timeout or network error',
          undefined,
          error
        );
      }

      throw new HotelScraperError(
        error instanceof Error ? error.message : 'Unknown error',
        undefined,
        error
      );
    }
  }
}

export * from './types';
