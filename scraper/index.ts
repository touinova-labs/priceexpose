/**
 * Hotel Scraper API Client
 * High-level TypeScript client for hotel discovery, enrichment, and booking offers
 *
 * Usage:
 * ```typescript
 * const client = new HotelScraperClient({
 *   baseUrl: 'http://82.165.116.199:3000/api/hotels'
 * });
 *
 * const hotels = await client.discoverHotels('https://www.google.com/travel/search?q=hotels+paris');
 * const details = await client.enrichHotel(hotels[0].googleId);
 * const offers = await client.getBookingOffers(hotels[0].googleId, '2026-04-13', '2026-04-16');
 * ```
 */

import {
  Hotel,
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
  async discoverHotels(searchUrl: string): Promise<Hotel[]> {
    return this.makeRequest<DiscoverResult>('/discover', {
      url: searchUrl,
    }).then(result => result.hotels);
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
      hotelName: result.data.hotelName,
      address: result.data.address,
      postalCode: result.data.postalCode,
      city: result.data.city,
      country: result.data.country,
      phoneNumber: result.data.phoneNumber,
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
   * Complete hotel search workflow
   * Discovers hotels, enriches each one, and fetches booking offers
   * @param searchUrl - Google Hotels search URL
   * @param checkin - Check-in date (YYYY-MM-DD)
   * @param checkout - Check-out date (YYYY-MM-DD)
   * @param limit - Maximum number of hotels to process (default: 5)
   * @param options - Optional parameters (currency, guests, children)
   * @returns Array of hotels with details and offers
   *
   * @example
   * const results = await client.searchHotels(
   *   'https://www.google.com/travel/search?q=hotels+paris',
   *   '2026-04-13',
   *   '2026-04-16',
   *   10,
   *   { currency: 'EUR' }
   * );
   *
   * results.forEach(result => {
   *   console.log(`${result.details.hotelName} - ${result.offers.length} offers`);
   * });
   */
  async searchHotels(
    searchUrl: string,
    checkin: string,
    checkout: string,
    limit: number = 5,
    options?: BookingOffersOptions
  ): Promise<
    Array<{
      hotel: Hotel;
      details: HotelDetails;
      offers: BookingOffer[];
    }>
  > {
    const hotels = await this.discoverHotels(searchUrl);
    const results = [];

    for (const hotel of hotels.slice(0, limit)) {
      try {
        const details = await this.enrichHotel(hotel.googleId);
        const offers = await this.getBookingOffers(
          hotel.googleId,
          checkin,
          checkout,
          options
        );

        results.push({
          hotel,
          details,
          offers,
        });

        // Add small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(
          `Failed to process hotel ${hotel.name}:`,
          error instanceof HotelScraperError ? error.message : error
        );
        continue;
      }
    }

    return results;
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
