const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const paymentCatalog = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../data/payment-catalog.json"),
    "utf8",
  ),
);

const publicPages = ["", "wenda", "anli"].flatMap((directory) =>
  fs
    .readdirSync(path.resolve(__dirname, "..", directory))
    .filter((file) => file.endsWith(".html") && file !== "404.html")
    .map((file) =>
      file === "index.html"
        ? "/"
        : `/${directory ? `${directory}/` : ""}${file.replace(/\.html$/, "")}`,
    ),
);

test.beforeEach(async ({ page }) => {
  // Public pages and tools must work when external services are unavailable.
  await page.route(/^https?:\/\//, (route) => {
    if (new URL(route.request().url()).hostname === "127.0.0.1")
      return route.continue();
    return route.abort();
  });
});

test("all service pages show the verified USD price and matching Stripe checkout", async ({
  page,
}) => {
  for (const url of ["/?lang=en", "/zh", "/zixun"]) {
    await page.goto(url);
    await expect(page.locator(".dx-payment")).toHaveCount(3);
    await expect(page.locator("stripe-buy-button")).toHaveCount(0);
    for (const offer of paymentCatalog.offers) {
      const payment = page.locator(`.dx-payment[data-offer="${offer.id}"]`);
      await expect(payment.locator(".dx-price-currency")).toHaveText("US$");
      await expect(payment.locator(".dx-price strong")).toHaveText(
        (offer.unit_amount / 100).toFixed(2),
      );
      const checkout = new URL(offer.payment_url);
      checkout.searchParams.set("locale", url.startsWith("/?") ? "en" : "zh");
      await expect(payment.locator("a")).toHaveAttribute("href", checkout.href);
    }
    const graph = await page.locator("#payment-offers-jsonld").textContent();
    expect(
      JSON.parse(graph)["@graph"].map(
        (product) => product.offers.priceCurrency,
      ),
    ).toEqual(["USD", "USD", "USD"]);
  }
});

test("light pages keep navigation and primary actions readable", async ({
  page,
}) => {
  for (const url of [
    "/",
    "/zh",
    "/decision-tools",
    "/zixun",
    "/wenda/have-child-or-not",
  ]) {
    await page.goto(url);
    const results = await page.evaluate(() => {
      const rgb = (value) =>
        (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
      const luminance = (channels) =>
        channels
          .map((channel) => {
            const v = channel / 255;
            return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          })
          .reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i], 0);
      const action = document.querySelector(".dx-nav-cta");
      const style = getComputedStyle(action);
      const foreground = luminance(rgb(style.color));
      const background = luminance(rgb(style.backgroundColor));
      return {
        pageLightness: luminance(
          rgb(getComputedStyle(document.body).backgroundColor),
        ),
        actionContrast:
          (Math.max(foreground, background) + 0.05) /
          (Math.min(foreground, background) + 0.05),
      };
    });
    expect(results.pageLightness, url).toBeGreaterThan(0.8);
    expect(results.actionContrast, url).toBeGreaterThanOrEqual(4.5);
  }
});

test("English is the default homepage and visitors can explicitly switch languages", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator("h1")).toContainText("Better choices.");
  await page.getByRole("link", { name: "中文", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    "href",
    "https://daxuanze.com/zh",
  );
  await page.goto("/");
  await expect(page).toHaveURL(/\/zh$/);
  await page.getByRole("link", { name: "English", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("every public page renders without script errors or horizontal overflow", async ({
  page,
}) => {
  // This audit navigates every public page sequentially, including on busy Windows hosts.
  test.setTimeout(180000);
  const errors = [];
  page.on("pageerror", (error) =>
    errors.push(`${page.url()}: ${error.message}`),
  );
  for (const url of publicPages) {
    const response = await page.goto(url);
    expect(response.status(), url).toBe(200);
    await expect(page.locator("h1"), url).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth + 1,
      ),
      url,
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("pages render with local styles, correct metadata and no script errors", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  for (const url of [
    "/",
    "/decision-tools",
    "/zixun",
    "/wenda/have-child-or-not",
    "/anli/startup-partner-or-solo",
  ]) {
    const response = await page.goto(url);
    expect(response.status()).toBe(200);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `https://daxuanze.com${url}`,
    );
    await expect(page.locator('link[href="/asset/tailwind.css"]')).toHaveCount(
      1,
    );
    expect(
      await page
        .locator("h1")
        .evaluate((element) => parseFloat(getComputedStyle(element).fontSize)),
    ).toBeGreaterThan(24);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth + 1,
      ),
    ).toBe(true);
  }
  expect(errors).toEqual([]);
});

test("search, filters and local category chart work without external services", async ({
  page,
}) => {
  await page.goto("/decision-tools");
  await expect(page.locator("#tool-grid .tool-card")).toHaveCount(21);
  await expect(
    page.locator('script[src*="chart.js"], script[src*="cdn.tailwindcss.com"]'),
  ).toHaveCount(0);
  await expect(page.locator("#toolsChart li")).not.toHaveCount(0);
  await expect(page.locator("#toolsChart li").first()).toBeVisible();
  const search = page.getByRole("searchbox", { name: "搜索决策工具" });
  await search.fill("  swot  ");
  await expect(page.locator("#tool-grid .tool-card")).toHaveCount(1);
  await search.fill("风险管理");
  await expect(page.locator("#tool-grid .tool-card")).not.toHaveCount(0);
  await search.fill("xxxxxxxx");
  await expect(page.getByText("未找到匹配的工具")).toBeVisible();
  await search.fill("");
  const category = page.getByRole("button", { name: "财务分析", exact: true });
  await category.click();
  await expect(category).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("#tool-grid .tool-card")).toHaveCount(1);
});

test("modal supports keyboard activation, focus containment and focus restoration", async ({
  page,
}) => {
  await page.goto("/decision-tools");
  const card = page.locator("#tool-grid .tool-card").first();
  await card.focus();
  await page.keyboard.press("Enter");
  const modal = page.getByRole("dialog", { name: "SWOT 分析" });
  await expect(modal).toBeVisible();
  const close = page.getByRole("button", { name: "关闭工具详情" });
  await expect(close).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(close).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(modal).toBeHidden();
  await expect(card).toBeFocused();
  await page.keyboard.press("Space");
  await expect(modal).toBeVisible();
  await close.click();
  await expect(card).toBeFocused();
});

test("recommendation CTA, validation and matched results work locally", async ({
  page,
}) => {
  await page.goto("/decision-tools");
  await page.getByRole("button", { name: "场景工具推荐", exact: true }).click();
  const submit = page.getByRole("button", { name: "推荐工具", exact: true });
  await expect(submit).toBeDisabled();
  await page.getByLabel("你正在做什么选择？").fill("   ");
  await expect(submit).toBeDisabled();
  await page
    .getByLabel("你正在做什么选择？")
    .fill("每天的任务太多，怎样分清紧急程度和时间优先级");
  await submit.click();
  await expect(page.locator("#recommendation-results li")).toHaveCount(3);
  const result = page.locator("#recommendation-results button").first();
  await expect(result).toContainText("艾森豪威尔矩阵");
  await result.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "关闭工具详情" }).click();
  await expect(result).toBeFocused();
  await page
    .getByLabel("你正在做什么选择？")
    .fill("<img src=x onerror=alert(1)>");
  await submit.click();
  await expect(page.locator("#recommendation-results img")).toHaveCount(0);
  await expect(page.locator("#recommendation-status")).toContainText(
    "暂时没有匹配",
  );
});

test("course preview switches panels and keeps its target visible", async ({
  page,
}) => {
  await page.goto("/zh");
  const links = page.locator(".course-preview-nav .section-link");
  await links.nth(1).click();
  const href = await links.nth(1).getAttribute("href");
  await expect(page.locator(href)).toBeVisible();
  await expect(
    page.locator(".course-preview-content .course-panel:visible"),
  ).toHaveCount(1);
});

test("unknown routes return a real 404 and canonical redirects preserve queries", async ({
  page,
  request,
}) => {
  const response = await page.goto("/does-not-exist");
  expect(response.status()).toBe(404);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    "content",
    "noindex, follow",
  );
  await expect(page.getByRole("link", { name: "返回首页" })).toBeVisible();
  const redirect = await request.get("/decision-tools.html?source=test", {
    maxRedirects: 0,
  });
  expect(redirect.status()).toBe(301);
  expect(redirect.headers().location).toBe("/decision-tools?source=test");
  for (const url of [
    "/.git/config",
    "/package-lock.json",
    "/scripts/build-ai-assets.js",
  ]) {
    expect((await request.get(url)).status()).toBe(404);
  }
});

test("the complete catalogue remains readable without JavaScript", async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.route(/^https:\/\//, (route) => route.abort());
  await page.goto("http://127.0.0.1:3000/decision-tools");
  await expect(page.locator("noscript details")).toHaveCount(21);
  await page.locator("noscript summary").first().click();
  await expect(
    page.locator("noscript details").first().locator("p").first(),
  ).toBeVisible();
  await context.close();
});
