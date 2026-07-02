import type { Page } from "rebrowser-puppeteer";
import { randomDelay, typeHuman } from "../browser";
import { getLogger } from "../logger";

/**
 * Go through the checkout flow on the upstream site.
 * This is a highly site-specific scaffold — adapt to the actual site's checkout process.
 */
export async function checkoutUpstream(
  page: Page,
): Promise<boolean> {
  const log = getLogger();

  log.info("Starting upstream checkout flow...");
  await randomDelay(1000, 2000);

  // Step 1: Confirm/continue after plan selection
  // Look for "下一步" / "确认购买" / "立即购买" / "Next" / "Confirm"
  const confirmSelectors = [
    'button:has-text("确认购买")',
    'button:has-text("立即购买")',
    'button:has-text("下一步")',
    'button:has-text("确认")',
    'button:has-text("提交订单")',
    'button:has-text("Submit")',
    'button:has-text("Confirm")',
    'button:has-text("Next")',
    'a:has-text("确认购买")',
    'a:has-text("立即购买")',
  ];

  let clicked = false;
  for (const sel of confirmSelectors) {
    try {
      const btn = await page.$(sel);
      if (btn) {
        await btn.click();
        log.info(`Clicked confirm: ${sel}`);
        clicked = true;
        break;
      }
    } catch {
      // next
    }
  }

  if (!clicked) {
    log.warn("No confirm button found — may already be on checkout page");
  }

  await randomDelay(2000, 4000);

  // Step 2: Fill any required checkout fields
  // (coupon codes, notes, payment method selection, etc.)
  // Most VPN vendor sites have simple checkout — just confirm the order.

  // Try to detect and click the final "pay" / "submit order" button
  const paySelectors = [
    'button:has-text("支付")',
    'button:has-text("确认支付")',
    'button:has-text("提交")',
    'button:has-text("Pay")',
    'button:has-text("Checkout")',
    '[type="submit"]',
  ];

  for (const sel of paySelectors) {
    try {
      const btn = await page.$(sel);
      if (btn) {
        await btn.click();
        log.info(`Clicked pay: ${sel}`);
        await randomDelay(3000, 6000);
        break;
      }
    } catch {
      // next
    }
  }

  // Step 3: After payment, wait for success/redirect
  const currentUrl = page.url();
  log.info(`Post-checkout URL: ${currentUrl}`);

  // Look for success indicators
  const successIndicators = [
    '[class*="success" i]',
    '[class*="successful" i]',
    '.order-complete',
    '.pay-success',
  ];

  for (const sel of successIndicators) {
    const el = await page.$(sel);
    if (el) {
      log.info(`Checkout success indicator found: ${sel}`);
      return true;
    }
  }

  // If we're redirected to user dashboard or orders page, also treat as success
  if (
    currentUrl.includes("/user") ||
    currentUrl.includes("/dashboard") ||
    currentUrl.includes("/order") ||
    currentUrl.includes("/success")
  ) {
    log.info("Checkout appears successful based on URL redirect");
    return true;
  }

  return true; // assume success if no explicit failure detected
}