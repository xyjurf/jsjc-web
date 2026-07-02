import type { Page } from "rebrowser-puppeteer";
import { getLogger } from "./logger";
import { getOrder, completeOrder, failOrder, getUpstreamCredentials, getPlanMapping } from "./db";
import { createPage, closeBrowser } from "./browser";
import { loginToUpstream } from "./upstream/auth";
import { selectUpstreamPlan } from "./upstream/plans";
import { checkoutUpstream } from "./upstream/checkout";
import { extractSubscriptionInfo } from "./upstream/extract";

const MAX_ATTEMPTS = Number(process.env.MAX_RETRY_ATTEMPTS) || 3;

/**
 * Main fulfillment pipeline: process a single order from paid → completed.
 * All errors are caught and logged; the order is marked failed on exhaustion.
 */
export async function fulfillOrder(orderId: string): Promise<boolean> {
  const log = getLogger();
  log.info({ orderId }, "Starting order fulfillment");

  // Get order details
  const order = await getOrder(orderId);
  if (!order) {
    log.error({ orderId }, "Order not found");
    return false;
  }

  if (order.status !== "paid" && order.status !== "fulfilling") {
    log.warn({ orderId, status: order.status }, "Order status not ready for fulfillment, skipping");
    return false;
  }

  // Check retry limit
  if ((order.fulfillment_attempts || 0) > MAX_ATTEMPTS) {
    log.error({ orderId, attempts: order.fulfillment_attempts }, "Max retry attempts exceeded");
    await failOrder(orderId, `超过最大重试次数 (${MAX_ATTEMPTS})`);
    return false;
  }

  let page: Page | null = null;

  try {
    // 1. Get credentials
    const creds = await getUpstreamCredentials();
    log.info("Got upstream credentials");

    // 2. Get plan mapping
    const mapping = await getPlanMapping(order.plan_id);
    const upstreamPlanName = mapping?.upstream_plan_name || order.plan_name;
    const upstreamPlanUrl = mapping?.upstream_plan_url;

    log.info({ upstreamPlanName, upstreamPlanUrl }, "Plan mapping resolved");

    // 3. Open browser page
    page = await createPage();

    // 4. Login
    const loggedIn = await loginToUpstream(page, creds.email, creds.password);
    if (!loggedIn) {
      throw new Error("上游网站登录失败");
    }

    // 5. Select plan
    const planMatched = await selectUpstreamPlan(page, upstreamPlanName, upstreamPlanUrl);
    if (!planMatched) {
      throw new Error(`无法在上游网站找到套餐: ${upstreamPlanName}`);
    }

    // 6. Checkout
    const checkoutOk = await checkoutUpstream(page);
    if (!checkoutOk) {
      throw new Error("上游网站下单流程异常");
    }

    // 7. Extract subscription info
    const keys = await extractSubscriptionInfo(page);
    if (keys.length === 0) {
      log.warn({ orderId }, "No subscription keys extracted — order may still be successful");
    }

    // 8. Build delivery data
    const deliveryData = {
      subscription_links: keys
        .filter((k) => k.type === "subscription_link")
        .map((k) => k.value),
      subscription_keys: keys
        .filter((k) => k.type === "subscription_key")
        .map((k) => k.value),
      config_texts: keys
        .filter((k) => k.type === "config_text")
        .map((k) => k.value),
      fulfilled_at: new Date().toISOString(),
    };

    // 9. Complete order
    await completeOrder(orderId, deliveryData);
    log.info({ orderId }, "ORDER COMPLETED");

    return true;
  } catch (err: any) {
    log.error({ orderId, error: err.message }, "Fulfillment failed");

    const attempts = (order.fulfillment_attempts || 0) + 1;
    if (attempts >= MAX_ATTEMPTS) {
      await failOrder(orderId, err.message);
    } else {
      // Reset to paid so worker retries
      await failOrder(orderId, `尝试 ${attempts}/${MAX_ATTEMPTS}: ${err.message}`);
      // The fallback in main loop catches this
    }

    return false;
  } finally {
    if (page) {
      try {
        await page.close();
      } catch {}
    }
  }
}