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
  // Saved English preference on the Chinese homepage routes back to English.
  const backToEnglish = await run("CN", "/zh", "dx_lang=en");
  assert.equal(backToEnglish.status, 302);
  assert.equal(backToEnglish.headers.get("location"), "/");
  assert.equal((await run("US", "/?lang=zh", "dx_lang=en")).status, 302);
  assert.equal((await run("US", "/?lang=invalid")).status, 200);
});
test("inner pages route between the English root tree and the /zh/ tree", async () => {
  const cnAnswer = await run("CN", "/wenda/have-child-or-not");
  assert.equal(cnAnswer.status, 302);
  assert.equal(cnAnswer.headers.get("location"), "/zh/wenda/have-child-or-not");
  const cnTopic = await run("CN", "/chengzhang");
  assert.equal(cnTopic.headers.get("location"), "/zh/chengzhang");
  const cnCase = await run("CN", "/anli/startup-partner-or-solo?x=1");
  assert.equal(
    cnCase.headers.get("location"),
    "/zh/anli/startup-partner-or-solo?x=1",
  );
  const usZhAnswer = await run("US", "/zh/wenda/have-child-or-not");
  assert.equal(usZhAnswer.status, 302);
  assert.equal(usZhAnswer.headers.get("location"), "/wenda/have-child-or-not");
  const usAnswer = await run("US", "/wenda/have-child-or-not");
  assert.equal(usAnswer.status, 200);
  assert.equal(usAnswer.headers.get("content-language"), "en");
  const cnZhAnswer = await run("CN", "/zh/wenda/have-child-or-not");
  assert.equal(cnZhAnswer.status, 200);
  assert.equal(cnZhAnswer.headers.get("content-language"), "zh-CN");
  assert.equal((await run("US", "/zh/chengzhang", "dx_lang=zh")).status, 200);
  const explicit = await run("CN", "/chengzhang?lang=en");
  assert.equal(explicit.status, 200);
  assert.match(
    explicit.headers.get("set-cookie"),
    /^dx_lang=en;.*Secure; SameSite=Lax$/,
  );
});
test("assets and data files are never locale-redirected", async () => {
  for (const path of [
    "/asset/tailwind.css",
    "/ai-answers.json",
    "/sitemap.xml",
    "/llms.txt",
    "/about.json",
    "/favicon.ico",
  ]) {
    const response = await run("CN", path);
    assert.equal(response.status, 200, path);
    assert.equal(response.headers.get("x-test"), "preserved", path);
  }
});
test("client-supplied country headers cannot change the locale", async () => {
  assert.equal(
    (await run(undefined, "/", "", { "CF-IPCountry": "CN" })).status,
    200,
  );
});
