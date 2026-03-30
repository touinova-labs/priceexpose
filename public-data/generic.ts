import puppeteer from 'puppeteer-extra';
import chromium from '@sparticuz/chromium-min';
import * as proxyChain from 'proxy-chain';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

/**
 * Interface pour la configuration du scraper
 */
interface ScrapeConfig {
    url: string;
    proxyUrl: string;
    proxyAuth: { username: string; password: string };
}

/**
 * Méthode Générique d'extraction
 * @param config Configuration de navigation et proxy
 * @param extractor Logiciel d'extraction (tourne dans le navigateur)
 */
export async function scrapeData<T>(config: ScrapeConfig, extractor: (page: any) => Promise<T> | T): Promise<T | null> {
    console.time("RequestDuration"); // Démarre un timer pour mesurer la durée totale
    let anonymizedProxy = await proxyChain.anonymizeProxy(config.proxyUrl);
    if (puppeteer.plugins.length === 0) {
        puppeteer.use(StealthPlugin());
    }

    const browser = await puppeteer.launch({
        args: [...chromium.args, "--hide-scrollbars", "--disable-web-security", `--proxy-server=${anonymizedProxy}`],
        // executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.arm64.tar'),
        executablePath: await chromium.executablePath('https://github.com/Sparticuz/chromium/releases/download/v143.0.4/chromium-v143.0.4-pack.x64.tar'),
        headless: true,
    });

    try {

        const page = await browser.newPage();
        await page.setRequestInterception(true);
        page.on('request', (req: any) => {
            const resourceType = req.resourceType();
            if (['image', 'stylesheet', 'font', 'media'].includes(resourceType)) {
                req.abort();
            } else {
                req.continue();
            }
        });

        await page.authenticate(config.proxyAuth);

        await page.setViewport({ width: 1280, height: 1200 }); // Plus haut pour voir plus d'offres

        const domains = ['.google.fr', '.google.com'];
        for (const domain of domains) {
            await page.setCookie({
                name: 'SOCS',
                value: 'CAESHAgBEhJnd3NfMjAyNDA2MTAtMF9SQzIaAmZyIAEaBgiA_LuwBg',
                domain: domain,
                path: '/',
            });
        }

        // 2. Navigation
        console.log(`🚀 Navigation vers : ${config.url}`);
        await page.goto(config.url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // 3. Gestion du Consentement (Evite l'erreur de contexte détruit)
        const consentButton = 'button[jsname="b3VHJd"]';
        try {
            const btn = await page.waitForSelector(consentButton, { timeout: 3000 });
            if (btn) {
                console.log("🛡️ Consentement détecté, acceptation en cours...");
                await Promise.all([
                    page.click(consentButton),
                    page.waitForNavigation({ waitUntil: 'networkidle2' })
                ]);
            }
        } catch (e) { /* Pas de popup, on continue */ }

        console.log("🔍 Extraction des données...");
        const data = await extractor(page);
        return data;

    } catch (error) {
        console.error("❌ Scrape Error:", (error as Error).message);
        return null;
    } finally {
        if (browser) await browser.close();
        await proxyChain.closeAnonymizedProxy(anonymizedProxy, true);
        console.timeEnd("RequestDuration"); // Arrête le timer et affiche la durée totale
    }
}