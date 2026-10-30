import { chromium } from "playwright";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
const root = path.resolve(process.env.QA_OUTPUT_DIR || "work/browser");
fs.mkdirSync(root, { recursive: true });
const baseURL = process.env.BASE_URL || "http://127.0.0.1:5173";
(async () => {
  const browser = await chromium.launch({
    ...(process.env.BROWSER_CHANNEL
      ? { channel: process.env.BROWSER_CHANNEL }
      : {}),
    headless: true,
  });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1000 },
  });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(baseURL);
  await page.locator(".product-card").last().waitFor();
  assert.equal(await page.locator(".product-card").count(), 8);
  await page
    .getByRole("button", { name: "Home & living", exact: true })
    .last()
    .click();
  assert.equal(await page.locator(".product-card").count(), 4);
  await page.getByRole("button", { name: "All objects", exact: false }).click();
  await page
    .getByRole("textbox", { name: "Search the collection" })
    .fill("mug");
  assert.equal(await page.locator(".product-card").count(), 1);
  await page
    .getByRole("textbox", { name: "Search the collection" })
    .fill("not-a-real-object");
  await page.getByText("A little room for discovery.").waitFor();
  await page.getByRole("button", { name: "Explore all objects" }).click();
  await page.getByLabel("Sort products").selectOption("price-asc");
  assert.match(
    await page.locator(".product-card h3").first().innerText(),
    /Cocktail/,
  );
  await page.getByLabel("Sort products").selectOption("featured");
  await page
    .getByRole("button", { name: "Save The Morning Mug", exact: true })
    .click();
  await page.getByRole("button", { name: "Saved items (1)" }).click();
  assert.equal(await page.locator(".product-card").count(), 1);
  await page.getByRole("button", { name: "Clear all", exact: true }).click();
  await page
    .getByRole("button", { name: "View The Morning Mug", exact: true })
    .click();
  await page.getByRole("button", { name: "Color: Clay", exact: true }).click();
  await page
    .getByRole("button", { name: "Increase quantity", exact: true })
    .click();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await page
    .getByRole("button", { name: "Open shopping bag, 2 items" })
    .click();
  await page
    .getByRole("button", { name: "Increase The Morning Mug quantity" })
    .click();
  assert.match(await page.locator(".total-row").innerText(), /92.00/);
  await page.getByRole("button", { name: "Close Shopping bag" }).click();
  await page.reload();
  await page
    .getByRole("button", { name: "Open shopping bag, 3 items" })
    .waitFor();
  await page
    .getByRole("button", { name: "Add Arc Reading Lamp to bag" })
    .click();
  await page
    .getByRole("button", { name: "Open shopping bag, 4 items" })
    .click();
  assert.match(await page.locator(".total-row").innerText(), /213.00/);
  await page.getByText("A little extra: your shipping is on us.").waitFor();
  await page.getByRole("button", { name: "Review demo checkout" }).click();
  await page.getByText("This is a demo checkout.").waitFor();
  await page.getByRole("button", { name: "Complete demo order" }).click();
  await page.getByText("That’s the demo, beautifully wrapped.").waitFor();
  await page.keyboard.press("Escape");
  await page
    .getByRole("button", { name: "Open shopping bag, 0 items" })
    .waitFor();
  await page.getByLabel("Display currency").selectOption("GBP");
  assert.match(await page.locator(".announcement").innerText(), /79.00/);
  await page.getByLabel("Display currency").selectOption("USD");
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: width < 700 ? 844 : 1000 });
    await page.evaluate(() => scrollTo(0, 0));
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth,
    );
    assert.equal(overflow, false, `horizontal overflow at ${width}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await page
    .getByRole("button", { name: "Kitchen & dining", exact: true })
    .last()
    .click();
  assert.equal(await page.locator(".product-card").count(), 3);
  await page
    .getByRole("button", { name: "View The Morning Mug", exact: true })
    .click();
  await page.getByRole("button", { name: "Add to bag", exact: true }).click();
  await page
    .getByRole("button", { name: "Open shopping bag, 1 items" })
    .click();
  await page.screenshot({ path: root + "/mobile-bag.png" });
  await page.getByRole("button", { name: "Remove The Morning Mug" }).click();
  await page.getByText("Good things take a little browsing.").waitFor();
  await page.keyboard.press("Escape");
  await page.evaluate(() => {
    localStorage.clear();
    location.reload();
  });
  await page.waitForLoadState();
  await page.locator(".hero").waitFor();
  await page.evaluate(() => document.activeElement?.blur());
  await page.screenshot({ path: root + "/mobile-preview.png", fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.evaluate(() => scrollTo(0, 0));
  await page.screenshot({
    path: root + "/desktop-preview.png",
    fullPage: true,
  });
  const broken = await page
    .locator("img")
    .evaluateAll((images) =>
      images
        .filter((i) => !i.complete || i.naturalWidth === 0)
        .map((i) => i.src),
    );
  assert.deepEqual(broken, []);
  assert.deepEqual(errors, []);
  await page.evaluate(() =>
    localStorage.setItem("presence-cart-v1", "INVALID JSON"),
  );
  await page.reload();
  await page
    .getByRole("button", { name: "Open shopping bag, 0 items" })
    .waitFor();
  const restricted = await browser.newPage();
  await restricted.addInitScript(() => {
    Storage.prototype.setItem = function () {
      throw new Error("blocked");
    };
  });
  await restricted.goto(baseURL);
  await restricted
    .getByText(
      "Browser storage is unavailable. Your bag will last for this visit only.",
    )
    .waitFor();
  const report = {
    status: "passed",
    checks: [
      "8 products and all local images loaded",
      "category, search and empty results",
      "sorting and saved collection",
      "variant selection and quantity changes",
      "bag persistence after reload",
      "free shipping threshold and totals",
      "demo checkout and bag clearing",
      "mobile navigation and item removal",
      "360/390/768/1440 px: no horizontal overflow",
      "GBP display conversion",
      "corrupt storage recovery",
      "storage disabled feedback",
    ],
    browser: "Chrome headless",
    pageErrors: errors,
    date: "2026-10-30",
  };
  fs.writeFileSync(
    root + "/browser-validation.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
