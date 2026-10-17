const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const catalog = JSON.parse(
  fs.readFileSync(path.join(root, "data/payment-catalog.json"), "utf8"),
);
if (
  catalog.currency !== "usd" ||
  !catalog.livemode ||
  catalog.offers.length !== 3
)
  throw new Error("Expected three live USD offers");
for (const file of ["index.html", "zh.html", "zixun.html"]) {
  const english = file === "index.html";
  let html = fs.readFileSync(path.join(root, file), "utf8");
  for (const offer of catalog.offers) {
    if (
      !Number.isInteger(offer.unit_amount) ||
      offer.unit_amount < 990 ||
      new URL(offer.payment_url).hostname !== "buy.stripe.com"
    )
      throw new Error("Invalid checkout offer");
    const checkout = new URL(offer.payment_url);
    checkout.searchParams.set("locale", english ? "en" : "zh");
    const start = `<!-- dx-payment:${offer.id}:start -->`;
    const end = `<!-- dx-payment:${offer.id}:end -->`;
    const content = `${start}
<div class="dx-payment" data-offer="${offer.id}">
  <p class="dx-price"><span class="dx-price-currency">US$</span><strong>${(offer.unit_amount / 100).toFixed(2)}</strong></p>
  <p class="dx-payment-caption">${english ? "One-time payment" : "一次性付款"}${offer.id === "annual" ? (english ? " · Annual plan, no auto-renewal" : " · 年度服务，不自动续费") : ""}</p>
  <a class="dx-checkout" href="${checkout.href}">${english ? "Pay securely with Stripe" : "通过 Stripe 安全付款"}</a>
</div>
${end}`;
    const existing = new RegExp(`${start}[\\s\\S]*?${end}`);
    if (existing.test(html)) html = html.replace(existing, content);
    else {
      const old = new RegExp(
        `<stripe-buy-button\\b[^>]*buy-button-id="${offer.source_button_id}"[^>]*>[\\s\\S]*?<\\/stripe-buy-button>`,
      );
      if (!old.test(html))
        throw new Error(`Missing payment slot ${file}: ${offer.id}`);
      html = html.replace(old, content);
    }
  }
  html = html.replace(
    /\s*<script\b[^>]*src="https:\/\/js\.stripe\.com\/v3\/buy-button\.js"[^>]*><\/script>/g,
    "",
  );
  html = html.replace(
    /\s*<script type="application\/ld\+json" id="payment-offers-jsonld">[\s\S]*?<\/script>/g,
    "",
  );
  const schema = {
    "@context": "https://schema.org",
    "@graph": catalog.offers.map((offer) => ({
      "@type": "Product",
      "@id": `https://daxuanze.com/${english ? "" : file.replace(".html", "")}#product-${offer.id}`,
      name: english ? offer.name_en : offer.name_zh,
      description: offer.description,
      offers: {
        "@type": "Offer",
        price: (offer.unit_amount / 100).toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        url: offer.payment_url,
        seller: { "@id": "https://daxuanze.com/#organization" },
      },
    })),
  };
  html = html.replace(
    "</head>",
    `<script type="application/ld+json" id="payment-offers-jsonld">\n${JSON.stringify(schema, null, 2).replaceAll("<", "\\u003c")}\n</script>\n</head>`,
  );
  fs.writeFileSync(path.join(root, file), html, "utf8");
}
console.log(
  "Generated verified USD prices and Stripe Checkout links for both homepages and the services page.",
);
