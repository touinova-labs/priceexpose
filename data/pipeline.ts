import { v4 as uuidv4 } from "uuid";
import { HotelDBEntry, loadHotelsDatabase, loadUnresolvedRequests, removeFromUnresolved, upsertHotelInDB } from "../deal-finder/hotels.database";
import { HotelScraperClient } from "../scraper";
import { resolveHotel } from "../deal-finder";

const scraperClient = new HotelScraperClient({
    baseUrl: process.env.HOTEL_SCRAPER_BASE_URL || 'http://82.165.116.199:3000/api/hotels',
    timeout: 60000
});


export async function exploreUnResolved() {
    const unresolved = await loadUnresolvedRequests();
    for (const request of unresolved) {
        console.log(`Exploring unresolved request for ${request.hotelName} (${request.sourcePlatform})`);
        try {
            const searchUrl = `https://www.google.com/travel/search?q=${encodeURIComponent(request.hotelName + " " + request.destination)}`;
            const data = await scraperClient.discoverHotels(searchUrl);
            if (data instanceof Array) {
                for (const item of data) {
                    const hotel: HotelDBEntry = {
                        id: uuidv4(),
                        name: item.name,
                        platformIds: {
                            google: item.googleId,
                        },
                        resolvedAt: new Date().toISOString(),
                        resolvedBy: "NOT_RESOLVED_YET"
                    };
                    await upsertHotelInDB(hotel);
                    await enrichHotel(hotel.id, item.googleId);
                    await resolveHotel({
                        hotelName: request.hotelName,
                        address: request.address,
                        destination: request.destination,
                        origin: {
                            name: request.sourcePlatform,
                            hotel_id: request.sourcePlatformId
                        }
                    });
                }
                console.log(`Unexpected array result for ${request.hotelName}:`, data);
                continue;
            } else if ('popup' in data && data.popup) {
                console.log(`Popup result for ${request.hotelName}:`, data);
                const hotel: HotelDBEntry = {
                    id: uuidv4(),
                    name: request.hotelName,
                    platformIds: {
                        google: data.googleId,
                        [request.sourcePlatform.toLowerCase()]: request.sourcePlatformId
                    },
                    location: {
                        address: data.street_address,
                        postal_code: data.postal_code,
                        city: data.city,
                        country: data.country
                    },
                    telephone_number: data.telephone_number,
                    resolvedAt: new Date().toISOString(),
                    resolvedBy: "AUTO_RESOLVE"
                };
                await upsertHotelInDB(hotel);
            }
            await removeFromUnresolved(request.sourcePlatform, request.sourcePlatformId);
        } catch (e) {
            console.error(`Error exploring unresolved request for ${request.hotelName}:`, e);
        }
    }
}


export async function enrichIfNeeded() {
    const db = await loadHotelsDatabase();
    const to_enrich = db.filter(h => !h.location);
    console.log(`Hotels to enrich: ${to_enrich.length}`);
    for (const hotel of to_enrich) {
        console.log(`Enriching hotel: ${hotel.name} (${hotel.id})`);
        await enrichHotel(hotel.id, hotel.platformIds.google);
    }
}


async function enrichHotel(id: string, googleId: string) {
    try {
        const details = await scraperClient.enrichHotel(googleId);
        if (details) {
            const updated = {
                id: id,
                location: {
                    address: details.street_address,
                    postal_code: details.postal_code,
                    city: details.city,
                    country: details.country
                },
                telephone_number: details.telephone_number,
            };
            await upsertHotelInDB(updated);
        } else {
            console.warn(`No details found for ${googleId} (${id})`);
        }
    } catch (e) {
        console.error(`Error enriching hotel ${id}:`, e);
    }
}

