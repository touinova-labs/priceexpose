import { NextResponse } from 'next/server'
import type { RawBookRequest } from './ai.helper';
export const dynamic = 'force-dynamic';

// Initialisation du dossier de cache

export async function GET() {
    const { google_detail } = await import('../../../../public-data/google_detail');
    
    const params = {
        engine: 'google_hotels',
        q: 'Paris Hotel Monge',
        check_in_date: '2026-04-13',
        check_out_date: '2026-04-16',
        adults: 2,
        children: 0,
        currency: 'EUR',
        gl: 'fr',
        hl: 'fr'
    }
    // monge
    var results = await google_detail("ChgIqav798XohJB3GgwvZy8xMXI5cXF6eGQQAQ", params.check_in_date, params.check_out_date, params.currency, params.adults, params.children);
    if (!results) {
        return NextResponse.json({ success: false, error: "No offers found" }, { status: 404 });
    }
    if (!results) {
        return NextResponse.json({ success: false, error: "No offers found" }, { status: 404 });
    }
    // var g = await normalizeGoogleOffers(results)
    // console.log(g);
    return NextResponse.json(results);
}

export async function POST2(request: Request) {
    const data = await request.json();
    return NextResponse.json({
        name: data.hotelName,
        hasDeal: true,
        currency: "EUR",
        totalBooking: 50,
        type: "BACKEND_RESPONSE",
        deals: [
            {
                source: "SITE 1",
                totalPrice: 12,
                url: "https://opdp.com",
                isOfficial: false,
            },
            {
                source: "SITE 2",
                totalPrice: 34,
                url: "https://opdp.com",
                isOfficial: false,
            },
        ]
    });
}


export async function POST(request: Request) {
    const { getLeadOffer, parseOccupancy, parseTravelDates, normalizeGoogleOffers } = await import('./ai.helper');
    const { google_detail } = await import('../../../../public-data/google_detail');
    
    var sourceRequest: RawBookRequest = await request.json();

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
        console.log("Google Hotels Params:", params);

        var results = await google_detail("ChgIqav798XohJB3GgwvZy8xMXI5cXF6eGQQAQ", params.check_in_date, params.check_out_date, leadOffer.currency, occupancy.adults, occupancy.children);
        if (!results) {
            return NextResponse.json({ success: false, error: "No offers found" }, { status: 404 });
        }
        var normalizedResults = await normalizeGoogleOffers(results);

        // Le prix de référence Booking (le minimum trouvé sur la page)
        const totalBooking = leadOffer.parsed_total; // On utilise le prix "room only" de l'offre la moins chère comme référence pour le deal (plutôt que le prix avec petit-déjeuner)

        console.log("Total Booking Reference:", totalBooking);
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
            .filter((deal, index, self) =>
                index === self.findIndex((t) => (
                    t.name === deal.name && t.totalPrice === deal.totalPrice
                ))
            )
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
                    name: sourceRequest.hotelName,
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
