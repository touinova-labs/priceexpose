/**
 * Hotel Scraper API Client Types
 */

// ============ Discover API Types ============

export interface Hotel {
  name: string;
  googleId: string;
}

export interface DiscoverResult {
  hotels: Hotel[];
  count: number;
}

// ============ Enrich API Types ============

export interface HotelDetails {
  hotelName: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phoneNumber: string;
}

// ============ Booking Offers API Types ============

export interface BookingOffer {
  provider: string;
  room: string;
  options: string;
  price_per_night: string;
  total_stay: string;
  link: string;
}

export interface BookingOffersResult {
  data: BookingOffer[];
  count: number;
  success: boolean;
}

// ============ Client Configuration ============

export interface HotelScraperClientConfig {
  baseUrl: string;
  timeout?: number; // milliseconds, default 60000
}

// ============ Search Options ============

export interface BookingOffersOptions {
  currency?: string; // default: EUR
  guests?: number; // default: 2
  children?: number; // default: 0
}

// ============ Error Types ============

export class HotelScraperError extends Error {
  constructor(
    public message: string,
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'HotelScraperError';
  }
}
