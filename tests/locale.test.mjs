import { test } from "node:test";
import assert from "node:assert/strict";
import { onRequest } from "../functions/_middleware.js";

async function run(country, path = "/", cookie = "", headers = {}) {
  const request = new Request(`https://daxuanze.com${path}`, {
    headers: { cookie, ...headers },
  });
  if (country !== undefined)
    Object.defineProperty(request, "cf", { value: { country } });
  return onRequest({
    request,
    next: async () =>
      new Response("asset", {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "X-Test": "preserved",
        },
      }),
  });
}
test("China redirects temporarily; other or unknown locations receive English", async () => {
  const cn = await run("CN", "/?source=campaign");
  assert.equal(cn.status, 302);
  assert.equal(cn.headers.get("location"), "/zh?source=campaign");
  assert.equal(cn.headers.get("cache-control"), "private, no-store");
  for (const country of ["US", "HK", "TW", "", undefined]) {
    const response = await run(country);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-language"), "en");
    assert.equal(response.headers.get("x-test"), "preserved");
    assert.equal(await response.text(), "asset");
  }
});
test("explicit language and saved preference override country without redirect loops", async () => {
  const english = await run("CN", "/?lang=en");
  assert.equal(english.status, 200);
  assert.match(
    english.headers.get("set-cookie"),
    /^dx_lang=en;.*Secure; SameSite=Lax$/,
  );
  assert.equal((await run("CN", "/", "dx_lang=en")).status, 200);
  assert.equal(
    (await run("US", "/", "dx_lang=zh")).headers.get("location"),
    "/zh",
  );
  assert.equal((await run("CN", "/zh", "dx_lang=en")).status, 200);
  assert.equal((await run("US", "/?lang=zh", "dx_lang=en")).status, 302);
  assert.equal((await run("US", "/?lang=invalid")).status, 200);
});
test("client-supplied country headers cannot change the locale", async () => {
  assert.equal(
    (await run(undefined, "/", "", { "CF-IPCountry": "CN" })).status,
    200,
  );
});
