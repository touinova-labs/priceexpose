import { v4 as uuidv4 } from "uuid";
import { findHotelByPlatformId, HotelDBEntry, loadHotelById, loadHotelsDatabase, loadUnresolvedRequests, removeFromUnresolved, updateHotelInDatabase, upsertHotelInDB } from "../deal-finder/hotels.database";
import { HotelScraperClient } from "../scraper";
import { UnresolvedHotelRequest } from "../deal-finder";
import { cleanHotelName, getGoogleId, getMatchUsingAI } from "../deal-finder/hotels-database-resolver";

const scraperClient = new HotelScraperClient({
    baseUrl: process.env.HOTEL_SCRAPER_BASE_URL || "http://localhost:3001/api/hotels",
    timeout: 60000
});

async function getBookingFullAddress(req: UnresolvedHotelRequest) {
    let local = ""
    if (req.country === "France") local = "fr"
    if (req.country === "Singapore") local = "sg"
    if (req.country === "India") local = "in"
    if (local === "")
        throw Error("no local for taht country : " + req.country)
    const url = `https://www.booking.com/hotel/${local}/${req.sourcePlatformId}`
    return await scraperClient.getBookingFullAddress(url);
}

export async function exploreUnResolved() {
    const unresolved = (await loadUnresolvedRequests());
    for (const request of unresolved) {
        console.log(`Exploring unresolved request for ${request.hotelName} (${request.sourcePlatform})`);
        const { address: fullAdress } = await getBookingFullAddress(request)
        if (!fullAdress) {
            console.log("cound not get the full address")
            continue;
        }

        const platformResult = await getGoogleId(request.sourcePlatform, request.sourcePlatformId);
        if (platformResult) {
            await removeFromUnresolved(request.sourcePlatform, request.sourcePlatformId);
            continue;
        }

        try {
            const cleanQuery = await cleanHotelName(request)
            console.log("clean name for search hotel : ", cleanQuery)
            if (!cleanQuery) continue;
            const searchUrl = `https://www.google.com/travel/search?q=${encodeURIComponent(cleanQuery.search_query)}`;
            const data = await scraperClient.discoverHotels(searchUrl);

            let resolved = false
            if (data instanceof Array) {
                const used = data.slice(0, 3)
                const candidates: HotelDBEntry[] = []
                for (const item of used) {
                    const { found, hotel } = await findHotelByPlatformId("google", item.googleId)
                    console.log("found", found)
                    let hotel_id = hotel?.id
                    if (!found) {
                        hotel_id = uuidv4()
                        const hotel: HotelDBEntry = {
                            id: hotel_id,
                            name: item.name,
                            platformIds: {
                                google: item.googleId,
                            },
                            resolvedAt: new Date().toISOString(),
                            resolvedBy: "NOT_RESOLVED_YET"
                        };
                        await upsertHotelInDB(hotel);
                        await enrichHotel(hotel.id, item.googleId);
                    }

                    const candidate = await loadHotelById(hotel_id!);
                    if (candidate) candidates.push(candidate)
                }

                const matchCandidate = await getMatchUsingAI(candidates, {
                    name: cleanQuery.clean_name,
                    address: fullAdress,
                    city: request.city,
                    country: request.country,
                });
                if (matchCandidate !== null) {
                    await updateHotelInDatabase(matchCandidate, request.sourcePlatform.toLowerCase(), request.sourcePlatformId);
                    resolved = true
                }
            } else if ('popup' in data && data.popup) {
                console.log(`Popup result for ${request.hotelName}:`, data);
                const hotel: HotelDBEntry = {
                    id: uuidv4(),
                    name: data.hotel_name ?? request.hotelName,
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
                resolved = true
            }
            if (resolved)
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

