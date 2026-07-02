import type { Page } from "rebrowser-puppeteer";
import { randomDelay } from "../browser";
import { getLogger } from "../logger";

export interface ExtractedKey {
  type: "subscription_link" | "subscription_key" | "qr_code" | "config_text";
  value: string;
}

/**
 * After purchase, navigate to user center and extract the subscription key/link.
 */
export async function extractSubscriptionInfo(page: Page): Promise<ExtractedKey[]> {
  const log = getLogger();
  const base = process.env.UPSTREAM_SITE_URL || "https://xn--mes358acgm99l.com";

  const results: ExtractedKey[] = [];

  // Navigate to user dashboard / subscriptions page
  const dashboardUrls = [
    `${base}/#/user`,
    `${base}/#/user/subscriptions`,
    `${base}/#/user/services`,
    `${base}/#/user/orders`,
    `${base}/#/dashboard`,
  ];

  for (const url of dashboardUrls) {
    try {
      log.info(`Trying user dashboard: ${url}`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
      await randomDelay(2000, 3000);
      break;
    } catch {
      // try next
    }
  }

  // Extract any subscription links
  const links = await page.evaluate(() => {
    const result: Array<{ type: string; value: string }> = [];

    // Look for subscription URLs (vmess://, vless://, ss://, trojan://, hysteria://, etc.)
    const protocolPatterns = [
      "vmess://", "vless://", "ss://", "ssr://", "trojan://",
      "hysteria://", "hysteria2://", "tuic://", "juicity://",
    ];

    // Scan all text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      null
    );

    const texts: string[] = [];
    while (walker.nextNode()) {
      const text = walker.currentNode.textContent?.trim();
      if (text && text.length > 10) texts.push(text);
    }

    // Check for subscription links
    for (const text of texts) {
      for (const proto of protocolPatterns) {
        const idx = text.indexOf(proto);
        if (idx >= 0) {
          // Extract until whitespace or end
          const end = text.indexOf(" ", idx);
          const link = end > idx ? text.slice(idx, end) : text.slice(idx);
          result.push({
            type: "subscription_link",
            value: link.replace(/[​-‍﻿]/g, "").trim(),
          });
        }
      }
    }

    // Also look for plain URL subscription links
    const urlPattern = /https?:\/\/[^\s]+subscribe[^\s]*/gi;
    for (const text of texts) {
      const matches = text.match(urlPattern);
      if (matches) {
        matches.forEach((m) =>
          result.push({
            type: "subscription_link",
            value: m.replace(/[​-‍﻿]/g, "").trim(),
          })
        );
      }
    }

    // Look for "copy" buttons next to subscription info
    const copyBtns = document.querySelectorAll(
      '[class*="copy" i], [class*="subscribe" i], button:has-text("复制"), button:has-text("Copy")'
    );
    copyBtns.forEach((btn) => {
      const parent = btn.closest("div, section, .card, [class*='card' i]");
      if (parent) {
        const text = parent.textContent?.trim();
        if (text && text.length > 20 && text.length < 5000) {
          const hasProto = protocolPatterns.some((p) => text.includes(p));
          const hasUrl = /https?:\/\//.test(text);
          if (hasProto || hasUrl) {
            result.push({
              type: "config_text",
              value: text,
            });
          }
        }
      }
    });

    return result;
  });

  log.info({ linkCount: links.length }, "Extracted subscription data");
  results.push(...(links as ExtractedKey[]));

  // Also take a screenshot for manual verification
  const screenshot = await page.screenshot({
    path: `/tmp/order-extract-${Date.now()}.png`,
    fullPage: true,
  });
  log.info(`Screenshot saved (${screenshot.length} bytes)`);

  return results;
}