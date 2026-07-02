import type { Page } from "rebrowser-puppeteer";
import { randomDelay } from "../browser";
import { getLogger } from "../logger";

/**
 * Navigate to the plan/pricing page and select the matching upstream plan.
 *
 * Selection strategy: tries plan name match, then URL fallback from plan_mappings table.
 * Returns the name of the plan found, or null.
 */
export async function selectUpstreamPlan(
  page: Page,
  upstreamPlanName: string,
  upstreamPlanUrl?: string
): Promise<string | null> {
  const log = getLogger();
  const base = process.env.UPSTREAM_SITE_URL || "https://xn--mes358acgm99l.com";

  // If a direct URL is provided, navigate to it
  const targetUrl = upstreamPlanUrl || `${base}/#/plan`;
  log.info(`Navigating to plan page: ${targetUrl}`);
  await page.goto(targetUrl, { waitUntil: "networkidle2", timeout: 30000 });
  await randomDelay(2000, 3000);

  // Try to find the plan by name match
  // Scrape all plan cards/items
  const plans = await page.evaluate(() => {
    const items: Array<{ name: string; selector: string }> = [];
    // Common patterns: card titles, plan names in headings
    const potentialSelectors = [
      "h3, h4, .plan-name, .package-name, .card-title, [class*='plan' i] [class*='name' i]",
    ];

    for (const sel of potentialSelectors) {
      document.querySelectorAll(sel).forEach((el, i) => {
        const text = el.textContent?.trim();
        if (text && text.length > 1 && text.length < 100) {
          items.push({ name: text, selector: `document.querySelectorAll('${sel}')[${i}]` });
        }
      });
    }
    return items;
  });

  log.info({ plans }, "Found upstream plans");

  // Find best match
  const match = plans.find(
    (p) =>
      p.name.includes(upstreamPlanName) || upstreamPlanName.includes(p.name)
  );

  if (match) {
    log.info(`Plan matched: "${match.name}"`);

    // Click on the plan card or its parent buy button
    // Try clicking a nearby "buy" / "subscribe" button
    const clicked = await clickNearbyButton(page, match.name);
    if (clicked) return match.name;

    // Fallback: try clicking the plan name itself
    try {
      await page.click(`text="${match.name}"`);
      await randomDelay(1000, 2000);
      return match.name;
    } catch {
      log.warn("Could not click plan element");
    }
  }

  log.warn(`Plan "${upstreamPlanName}" not found on page`);
  return null;
}

/** Try clicking a buy/subscribe button near a given text match */
async function clickNearbyButton(page: Page, targetText: string): Promise<boolean> {
  const btnSelectors = [
    'button:has-text("购买")',
    'button:has-text("订阅")',
    'button:has-text("Buy")',
    'button:has-text("Subscribe")',
    'a:has-text("购买")',
    'a:has-text("订阅")',
  ];

  // Find the plan element and then try clicking a button near it
  for (const btnSel of btnSelectors) {
    try {
      // This is a heuristic — click the first visible buy button
      const btn = await page.$(btnSel);
      if (btn) {
        await btn.click();
        await randomDelay(1000, 2000);
        return true;
      }
    } catch {
      // skip
    }
  }

  return false;
}