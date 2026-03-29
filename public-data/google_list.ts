import { proxyConfig, proxyUrl } from "./config"
import { scrapeData } from "./generic"

export interface HotelInfo {
    name: string;
    price_per_night: string;
    total_price: string;
    note: string;
    link: string;
}

export async function google_list(): Promise<HotelInfo[]> {
    const url = "https://www.google.com/travel/search?q=hotels%20paris"
    const checkin = "2026-04-10", checkout = "2026-05-15"
    return await scrapeData({
        url,
        proxyUrl: proxyUrl,
        proxyAuth: proxyConfig
    }, (page) => hotels_extractor(page, checkin, checkout)
    );
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function hotels_extractor(page: any, checkin: string, checkout: string) {


    // --- ÉTAPE 1 : Ouvrir le calendrier ---
    console.log("📅 Ouverture du calendrier...");
    await page.waitForSelector('input[jsname="yrriRe"]', { visible: true });
    const dateInputs = await page.$$('input[jsname="yrriRe"]');

    // Utilisation de l'index 0 (Arrivée) pour plus de fiabilité
    await dateInputs[2].click();
    await delay(800);

    // --- ÉTAPE 2 : Navigation Mois (Optimisée) ---
    console.log("⏭️ Navigation vers Mai 2026...");
    let limit = 0;
    const nextBtnSelector = 'button[jsname="KpyLEe"][aria-label="Next"]';

    while (limit < 6) {
        const dateTarget = await page.$(`div[data-iso="${checkin}"]`);
        if (dateTarget) {
            console.log("✅ Mois de Mai visible.");
            break;
        }
        await page.waitForSelector(nextBtnSelector);
        await page.click(nextBtnSelector);
        await delay(400); // Délai réduit pour être plus rapide
        limit++;
    }

    // --- ÉTAPE 3 : Sélection des dates ---
    console.log(`📍 Sélection : ${checkin} -> ${checkout}`);
    await page.waitForSelector(`div[data-iso="${checkin}"] [role="button"]`);
    await page.click(`div[data-iso="${checkin}"] [role="button"]`);
    await delay(300);
    await page.click(`div[data-iso="${checkout}"] [role="button"]`);
    await delay(300);

    // Valider OK
    await page.click('button[jsname="iib5kc"]');

    // ⚡ OPTIMISATION 3 : Attente ciblée au lieu de delay fixe
    console.log("⏳ Chargement des résultats...");
    // On attend que la barre de progression (loader bleu) disparaisse s'il y en a une,
    // ou simplement que les cartes soient visibles.
    await page.waitForSelector('.uaTTDe', { visible: true, timeout: 15000 });
    await delay(1500); // Petit tampon pour laisser les prix se stabiliser

    // --- ÉTAPE 4 : Extraction JSON ---
    const results = await page.evaluate(() => {
        const baseUrl = "https://www.google.com";
        const getFullUrl = (el: any) => {
            if (!el) return "N/A";
            const href = el.getAttribute('href');
            if (!href) return "N/A";
            return href.startsWith('http') ? href : baseUrl + href;
        };

        const cards = document.querySelectorAll('.uaTTDe');
        return Array.from(cards).map((hotel: any) => {
            const nameEl = hotel.querySelector('.BgYkof');
            const priceEl = hotel.querySelector('.qQOQpe');
            const prixTotal = hotel.querySelector('.CQYfx.UDzrdc');
            const lienPrincipal = hotel.querySelector('a.PVOOXe');
            const lienPrix = hotel.querySelector('a.aS3xV');
            const noteEl = hotel.querySelector('.KFi5wf');

            return {
                name: nameEl?.innerText.trim() || "N/A",
                price_per_night: priceEl?.innerText.trim() || "N/A",
                total_price: prixTotal?.innerText.trim() || "N/A",
                note: noteEl?.innerText.trim() || "N/A",
                link: lienPrix ? getFullUrl(lienPrix) : getFullUrl(lienPrincipal)
            };
        });
    });

    console.log(`✅ Extraction réussie : ${results.length} hôtels trouvés.`);
    return results;
} 
