import { NextResponse } from 'next/server'
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { getLeadOffer, normalizeGoogleOffers, parseOccupancy, parseTravelDates, RawBookRequest } from './ai.helper';
import { google_detail } from '../../../../public-data/google_detail';

const CACHE_DIR = path.join(process.cwd(), 'cache_hotels');
const CACHE_EXPIRATION_MS = 12 * 60 * 60 * 1000; // 12h

// Initialisation du dossier de cache
async function initCache() {
    try {
        await fs.access(CACHE_DIR);
    } catch {
        await fs.mkdir(CACHE_DIR, { recursive: true });
    }
}

export async function GET(request: Request) {
    const checkin = "2026-04-14", checkout = "2026-04-16"
    var results = await google_detail("ChgIqav798XohJB3GgwvZy8xMXI5cXF6eGQQAQ", checkin, checkout, "EUR", 2, 0);
    if (!results) {
        return NextResponse.json({ success: false, error: "No offers found" }, { status: 404 });
    }
    // var g = await normalizeGoogleOffers(results)
    // console.log(g);
    return NextResponse.json(results);
}

export async function POST(request: Request) {
    var sourceRequest: RawBookRequest =
        // {
        //     "hotelName": "Hotel Monceau Wagram",
        //     "address": "7, Rue Rennequin, 17th arr., 75017 Paris, France",
        //     "checkIn": "Wed, Apr 15",
        //     "checkOut": "Sat, Apr 18",
        //     "destination": "Paris",
        //     "travelers": "Number of travelers and rooms. Currently selected: 2 adults · 0 children · 1 room",
        //     "bookingOffers": [
        //         {
        //             "provider": "Booking.com",
        //             "room": "Standard Double Room | 1 full bed | 15 m²",
        //             "options": "Good   breakfast US$21 | Free cancellation before April 13, 2026 | No prepayment needed – pay at the property | •\n\n\n\nWe have 4 left",
        //             "price_per_night": "$ 696",
        //             "total_stay": "$ 696",
        //             "link": "https://www.booking.com/hotel/fr/monceauwagram.html?aid=304142&label=gen173nr-10CAEoggI46AdIM1gEaE2IAQGYATO4AQfIAQzYAQPoAQH4AQGIAgGoAgG4ApWgls4GwAIB0gIkOGEyZmVkNDAtZGIwMy00YWQ4LTgxOWUtMzJlZjgxOWZhZjFj2AIB4AIB&sid=2149d102e8ce1e54bc954a232367ee41&all_sr_blocks=5104616_279745981_0_2_0&checkin=2026-04-15&checkout=2026-04-18&dest_id=-1456928&dest_type=city&dist=0&group_adults=2&group_children=0&hapos=2&highlighted_blocks=5104616_279745981_0_2_0&hpos=2&matching_block_id=5104616_279745981_0_2_0&nflt=ht_id%3D204&no_rooms=1&req_adults=2&req_children=0&room1=A%2CA&sb_price_type=total&sr_order=popularity&sr_pri_blocks=5104616_279745981_0_2_0__60170&srepoch=1774555176&srpvid=a3d48c8d3131005d&type=total&ucfs=1&"
        //         },
        //         {
        //             "provider": "Booking.com",
        //             "room": "Deluxe Double Room with Terrace | 1 queen bed | 17 m²",
        //             "options": "Good   breakfast US$21 | Free cancellation before April 13, 2026 | No prepayment needed – pay at the property | •\n\n\n\nWe have 1 left",
        //             "price_per_night": "$ 773",
        //             "total_stay": "$ 773",
        //             "link": "https://www.booking.com/hotel/fr/monceauwagram.html?aid=304142&label=gen173nr-10CAEoggI46AdIM1gEaE2IAQGYATO4AQfIAQzYAQPoAQH4AQGIAgGoAgG4ApWgls4GwAIB0gIkOGEyZmVkNDAtZGIwMy00YWQ4LTgxOWUtMzJlZjgxOWZhZjFj2AIB4AIB&sid=2149d102e8ce1e54bc954a232367ee41&all_sr_blocks=5104616_279745981_0_2_0&checkin=2026-04-15&checkout=2026-04-18&dest_id=-1456928&dest_type=city&dist=0&group_adults=2&group_children=0&hapos=2&highlighted_blocks=5104616_279745981_0_2_0&hpos=2&matching_block_id=5104616_279745981_0_2_0&nflt=ht_id%3D204&no_rooms=1&req_adults=2&req_children=0&room1=A%2CA&sb_price_type=total&sr_order=popularity&sr_pri_blocks=5104616_279745981_0_2_0__60170&srepoch=1774555176&srpvid=a3d48c8d3131005d&type=total&ucfs=1&"
        //         },
        //         {
        //             "provider": "Booking.com",
        //             "room": "Superior Romantic Double Room | 1 king bed | 16 m²",
        //             "options": "Good   breakfast US$21 | Free cancellation before April 13, 2026 | No prepayment needed – pay at the property | •\n\n\n\nWe have 1 left",
        //             "price_per_night": "$ 791",
        //             "total_stay": "$ 791",
        //             "link": "https://www.booking.com/hotel/fr/monceauwagram.html?aid=304142&label=gen173nr-10CAEoggI46AdIM1gEaE2IAQGYATO4AQfIAQzYAQPoAQH4AQGIAgGoAgG4ApWgls4GwAIB0gIkOGEyZmVkNDAtZGIwMy00YWQ4LTgxOWUtMzJlZjgxOWZhZjFj2AIB4AIB&sid=2149d102e8ce1e54bc954a232367ee41&all_sr_blocks=5104616_279745981_0_2_0&checkin=2026-04-15&checkout=2026-04-18&dest_id=-1456928&dest_type=city&dist=0&group_adults=2&group_children=0&hapos=2&highlighted_blocks=5104616_279745981_0_2_0&hpos=2&matching_block_id=5104616_279745981_0_2_0&nflt=ht_id%3D204&no_rooms=1&req_adults=2&req_children=0&room1=A%2CA&sb_price_type=total&sr_order=popularity&sr_pri_blocks=5104616_279745981_0_2_0__60170&srepoch=1774555176&srpvid=a3d48c8d3131005d&type=total&ucfs=1&"
        //         },
        //         {
        //             "provider": "Booking.com",
        //             "room": "Superior Triple Room | 1 full bed\n\n\nand\n\n\n\n1 sofa bed | 20 m²",
        //             "options": "Good   breakfast US$21 | Free cancellation before April 13, 2026 | No prepayment needed – pay at the property | •\n\n\n\nWe have 1 left",
        //             "price_per_night": "$ 849",
        //             "total_stay": "$ 849",
        //             "link": "https://www.booking.com/hotel/fr/monceauwagram.html?aid=304142&label=gen173nr-10CAEoggI46AdIM1gEaE2IAQGYATO4AQfIAQzYAQPoAQH4AQGIAgGoAgG4ApWgls4GwAIB0gIkOGEyZmVkNDAtZGIwMy00YWQ4LTgxOWUtMzJlZjgxOWZhZjFj2AIB4AIB&sid=2149d102e8ce1e54bc954a232367ee41&all_sr_blocks=5104616_279745981_0_2_0&checkin=2026-04-15&checkout=2026-04-18&dest_id=-1456928&dest_type=city&dist=0&group_adults=2&group_children=0&hapos=2&highlighted_blocks=5104616_279745981_0_2_0&hpos=2&matching_block_id=5104616_279745981_0_2_0&nflt=ht_id%3D204&no_rooms=1&req_adults=2&req_children=0&room1=A%2CA&sb_price_type=total&sr_order=popularity&sr_pri_blocks=5104616_279745981_0_2_0__60170&srepoch=1774555176&srpvid=a3d48c8d3131005d&type=total&ucfs=1&"
        //         }
        //     ],
        //     gl: 'us',
        //     hl: 'en'
        // }
        await request.json();

    const leadOffer = await getLeadOffer(sourceRequest.bookingOffers);
    console.log("Lead Offer:", leadOffer);
    if (!leadOffer) {
        return NextResponse.json({ hasDeal: false });
    }

    var occupancy = await parseOccupancy(sourceRequest.travelers);
    var travel_dates = await parseTravelDates(sourceRequest.checkIn, sourceRequest.checkOut);
    try {
        const params = {
            engine: "google_hotels",
            q: `${sourceRequest.destination} ${sourceRequest.hotelName}`,
            check_in_date: travel_dates ? travel_dates.check_in : formatDateForAPI(sourceRequest.checkIn),
            check_out_date: travel_dates ? travel_dates.check_out : formatDateForAPI(sourceRequest.checkOut),
            adults: occupancy.adults.toString(),
            children: occupancy.children.toString(),
            currency: leadOffer.currency,
            gl: sourceRequest.gl,
            hl: sourceRequest.hl,
        };

        var results = await google_detail("ChgIqav798XohJB3GgwvZy8xMXI5cXF6eGQQAQ", params.check_in_date, params.check_out_date, leadOffer.currency, occupancy.adults, occupancy.children);
        if (!results) {
            return NextResponse.json({ success: false, error: "No offers found" }, { status: 404 });
        }
        var normalizedResults = await normalizeGoogleOffers(results);

        // Le prix de référence Booking (le minimum trouvé sur la page)
        const totalBooking = leadOffer.parsed_total; // On utilise le prix "room only" de l'offre la moins chère comme référence pour le deal (plutôt que le prix avec petit-déjeuner)

        const validDeals = normalizedResults
            // .filter(p => p.source.toLowerCase() !== 'booking.com')
            .map(p => {

                return {
                    name: p.provider,
                    totalPrice: p.total,
                    link: p.link,
                    isOfficial: false
                };
            })
            .filter(d => d.totalPrice > 0)
            .sort((a, b) => a.totalPrice - b.totalPrice)
            ;

        console.log("Valid Deals:", validDeals, totalBooking);
        const top3Deals = validDeals
            .slice(0, 3); // On prend les 3 premiers après le tri par prix

        if (top3Deals.length > 0) {
            // 2. On vérifie si au moins le MEILLEUR deal respecte tes conditions de sécurité
            const best = top3Deals[0];
            const savings = totalBooking - best.totalPrice;
            const savingsPercent = (savings / totalBooking) * 100;

            if (savingsPercent >= 3 && savingsPercent <= 30) {

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

                return NextResponse.json({
                    hasDeal: true,
                    currency: leadOffer.currency,
                    totalBooking: totalBooking,
                    bestSavings: Math.round(savings),
                    bestSavingsPercent: Math.round(savingsPercent),
                    deals: formattedDeals // On renvoie le tableau complet
                });
            }
        }

        return NextResponse.json({ hasDeal: false });


    } catch (error) {
        console.error("Erreur SerpApi:", error);
        return NextResponse.json({
            success: false,
            error: "Impossible de récupérer les prix Google Hotels"
        }, { status: 500 });
    }
}

/**
 * Transforme "Fri, Apr 24" ou "24 avr. 2026" en "2026-04-24"
 */
function formatDateForAPI(dateInput: string | Date): string {
    let date: Date;

    if (dateInput instanceof Date) {
        date = dateInput;
    } else {
        // Si l'année manque (ex: "Fri, Apr 24"), on l'ajoute
        const year = new Date().getFullYear(); // 2026
        const dateString = dateInput.includes(year.toString())
            ? dateInput
            : `${dateInput} ${year}`;

        date = new Date(dateString);
    }

    // Sécurité si la date est invalide
    if (isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0];
    }

    // Formatage YYYY-MM-DD local (évite les décalages de fuseau horaire de toISOString)
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');

    return `${y}-${m}-${d}`;
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
