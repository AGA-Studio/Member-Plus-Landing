async page => {
  const out = "__ROOT__/tools/captures/";
  const base = "http://localhost:3100";
  const browser = page.context().browser();
  for (const locale of ["es", "en"]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    await ctx.addCookies([
      { name: "access_token", value: "cashier." + locale + ".volcan", url: base },
      { name: "NEXT_LOCALE", value: locale, url: base },
    ]);
    await ctx.addInitScript(() => {
      const canvas = document.createElement("canvas");
      canvas.width = 16;
      canvas.height = 16;
      navigator.mediaDevices.getUserMedia = async () => canvas.captureStream();
    });
    const p = await ctx.newPage();
    const clean = () => p.addStyleTag({ content: "nextjs-portal{display:none!important} video{opacity:0!important}" });
    const shot = async (name) => { await clean(); await p.waitForTimeout(700); await p.screenshot({ path: out + "desk-cashier-" + name + "-" + locale + ".png" }); };
    const open = async (path) => { await p.goto(base + path, { waitUntil: "networkidle" }); await p.waitForTimeout(2000); };
    const hydrated = () => p.waitForFunction(() => { const el = document.querySelector("button"); return el && Object.keys(el).some((k) => k.startsWith("__reactProps")); }, null, { timeout: 30000 });
    await open("/caja");
    await shot("empty");
    await hydrated();
    await p.getByRole("button").filter({ hasText: /Escanear tarjeta|Scan card/ }).first().click();
    await p.waitForTimeout(900);
    await shot("dialog");
    await open("/caja?code=MP-K7Q4N");
    await shot("member");
    await p.waitForFunction(() => { const el = document.querySelector('input[name="amount"]'); return el && Object.keys(el).some((k) => k.startsWith("__reactProps")); }, null, { timeout: 30000 });
    const amount = p.locator('input[name="amount"]');
    await amount.click();
    await amount.pressSequentially("1000", { delay: 50 });
    await shot("amount");
    await open("/caja/comprobante/1");
    await shot("receipt");
    await ctx.close();
  }
  return "ok";
}
