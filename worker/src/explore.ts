/**
 * 上游网站探索脚本
 *
 * 用法：在 worker 目录运行 `npm run explore`
 *
 * 功能：
 * 1. 启动一个非无头浏览器（可见窗口）
 * 2. 导航到上游网站的各个页面
 * 3. 截图并提取页面结构信息
 * 4. 输出 CSS 选择器建议，帮助你填写 config/selectors.json
 *
 * 注意：首次运行时需要手动完成 Cloudflare 验证和登录
 */

import puppeteer from "rebrowser-puppeteer";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const BASE_URL = "https://xn--mes358acgm99l.com";

// 输出目录
const OUTPUT_DIR = join(__dirname, "..", "explore-results");

async function explore() {
  mkdirSync(OUTPUT_DIR, { recursive: true });

  console.log("=== 上游网站探索工具 ===\n");
  console.log("启动浏览器（可见模式）...\n");

  const browser = await puppeteer.launch({
    headless: false, // 必须可见，方便手动完成 CF 验证
    args: [
      "--no-sandbox",
      "--disable-blink-features=AutomationControlled",
      "--window-size=1440,900",
    ],
  });

  const page = await browser.newPage();

  // === 第 1 步：首页/登录页 ===
  console.log("【步骤 1/5】导航到首页...");
  console.log(`  URL: ${BASE_URL}/`);
  console.log("  如果出现 Cloudflare 验证，请手动完成。\n");

  await page.goto(BASE_URL + "/", {
    waitUntil: "networkidle2",
    timeout: 60000,
  });

  // 给用户时间手动完成验证
  console.log("  等待你手动操作（30 秒）...");
  await sleep(30000);

  await page.screenshot({
    path: join(OUTPUT_DIR, "01-homepage.png"),
    fullPage: true,
  });

  // 提取页面信息
  const homeInfo = await extractPageInfo(page);
  writeFileSync(
    join(OUTPUT_DIR, "01-homepage.json"),
    JSON.stringify(homeInfo, null, 2)
  );
  console.log(`  截图: 01-homepage.png`);
  console.log(`  提取: ${homeInfo.inputs.length} 个输入框, ${homeInfo.buttons.length} 个按钮, ${homeInfo.links.length} 个链接\n`);

  // === 第 2 步：查找登录入口 ===
  console.log("【步骤 2/5】尝试导航到登录页...");

  const loginUrls = [
    BASE_URL + "/#/auth/login",
    BASE_URL + "/#/login",
    BASE_URL + "/#/auth",
    BASE_URL + "/login",
  ];

  let loginFound = false;
  for (const url of loginUrls) {
    try {
      console.log(`  尝试: ${url}`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
      await sleep(2000);
      const info = await extractPageInfo(page);
      const hasPasswordField = info.inputs.some(
        (i: any) =>
          i.type === "password" ||
          i.placeholder?.includes("密码") ||
          i.placeholder?.includes("password")
      );
      if (hasPasswordField) {
        console.log(`  找到登录页面！`);
        loginFound = true;
        await page.screenshot({
          path: join(OUTPUT_DIR, "02-login.png"),
          fullPage: true,
        });
        writeFileSync(
          join(OUTPUT_DIR, "02-login.json"),
          JSON.stringify(info, null, 2)
        );
        break;
      }
    } catch {
      console.log(`  无法访问`);
    }
  }

  if (!loginFound) {
    console.log("  未找到独立的登录页，检查首页是否就有登录表单...");
    // 首页可能就是登录页
    if (homeInfo.inputs.some((i: any) => i.type === "password")) {
      console.log("  首页即包含密码输入框，可能就是登录页！");
    }
  }

  // === 第 3 步：套餐页 ===
  console.log("【步骤 3/5】导航到套餐页...");
  const planUrls = [
    BASE_URL + "/#/plan",
    BASE_URL + "/#/plans",
    BASE_URL + "/#/pricing",
    BASE_URL + "/#/packages",
  ];

  for (const url of planUrls) {
    try {
      console.log(`  尝试: ${url}`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
      await sleep(2000);
      await page.screenshot({
        path: join(OUTPUT_DIR, "03-plans.png"),
        fullPage: true,
      });
      const info = await extractPageInfo(page);
      writeFileSync(
        join(OUTPUT_DIR, "03-plans.json"),
        JSON.stringify(info, null, 2)
      );
      console.log(`  截图: 03-plans.png`);
      console.log(
        `  提取: ${info.headings.length} 个标题, ${info.buttons.length} 个按钮`
      );
      console.log("  标题列表:");
      info.headings.forEach((h: any) => console.log(`    - [${h.tag}] ${h.text}`));
      break;
    } catch {
      console.log(`  无法访问 ${url}`);
    }
  }

  // === 第 4 步：用户中心 ===
  console.log("\n【步骤 4/5】导航到用户中心...");
  const userUrls = [
    BASE_URL + "/#/user",
    BASE_URL + "/#/dashboard",
    BASE_URL + "/#/profile",
    BASE_URL + "/#/myservices",
  ];

  for (const url of userUrls) {
    try {
      console.log(`  尝试: ${url}`);
      await page.goto(url, { waitUntil: "networkidle2", timeout: 15000 });
      await sleep(2000);
      await page.screenshot({
        path: join(OUTPUT_DIR, "04-user.png"),
        fullPage: true,
      });
      const info = await extractPageInfo(page);
      writeFileSync(
        join(OUTPUT_DIR, "04-user.json"),
        JSON.stringify(info, null, 2)
      );
      console.log(`  截图: 04-user.png`);
      break;
    } catch {
      console.log(`  无法访问 ${url}`);
    }
  }

  // === 第 5 步：检查是否为 SPA 框架 ===
  console.log("\n【步骤 5/5】检测前端框架...");
  const framework = await page.evaluate(() => {
    const html = document.documentElement.outerHTML;

    // Vue
    if (
      (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__ ||
      document.querySelector("[data-v-]") ||
      document.getElementById("app")
    ) {
      // Check for Vue Router
      const hasRouter =
        (window as any).__VUE_DEVTOOLS_GLOBAL_HOOK__?.apps?.length > 0;
      return `Vue${hasRouter ? " + Vue Router" : ""} (可能)`;
    }

    // React
    if (document.getElementById("root") || document.getElementById("__next")) {
      return "React";
    }

    // Check DOM for specific attributes
    if (html.includes("data-v-")) return "Vue (检测到 data-v- 属性)";
    if (html.includes("_reactRoot")) return "React (检测到 _reactRoot)";
    if (html.includes("ng-version")) return "Angular";

    // Check URL hash for SPA
    if (window.location.hash.includes("/")) return "SPA (Hash 路由)";

    return "未检测到常见框架";
  });

  console.log(`  框架: ${framework}`);

  // 提取所有可见的路由/nav 链接
  const routes = await page.evaluate(() => {
    const links = new Set<string>();
    document.querySelectorAll("a[href^='#']").forEach((a) => {
      const href = a.getAttribute("href");
      if (href) links.add(href);
    });
    document.querySelectorAll("[router-link], [to]").forEach((el) => {
      const to = el.getAttribute("to") || el.getAttribute("router-link");
      if (to) links.add(to);
    });
    return Array.from(links);
  });

  console.log(`  发现 ${routes.length} 个前端路由:`);
  routes.forEach((r) => console.log(`    ${r}`));

  // 最终报告
  const summary = {
    siteUrl: BASE_URL,
    framework,
    routes,
    exploredPages: {
      homepage: "01-homepage.png",
      login: loginFound ? "02-login.png" : "(可能就在首页)",
      plans: "03-plans.png",
      user: "04-user.png",
    },
    selectorsToUpdate: `
打开 explore-results/ 目录下的截图和 JSON 文件，
对照实际页面填写 worker/config/selectors.json 中的选择器。

关键选择器：
1. 登录页：邮箱输入框、密码输入框、登录按钮
2. 套餐页：套餐卡片容器、套餐名称、价格、购买按钮
3. 用户中心：订阅列表、订阅链接、复制按钮
    `.trim(),
  };

  writeFileSync(
    join(OUTPUT_DIR, "summary.json"),
    JSON.stringify(summary, null, 2)
  );

  console.log("\n=== 探索完成 ===");
  console.log(`所有结果保存在: ${OUTPUT_DIR}`);
  console.log("请查看截图和 JSON 文件，然后更新 selectors.json\n");

  console.log("浏览器保持打开 60 秒，你可以继续手动探索...");
  await sleep(60000);

  await browser.close();
  console.log("浏览器已关闭。");
}

/** 提取页面的可交互元素信息 */
async function extractPageInfo(page: any) {
  return await page.evaluate(() => {
    // 输入框
    const inputs = Array.from(
      document.querySelectorAll("input, textarea, select")
    ).map((el: any) => ({
      tag: el.tagName.toLowerCase(),
      type: el.type || "",
      name: el.name || "",
      id: el.id || "",
      placeholder: el.placeholder || "",
      className: el.className || "",
      // 父元素信息帮助定位
      parentTag: el.parentElement?.tagName?.toLowerCase() || "",
      parentClass: el.parentElement?.className || "",
    }));

    // 按钮
    const buttons = Array.from(
      document.querySelectorAll(
        "button, a.btn, a.button, [role='button'], input[type='submit'], input[type='button']"
      )
    )
      .map((el: any) => ({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || "").trim().slice(0, 100),
        type: el.type || "",
        id: el.id || "",
        className: el.className || "",
      }))
      .filter((b) => b.text.length > 0);

    // 链接
    const links = Array.from(document.querySelectorAll("a[href]"))
      .map((el: any) => ({
        href: el.getAttribute("href") || "",
        text: (el.textContent || "").trim().slice(0, 100),
        className: el.className || "",
      }))
      .filter(
        (l) =>
          l.text.length > 0 &&
          !l.href.startsWith("javascript:") &&
          l.href !== "#"
      );

    // 标题
    const headings = Array.from(
      document.querySelectorAll("h1, h2, h3, h4, h5, h6")
    )
      .map((el: any) => ({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || "").trim().slice(0, 200),
      }))
      .filter((h) => h.text.length > 0);

    // 卡片/容器
    const cards = Array.from(
      document.querySelectorAll("[class*='card'], [class*='plan'], [class*='package'], [class*='pricing']")
    )
      .map((el: any) => ({
        className: el.className || "",
        text: (el.textContent || "").trim().slice(0, 300),
      }))
      .filter((c) => c.text.length > 0);

    return { inputs, buttons, links, headings, cards };
  });
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

explore().catch((err) => {
  console.error("探索失败:", err);
  process.exit(1);
});