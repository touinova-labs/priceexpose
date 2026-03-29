import { proxyConfig, proxyUrl } from "./config"
import { scrapeData } from "./generic"
import { ElementHandle, Page } from 'puppeteer';

export interface BookingOffer {
    "provider": string;
    "room": string;
    "options": string;
    "price_per_night": string;
    "total_stay": string;
    "link": string
}
// currency + total séjour 
// check 

export interface NormalizedBookingOffer {
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

export async function google_detail(property_token: string, checkin: string, checkout: string, currency: string, guests = 2, children = 0): Promise<BookingOffer[] | null> {
    const url = `https://www.google.fr/travel/hotels/entity/${property_token}/prices`
    const data = await scrapeData({
        url,
        proxyUrl: proxyUrl,
        proxyAuth: proxyConfig
    }, (page) => book_offers_extractor(page, checkin, checkout, currency, guests, children));

    if (!data) {
        console.error("❌ Aucune donnée récupérée.");
        return null;
    }
    return data
        .filter((offer: BookingOffer) => !(offer.room === "UNKNOWN" && offer.options.trim() === ""))
        .filter((offer: BookingOffer) => offer.room === "UNKNOWN"); //on evite les offres des partenaires
}

/**
 * Trouve l'élément réellement visible parmi une liste de sélecteurs
 */
async function findVisible(page: Page, selector: string): Promise<ElementHandle | null> {
    const elements = await page.$$(selector);
    for (const el of elements) {
        const box = await el.boundingBox();
        if (box && box.width > 0 && box.height > 0) return el;
    }
    return null;
}

/**
 * RÉGLAGE DES VOYAGEURS (VERSION PURE PUPPETEER)
 */
async function setGuests(page: Page, adults: number, children: number = 0) {
    console.log(`👥 Réglage dynamique : ${adults} adultes, ${children} enfants`);

    // 1. Ouvrir le menu Voyageurs
    const trigger = await findVisible(page, 'div[jsname="kj0dLd"]');
    if (!trigger) {
        console.error("❌ Menu Voyageurs introuvable");
        return false;
    }
    await trigger.click();
    await _wait(600);

    // Helper interne pour ajuster un compteur spécifique
    const adjustCount = async (parentJsName: string, target: number) => {
        // On récupère le parent spécifique (Adultes ou Enfants)
        const parents = await page.$$(`div[jsname="${parentJsName}"]`);
        let activeParent: ElementHandle | null = null;

        for (const p of parents) {
            if (await p.boundingBox()) { activeParent = p; break; }
        }

        if (!activeParent) return false;

        let safety = 0;
        while (safety < 10) {
            // Récupérer la valeur actuelle
            const countHandle = await activeParent.$('span[jsname="yvdD4c"]');
            const currentText = await page.evaluate((el: any) => el.textContent, countHandle);
            let current = parseInt(currentText || "0");

            if (current === target) break;

            // Déterminer le bouton (+ ou -)
            const btnJsName = (current < target) ? "TdyTDe" : "DUGJie";
            const btn = await activeParent.$(`button[jsname="${btnJsName}"]`);

            if (btn) {
                const isDisabled = await page.evaluate(el => el.hasAttribute('disabled'), btn);
                if (isDisabled) {
                    break;
                }
                await btn.click();
                await _wait(400); // Délai pour l'update du DOM
            } else {
                break;
            }
            safety++;
        }
        return true
    };

    // 2. Ajuster les Adultes (LBceb) et les Enfants (YKt5od)
    if (! await adjustCount("LBceb", adults)) return false;
    if (! await adjustCount("YKt5od", children)) return false;

    // 3. Valider (Bouton OK jsname="kZlJze")
    const okBtn = await findVisible(page, 'button[jsname="kZlJze"]');
    if (okBtn) {
        await okBtn.click();
        return true;
    }
    return false;
}

/**
 * Utilitaire pour attendre que le loader Google disparaisse
 */
async function waitForGoogleLoad(page: Page) {
    const loaderSelector = 'div[jsname="P1ekSe"][role="progressbar"]';
    try {
        // On attend que le loader soit soit absent, soit avec aria-hidden="true"
        await page.waitForFunction((sel) => {
            const el = document.querySelector(sel);
            return !el || el.getAttribute('aria-hidden') === 'true';
        }, { timeout: 10000 }, loaderSelector);
    } catch (e) {
        console.log("⚠️ Le loader a mis trop de temps à disparaître, on continue...");
    }
}

const _wait = (ms: number) => new Promise(r => setTimeout(r, ms));


async function setDates(page: Page, checkin: string, checkout: string) {
    console.log(`📅 Configuration des dates : ${checkin} -> ${checkout}`);

    // --- 1. OUVERTURE DU CALENDRIER (Cible le 3ème input) ---
    await page.evaluate(() => {
        const inputs = document.querySelectorAll('input[jsname="yrriRe"]');
        if (inputs[2]) {
            (inputs[2] as HTMLInputElement).click();
        } else {
            console.error("❌ Le troisième input [2] est introuvable");
        }
    });
    await page.waitForSelector('div[jsname="Sx9Kwc"]', { visible: true });
    await _wait(800);

    const selectDate = async (targetIso: string, label: string) => {
        let attempts = 0;
        while (attempts < 15) {
            // Utilisation de evaluate pour vérifier la géométrie réelle (Viewport du calendrier)
            const visibilityStatus = await page.evaluate((iso) => {
                const container = document.querySelector('div[jsname="Sx9Kwc"]');
                const cell = document.querySelector(`div[data-iso="${iso}"]`);

                if (!container || !cell) return { isVisible: false, exists: !!cell };

                const cR = container.getBoundingClientRect();
                const cellR = cell.getBoundingClientRect();

                // Vérification stricte 4 axes : la cellule doit être entièrement dans le conteneur
                const isInside = (
                    cellR.top >= cR.top &&
                    cellR.bottom <= cR.bottom &&
                    cellR.left >= cR.left &&
                    cellR.right <= (cR.left + cR.width) &&
                    cellR.width > 0
                );

                // 2. Vérification si la date est désactivée (grisée)
                // Google utilise souvent aria-disabled ou une classe spécifique
                const isDisabled = cell.getAttribute('aria-hidden') === 'true'

                return { isVisible: isInside, exists: true, isDisabled: isDisabled };
            }, targetIso);

            if (visibilityStatus.exists && visibilityStatus.isDisabled) {
                console.error(`❌ La date ${targetIso} est désactivée (impossible de la choisir).`);
                return false; // On sort car la date ne sera jamais cliquable
            }

            if (visibilityStatus.isVisible) {
                console.log(`✅ ${label} (${targetIso}) est visible. Sélection...`);

                await page.click(`div[data-iso="${targetIso}"]`);
                await _wait(800);
                return true;
            }

            // Si non visible, on clique sur SUIVANT
            console.log(`➡️ ${label} non visible ou hors-champ, clic Suivant...`);
            const nextBtn = await page.$('div[jsname="Sx9Kwc"] div[jsname="KpyLEe"] button[jsname="KpyLEe"]');

            if (nextBtn) {
                await nextBtn.click();
                await _wait(1000); // Temps nécessaire pour l'animation de slide
            } else {
                throw new Error(`❌ Bouton Suivant introuvable pour ${label}`);
            }
            attempts++;
        }
        throw new Error(`❌ Impossible de trouver/cliquer sur ${label} (${targetIso}) après 15 tentatives.`);
    };

    // --- 2. EXÉCUTION DU PARCOURS ---
    if (!await selectDate(checkin, "Check-in"))
        return false;
    await _wait(500); // Petit répit pour le focus Google
    if (!await selectDate(checkout, "Check-out"))
        return false;

    // --- 3. VALIDATION FINALE ---
    const okBtn = await page.$('button[jsname="iib5kc"]');
    if (okBtn) {
        await okBtn.click();
        console.log("✨ Dates validées avec succès.");
        await waitForGoogleLoad(page);
        return true;
    }

    return false

}

async function setDisplaySettings(page: Page, currency: string = "MAD") {
    console.log(`⚙️ Configuration : Tout le séjour + Devise ${currency}...`);

    return await page.evaluate(async (targetCurrency) => {
        const _wait = (ms: number) => new Promise(res => setTimeout(res, ms));

        // 1. Sélectionne "Tout le séjour" (le 2ème bouton)
        const tabs: NodeListOf<HTMLElement> = document.querySelectorAll('div[jsname="z5Cjge"] button[jsname="z2Jm1b"]');
        if (tabs[1]) {
            tabs[1].click();
            await _wait(300); // Laisse le temps au sous-menu de s'ouvrir
        }

        const durations: NodeListOf<HTMLElement> = document.querySelectorAll('[jsname="GHBvH"]');
        if (durations[0]) {
            durations[0].click();
            await _wait(600);
        }

        // 3. Clique sur la devise (ex: MAD, EUR)
        const currencyBtn = document.getElementById(targetCurrency);
        if (currencyBtn) {
            currencyBtn.click();
            await _wait(600);
        }

        // 4. Clique sur le bouton OK final
        // Sélecteur plus large pour éviter les changements de structure
        const okBtn = Array.from(document.querySelectorAll('[jsname="w9DNGd"]>[jsname="c6xFrd"] [jsname="V67aGc"]')).find(btn => {
            const text = btn.textContent?.trim();
            return text === "OK" || btn.getAttribute('aria-label') === "OK";
        })

        if (okBtn) {
            (okBtn as HTMLElement).click();
            return true;
        }
        return false;

    }, currency);
}

/**
 * EXTRACTEUR FINAL
 */
async function book_offers_extractor(page: any, checkin: string, checkout: string, currency: string, guests = 2, children = 0): Promise<BookingOffer[]> {
    // 1. Mise à jour des paramètres (Contexte Node)
    console.log("⚙️ Configuration des paramètres de recherche...", { checkin, checkout, guests, children });
    if (!await setDates(page, checkin, checkout))
        return []
    await _wait(400);
    if (!await setGuests(page, guests, children))
        return []
    await _wait(400);
    await waitForGoogleLoad(page);

    console.log("⏳ settings...");
    if (!await setDisplaySettings(page, currency))
        return []
    await waitForGoogleLoad(page);
    await _wait(400);

    console.log("⏳ Récupération des offres...");

    // 2. Extraction des données (Contexte Browser)
    const results = await page.evaluate(async () => {

        const cleanText = (text: string) => text ? text.replace(/\s+/g, ' ').trim() : "";

        const getDirectLink = (url: string) => {
            try {
                const u = new URL(url);
                let d = u.searchParams.get('pcurl') || u.searchParams.get('adurl');
                return d ? (d.includes('%') ? decodeURIComponent(d) : d) : url;
            } catch { return url; }
        };
        /**
         * Attend que la barre de progression de Google Hotels disparaisse.
         * @param {number} maxWaitMs - Temps maximum d'attente (défaut 3s)
         */
        async function waitForGoogleLoading(maxWaitMs = 1000 * 3) {
            const loaderSelector = 'div[jsname="P1ekSe"][role="progressbar"]';
            const pollInterval = 100; // Vérification toutes les 100ms
            let elapsed = 0;

            console.log("⏳ Vérification du chargement...");

            // 2. Attendre que le loader disparaisse (aria-hidden="true")
            while (elapsed < maxWaitMs) {
                const loader = document.querySelector(loaderSelector);
                // Si le loader n'est plus là ou s'il est caché
                if (!loader || loader.getAttribute('aria-hidden') === 'true') {
                    return true;
                }

                await new Promise(r => setTimeout(r, pollInterval));
                elapsed += pollInterval;
            }

            return false;
        }


        // Déplier les tarifs cachés

        const expandBtns = document.querySelectorAll('div[jsname="tBvzvc"]');
        const lastElement: any = expandBtns[expandBtns.length - 1];
        if (lastElement) {
            lastElement.click();
        }
        await waitForGoogleLoading();

        const results: any = [];
        const offerCards = document.querySelectorAll('a.hUGVEe, a[jsname="xf4CU"]');

        offerCards.forEach((el: any) => {
            const price = el.querySelector('.iqYCVb')?.innerText.trim();
            if (!price) return;

            const partner = el.querySelector('.RjilDd, .NiGhzc, h3')?.innerText.trim() ||
                el.querySelector('img')?.getAttribute('alt') || "Partenaire";

            results.push({
                provider: partner,
                room: cleanText(el.querySelector('.VuHI7')?.innerText) || "UNKNOWN",
                options: cleanText(el.querySelector('.WL9xgc, .V5vyfc')?.innerText),
                price_per_night: price,
                total: el.querySelector('.UeIHqb')?.innerText.trim() || "N/A",
                link: getDirectLink(el.href)
            });
        });

        return results;
    });
    console.log(`✅ ${results.length} offres récupérées.`);
    return results;
}