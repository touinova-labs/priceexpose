import { NextResponse } from 'next/server'
import { GoogleHotelMatch, isError, normalizeBookRequest, NormalizedBookRequest, RawBookRequest, resolveHotel } from '../../../../deal-finder';
import { HotelScraperClient } from '../../../../scraper';
import { normalize_BookingOffers } from '../../../../deal-finder/normalizeBookingOffers';
import { exploreUnResolved } from '../../../../data/pipeline';
import { generateCacheKey, getCachedResponse, saveCachedResponse } from '../../../lib/cache';

// Initialize HotelScraperClient
const scraperClient = new HotelScraperClient({
    baseUrl: process.env.HOTEL_SCRAPER_BASE_URL || 'http://82.165.116.199:3000/api/hotels',
    timeout: 60000
});

export async function GET() {
    try {
        await exploreUnResolved();
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('GET error:', error);
        return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
    }
}

export async function POST(request: Request) {

    try {

        var sourceRequest: RawBookRequest = await request.json();
        sourceRequest.origin.hotel_id = sourceRequest.origin.hotel_id.replace(".fr.", "."); // Normalisation temporaire des IDs Booking.fr -> Booking.com

        // 🔑 Generate cache key from request properties
        const cacheKey = generateCacheKey({
            hotelName: sourceRequest.hotelName,
            address: sourceRequest.address,
            checkIn: sourceRequest.checkIn,
            checkOut: sourceRequest.checkOut,
            travelers: sourceRequest.travelers
        });

        // 💾 Check if response is cached
        const cachedResponse = await getCachedResponse(cacheKey);
        if (cachedResponse) {
            console.log("Returning cached response");
            return NextResponse.json(cachedResponse);
        }

        const normalizedOrError = await normalizeBookRequest(sourceRequest);
        if (isError(normalizedOrError)) {
            return NextResponse.json({ hasDeal: false, ...normalizedOrError }, { status: 400 });
        }
        const normalized = normalizedOrError as NormalizedBookRequest;
        console.log("Normalized Request:", normalized);


        var hotelOrError = await resolveHotel(normalized);
        if (isError(hotelOrError)) {
            return NextResponse.json({ hasDeal: false, ...hotelOrError }, { status: 404 });
        }
        const hotel = hotelOrError as GoogleHotelMatch;
        console.log("Resolved Hotel:", hotel);

        // Use HotelScraperClient instead of google_detail
        const bookingOffers = await scraperClient.getBookingOffers(
            hotel.propertyToken,
            normalized.checkIn,
            normalized.checkOut,
            {
                currency: normalized.currency,
                guests: normalized.adults,
                children: normalized.children
            }
        );

        if (!bookingOffers || bookingOffers.length === 0) {
            return NextResponse.json({ hasDeal: false, error: "No offers found" }, { status: 200 });
        }
        console.log("Raw Booking Offers:", bookingOffers.length);

        const normalizeBookingOffers = await normalize_BookingOffers(bookingOffers);
        if (!normalizeBookingOffers) {
            return NextResponse.json({ hasDeal: false, error: "Failed to normalize booking from provider" }, { status: 500 });
        }
        console.log("Normalized Booking Offers:", normalizeBookingOffers.length);

        // Le prix de référence Booking (le minimum trouvé sur la page)
        const totalBooking = normalized.leadOffer.parsed_total;
        console.log("Total Booking Reference:", totalBooking);

        // Transform bookingOffers to the format expected by the rest of the code
        // todo normalize total_stay to a number (remove currency symbol, handle different formats)
        const validDeals = normalizeBookingOffers
            .map(offer => {
                return {
                    name: offer.provider.replace(/\n+/g, " "),
                    totalPrice: offer.totalStay,
                    link: offer.link,
                    isOfficial: false
                };
            })
            .filter(d => d.totalPrice > 0)
            .filter((deal, index, self) =>
                index === self.findIndex((t) => (
                    t.name === deal.name && t.totalPrice === deal.totalPrice
                ))
            )
            .sort((a, b) => a.totalPrice - b.totalPrice)
            ;

        console.log("Valid Deals:", validDeals.length);
        const top3Deals = validDeals
            .slice(0, 3); // On prend les 3 premiers après le tri par prix

        if (top3Deals.length > 0) {
            // 2. On vérifie si au moins le MEILLEUR deal respecte tes conditions de sécurité
            const best = top3Deals[0];
            const savings = totalBooking - best.totalPrice;
            const savingsPercent = (savings / totalBooking) * 100;

            if (savingsPercent >= 2 && savingsPercent <= 40) {

                // 3. On formate les 3 deals proprement
                const formattedDeals = top3Deals.map(deal => {
                    let finalUrl = deal.link;
                    try {
                        // Extraction de la destination réelle (pcurl)
                        const urlObj = new URL(deal.link);
                        const pcurl = urlObj.searchParams.get('pcurl');
                        if (pcurl) finalUrl = pcurl;
                    } catch (e) {
                        // Si l'URL n'est pas standard, on garde l'originale
                    }

                    return {
                        source: deal.name,
                        totalPrice: deal.totalPrice,
                        savings: Math.round(totalBooking - deal.totalPrice),
                        url: `${finalUrl}&utm_source=priceexpose&px_track=true`,
                        isOfficial: deal.isOfficial
                    };
                });

                const dealResponse = {
                    name: sourceRequest.hotelName,
                    hasDeal: true,
                    currency: normalized.leadOffer.currency,
                    totalBooking: totalBooking,
                    bestSavings: Math.round(savings),
                    bestSavingsPercent: Math.round(savingsPercent),
                    deals: formattedDeals // On renvoie le tableau complet
                };

                // 💾 Cache the successful response
                await saveCachedResponse(cacheKey, dealResponse);

                return NextResponse.json(dealResponse);
            }
        }

        const noDealResponse = { hasDeal: false };
        
        // 💾 Cache the "no deal" response
        await saveCachedResponse(cacheKey, noDealResponse);

        return NextResponse.json(noDealResponse);


    } catch (error) {
        console.error("Erreur SerpApi:", error);
        return NextResponse.json({
            success: false,
            error: "Impossible de récupérer les prix Google Hotels"
        }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*', // Ou l'ID de ton extension pour plus de sécurité
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
