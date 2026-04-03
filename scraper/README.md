# Hotel Scraper Client

A high-level TypeScript client for the Hotel Scraper API. Simple, type-safe, and easy to integrate.

## 📦 Installation

Copy the `client` directory to your project:

```bash
cp -r ./client ./src/lib/hotel-scraper-client
```

## 🚀 Quick Start

```typescript
import { HotelScraperClient } from './lib/hotel-scraper-client';

const client = new HotelScraperClient({
  baseUrl: 'http://82.165.116.199:3000/api/hotels',
});

// Discover hotels
const hotels = await client.discoverHotels(
  'https://www.google.com/travel/search?q=hotels+paris'
);

// Enrich hotel data
const details = await client.enrichHotel(hotels[0].googleId);

// Get booking offers
const offers = await client.getBookingOffers(
  hotels[0].googleId,
  '2026-04-13',
  '2026-04-16'
);
```

## 📚 API Reference

### `discoverHotels(searchUrl: string): Promise<Hotel[]>`

Discover hotels from a Google Hotels search URL.

```typescript
const hotels = await client.discoverHotels(
  'https://www.google.com/travel/search?q=hotels+paris'
);

console.log(hotels[0].name); // "Hotel Monge"
console.log(hotels[0].googleId); // "ChgIqav798XohJB3GgwvZy8xMXI5cXF6eGQQAQ"
```

**Parameters:**
- `searchUrl` (string, required) - Valid Google Hotels search URL

**Returns:** Array of `Hotel` objects with `name` and `googleId`

**Throws:** `HotelScraperError` if request fails

---

### `enrichHotel(googleId: string): Promise<HotelDetails>`

Get detailed information about a hotel.

```typescript
const details = await client.enrichHotel('ChgIqav798XohJB3GgwvZy8xMXI5cXF6eGQQAQ');

console.log(details.hotelName); // "Hotel Monge"
console.log(details.address); // "55 Rue Monge"
console.log(details.city); // "Paris"
console.log(details.country); // "France"
console.log(details.phoneNumber); // "+33 1 43 26 87 90"
```

**Parameters:**
- `googleId` (string, required) - Hotel ID from `discoverHotels()`

**Returns:** `HotelDetails` object with hotel information

**Throws:** `HotelScraperError` if hotel not found or request fails

---

### `getBookingOffers(googleId: string, checkin: string, checkout: string, options?: BookingOffersOptions): Promise<BookingOffer[]>`

Get available booking offers for a hotel on specific dates.

```typescript
const offers = await client.getBookingOffers(
  'ChgIqav798XohJB3GgwvZy8xMXI5cXF6eGQQAQ',
  '2026-04-13',
  '2026-04-16',
  {
    currency: 'USD',
    guests: 2,
    children: 1,
  }
);

offers.forEach(offer => {
  console.log(`${offer.provider}: ${offer.totalStay}`);
  console.log(`Room: ${offer.room}`);
  console.log(`Options: ${offer.options}`);
  console.log(`Book: ${offer.link}`);
});
```

**Parameters:**
- `googleId` (string, required) - Hotel ID
- `checkin` (string, required) - Check-in date (YYYY-MM-DD format)
- `checkout` (string, required) - Check-out date (YYYY-MM-DD format)
- `options` (optional) - Object with:
  - `currency` (string) - Currency code, default: "EUR"
  - `guests` (number) - Number of adults, default: 2
  - `children` (number) - Number of children, default: 0

**Returns:** Array of `BookingOffer` objects

**Throws:** `HotelScraperError` if no offers found or request fails

---

### `searchHotels(searchUrl: string, checkin: string, checkout: string, limit?: number, options?: BookingOffersOptions): Promise<SearchResult[]>`

Complete workflow: discover hotels, enrich them, and get booking offers (all-in-one).

```typescript
const results = await client.searchHotels(
  'https://www.google.com/travel/search?q=hotels+paris',
  '2026-04-13',
  '2026-04-16',
  10, // Process up to 10 hotels
  { currency: 'EUR' }
);

results.forEach(result => {
  console.log(`Hotel: ${result.details.hotelName}`);
  console.log(`Address: ${result.details.address}, ${result.details.city}`);
  console.log(`Available offers: ${result.offers.length}`);

  result.offers.forEach(offer => {
    console.log(`  - ${offer.provider}: ${offer.totalStay}`);
  });
});
```

**Parameters:**
- `searchUrl` (string, required) - Google Hotels search URL
- `checkin` (string, required) - Check-in date (YYYY-MM-DD)
- `checkout` (string, required) - Check-out date (YYYY-MM-DD)
- `limit` (number, optional) - Max hotels to process, default: 5
- `options` (optional) - Booking options (currency, guests, children)

**Returns:** Array of search results with hotel, details, and offers

**Throws:** `HotelScraperError` for fatal errors

---

## 🔧 Configuration

```typescript
const client = new HotelScraperClient({
  baseUrl: 'http://82.165.116.199:3000/api/hotels', // Required
  timeout: 60000, // Optional, milliseconds, default: 60000
});
```

**Configuration Options:**
- `baseUrl` (string, required) - API base URL
- `timeout` (number, optional) - Request timeout in milliseconds

### Environment-Specific Configuration

```typescript
// Development
const client = new HotelScraperClient({
  baseUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/hotels',
});

// Production
const client = new HotelScraperClient({
  baseUrl: 'http://82.165.116.199:3000/api/hotels',
});
```

---

## ✅ Type Definitions

All types are exported from the client:

```typescript
import {
  Hotel,
  HotelDetails,
  BookingOffer,
  DiscoverResult,
  BookingOffersResult,
  HotelScraperClientConfig,
  BookingOffersOptions,
  HotelScraperError,
} from './hotel-scraper-client';
```

### Core Types

```typescript
// Hotel from discovery
interface Hotel {
  name: string;
  googleId: string;
}

// Enriched hotel data
interface HotelDetails {
  hotelName: string;
  address: string;
  postalCode: string;
  city: string;
  country: string;
  phoneNumber: string;
}

// Booking offer
interface BookingOffer {
  provider: string; // "Booking.com", "Expedia", etc.
  room: string; // "Double Room", "Standard", etc.
  options: string; // "Free cancellation", "Non-refundable", etc.
  pricePerNight: string; // "€ 120"
  totalStay: string; // "€ 360"
  link: string; // Direct booking URL
}

// Search options
interface BookingOffersOptions {
  currency?: string; // e.g., "EUR", "USD"
  guests?: number; // Number of adults
  children?: number; // Number of children
}

// Error class
class HotelScraperError extends Error {
  statusCode?: number;
  originalError?: any;
}
```

---

## 🛡️ Error Handling

```typescript
import { HotelScraperError } from './hotel-scraper-client';

try {
  const hotels = await client.discoverHotels(searchUrl);
} catch (error) {
  if (error instanceof HotelScraperError) {
    console.error('API Error:', error.message);
    console.error('Status Code:', error.statusCode);
  } else {
    console.error('Unexpected error:', error);
  }
}
```

**Common Errors:**
- Invalid search URL → "No hotels found"
- Invalid hotel ID → "Failed to enrich hotel data"
- No availability → "No booking offers found"
- Network timeout → "Request timeout or network error"

---

## ⚙️ Best Practices

### 1. **Rate Limiting**
Add delays between rapid requests:

```typescript
for (const hotel of hotels) {
  const details = await client.enrichHotel(hotel.googleId);
  await new Promise(resolve => setTimeout(resolve, 2000)); // 2 sec delay
}
```

### 2. **Error Recovery**
Skip failed items, continue processing:

```typescript
for (const hotel of hotels) {
  try {
    const details = await client.enrichHotel(hotel.googleId);
  } catch (error) {
    console.warn(`Skipped ${hotel.name}: ${error.message}`);
    continue;
  }
}
```

### 3. **Parallel Requests**
Use Promise.all for independent requests:

```typescript
const [details, offers] = await Promise.all([
  client.enrichHotel(googleId),
  client.getBookingOffers(googleId, checkin, checkout),
]);
```

### 4. **Date Validation**
Always use YYYY-MM-DD format:

```typescript
// ✅ Correct
await client.getBookingOffers(id, '2026-04-13', '2026-04-16');

// ❌ Wrong
await client.getBookingOffers(id, '13-04-2026', '16-04-2026');
```

---

## 📖 Examples

See `examples.ts` for complete usage examples:

- Simple hotel discovery
- Enriching single hotel
- Getting booking offers
- Complete search workflow
- Error handling
- Batch processing with delays

---

## 🔗 Framework Integration

### React / Next.js

```typescript
import { useQuery } from '@tanstack/react-query';
import { HotelScraperClient } from './hotel-scraper-client';

const client = new HotelScraperClient({
  baseUrl: 'http://82.165.116.199:3000/api/hotels',
});

export function useHotelsDiscovery(searchUrl: string) {
  return useQuery({
    queryKey: ['hotels', searchUrl],
    queryFn: () => client.discoverHotels(searchUrl),
  });
}

export function useHotelDetails(googleId: string) {
  return useQuery({
    queryKey: ['hotel-details', googleId],
    queryFn: () => client.enrichHotel(googleId),
  });
}

export function useBookingOffers(googleId: string, checkin: string, checkout: string) {
  return useQuery({
    queryKey: ['offers', googleId, checkin, checkout],
    queryFn: () => client.getBookingOffers(googleId, checkin, checkout),
  });
}
```

---

## 📝 License

This client is part of the Hotel Scraper project.
