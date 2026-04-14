

export interface NormalizedBookOffer {
    provider: string;
    room: string;
    link: string
    total: number,// Total price for the stay, Number only (e.g., "€ 552" -> 552)
    nightly: number, // price per night: Number only, remove any currency symbols or separators
    currency: string,
    is_refundable: boolean, // true if the offer is refundable, false otherwise
    deadline: string | null, // cancellation deadline Date or null
    breakfast: boolean // true if breakfast is included, false otherwise
    breakfast_value: number // if "breakfast" is included, extract the price of the breakfast  if specified. Otherwise 0.
}


export interface RawBookingOffer {
    "room": string;
    "options": string;
    "total_stay": string;
}
/**
 * Requête de booking brute reçue
 */
export interface RawBookRequest {
    origin: { hotel_id: string, name: "BOOKING" | "TRAVELGUESS" };
    // Basic hotel information
    hotelName: string;
    address: string;

    // Dates and occupancy
    checkIn: string;
    checkOut: string;
    destination: string;
    travelers: string;

    // Detailed per-room data from hprt-table
    bookingOffers: RawBookingOffer[];

    gl: string; // Google locale (e.g., "us", "fr")
    hl: string// Google language (e.g., "en", "fr")

    context: {
        city?: string;
        country?: string;
        currency?: string;
        language?: string;
    };
    stay: {
        checkIn?: string;
        checkOut?: string;
        nights?: number;
    };
    guests: {
        adults?: number;
        children?: number;
        ages?: number[];
    };
}

/**
 * Requête de booking normalisée
 */
export interface NormalizedBookRequest {
    origin: { hotel_id: string, name: "BOOKING" | "TRAVELGUESS" };
    hotelName: string;
    address: string;
    checkIn: string; // Format: YYYY-MM-DD
    checkOut: string; // Format: YYYY-MM-DD
    destination: string;
    adults: number;
    children: number;
    rooms: number;
    currency: string;
    locale: string;
    language: string;
    leadOffer: NormalizedBookingOffer;
}

export interface NormalizedBookingOffer extends RawBookingOffer {
    parsed_total: number;
    currency: string
}

/**
 * Résultat de la recherche de l'hôtel sur Google
 */
export interface GoogleId {
    propertyToken: string;
}

/**
 * Résultat final avec deals consolidés
 */
export interface DealFinderResult {
    hotelName: string;
    address: string;
    checkIn: string;
    checkOut: string;
    currency: string;
    totalNights: number;
    deals: NormalizedBookOffer[];
    source: "google";
    timestamp: string;
}

/**
 * Erreur structurée du deal finder
 */
export interface DealFinderError {
    code: string;
    message: string;
    details?: any;
}

export interface UnresolvedHotelRequest {
    hotelName: string;
    address: string;
    destination: string;
    sourcePlatform: string;
    sourcePlatformId: string;
    timestamp: string;
    attempted: number;
    city: string,
    country: string
}