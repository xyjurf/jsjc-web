import type { Page } from "rebrowser-puppeteer";
import { randomDelay, typeHuman } from "../browser";
import { getLogger } from "../logger";

/**
 * Login to the upstream vendor website.
 * This is a scaffold — selectors must be customized after exploring the actual site.
 */
export async function loginToUpstream(
  page: Page,
  email: string,
  password: string
): Promise<boolean> {
  const log = getLogger();
  const base = process.env.UPSTREAM_SITE_URL || "https://xn--mes358acgm99l.com";

  log.info("Navigating to upstream login...");
  await page.goto(`${base}/#/auth/login`, { waitUntil: "networkidle2", timeout: 30000 });

  await randomDelay(1000, 2000);

  // Try common selectors for email input
  const emailSelectors = [
    'input[type="email"]',
    'input[name="email"]',
    'input[placeholder*="邮箱" i]',
    'input[placeholder*="email" i]',
    'input[placeholder*="账号" i]',
  ];

  let emailInput = null;
  for (const sel of emailSelectors) {
    const el = await page.$(sel);
    if (el) {
      emailInput = sel;
      log.info(`Found email input: ${sel}`);
      break;
    }
  }

  if (!emailInput) {
    log.error("Could not locate email input field");
    return false;
  }

  await typeHuman(page, emailInput, email);
  await randomDelay(500, 1000);

  // Try common selectors for password input
  const pwdSelectors = [
    'input[type="password"]',
    'input[name="password"]',
    'input[placeholder*="密码" i]',
    'input[placeholder*="password" i]',
  ];

  let pwdInput = null;
  for (const sel of pwdSelectors) {
    const el = await page.$(sel);
    if (el) {
      pwdInput = sel;
      log.info(`Found password input: ${sel}`);
      break;
    }
  }

  if (!pwdInput) {
    log.error("Could not locate password input field");
    return false;
  }

  await typeHuman(page, pwdInput, password);
  await randomDelay(500, 1000);

  // Try common selectors for login button
  const btnSelectors = [
    'button[type="submit"]',
    'button:has-text("登录")',
    'button:has-text("登入")',
    'button:has-text("Login")',
    'button:has-text("Sign in")',
  ];

  let btnClicked = false;
  for (const sel of btnSelectors) {
    try {
      await page.click(sel);
      btnClicked = true;
      log.info(`Clicked login button: ${sel}`);
      break;
    } catch {
      // try next
    }
  }

  if (!btnClicked) {
    log.error("Could not locate login button");
    return false;
  }

  await randomDelay(2000, 4000);

  // Check if login succeeded: look for user avatar, dashboard link, or absence of error
  const errorIndicators = ['.error', '.message-error', '[class*="error" i]'];
  let hasError = false;
  for (const sel of errorIndicators) {
    const el = await page.$(sel);
    if (el) {
      const text = await page.evaluate((e) => e.textContent, el);
      if (text && text.length > 2) {
        log.error(`Login error detected: ${text}`);
        hasError = true;
        break;
      }
    }
  }

  if (hasError) return false;

  // Success: page should have redirected or shown dashboard elements
  const currentUrl = page.url();
  log.info(`Post-login URL: ${currentUrl}`);

  return !currentUrl.includes("login");
}