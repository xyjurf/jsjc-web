import puppeteer from "rebrowser-puppeteer";
import type { Browser, Page } from "rebrowser-puppeteer";
import { CONFIG } from "./config";
import { getLogger } from "./logger";

let _browser: Browser | null = null;

/** Get or create a persistent browser instance */
export async function getBrowser(): Promise<Browser> {
  if (_browser && _browser.isConnected()) {
    return _browser;
  }

  const log = getLogger();
  log.info("Launching browser...");

  _browser = (await puppeteer.launch({
    headless: CONFIG.worker.headless,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-web-security",
      "--disable-features=IsolateOrigins,site-per-process",
      // Anti-bot args
      "--disable-blink-features=AutomationControlled",
      "--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    ],
    defaultViewport: { width: 1440, height: 900 },
  })) as Browser;

  // Handle disconnect
  _browser.on("disconnected", () => {
    log.warn("Browser disconnected");
    _browser = null;
  });

  return _browser;
}

/** Create a new page with stealth patches applied */
export async function createPage(): Promise<Page> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  // Apply stealth patches
  await page.evaluateOnNewDocument(() => {
    // Override webdriver property
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    // Override chrome object
    (window as any).chrome = { runtime: {} };
    // Override plugins
    Object.defineProperty(navigator, "plugins", {
      get: () => [1, 2, 3, 4, 5],
    });
    // Override languages
    Object.defineProperty(navigator, "languages", {
      get: () => ["zh-CN", "zh", "en-US", "en"],
    });
  });

  return page;
}

/** Random delay between min and max ms */
export async function randomDelay(min = 1000, max = 3000) {
  const ms = Math.random() * (max - min) + min;
  await new Promise((r) => setTimeout(r, ms));
}

/** Type text like a human (variable speed per character) */
export async function typeHuman(page: Page, selector: string, text: string) {
  await page.click(selector);
  await page.evaluate((s) => {
    const el = document.querySelector(s) as HTMLInputElement;
    if (el) el.value = "";
  }, selector);
  await randomDelay(200, 500);
  await page.type(selector, text, { delay: Math.floor(Math.random() * 100 + 50) as unknown as number });
}

function randomCharDelay() {
  // Random delay between 50-150ms per character, with bursts
  let total = 0;
  return () => {
    const delay = 50 + Math.random() * 100 + (Math.random() > 0.8 ? 200 : 0);
    total += delay;
    return delay;
  };
}

/** Close browser instance */
export async function closeBrowser() {
  if (_browser) {
    await _browser.close();
    _browser = null;
  }
}