async page => {
  const out = "__ROOT__/tools/captures/";
  const base = "http://localhost:3100";
  const browser = page.context().browser();
  const res = {};
  const variants = [
    ["phone", { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, reducedMotion: "reduce" }],
    ["desk", { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" }],
  ];
  for (const [kind, options] of variants) {
    for (const locale of ["es", "en"]) {
      const ctx = await browser.newContext(options);
      await ctx.addCookies([
        { name: "access_token", value: "cashier." + locale + ".volcan", url: base },
        { name: "NEXT_LOCALE", value: locale, url: base },
      ]);
      const p = await ctx.newPage();
      const shot = async (name) => { await p.addStyleTag({ content: "nextjs-portal{display:none!important}" }); await p.waitForTimeout(600); await p.screenshot({ path: out + kind + "-" + name + "-" + locale + ".png" }); };
      const open = async (path) => { await p.goto(base + path, { waitUntil: "networkidle" }); await p.waitForTimeout(2000); };
      if (kind === "phone") {
        await open("/caja");
        await shot("cashier-empty");
        await open("/caja?code=MP-K7Q4N");
        await shot("cashier-member");
        await p.waitForFunction(() => { const el = document.querySelector('input[name="amount"]'); return el && Object.keys(el).some((k) => k.startsWith("__reactProps")); }, null, { timeout: 30000 });
        const amount = p.locator('input[name="amount"]');
        await amount.click(); await amount.pressSequentially("1000", { delay: 60 });
        await p.waitForTimeout(500);
        await p.evaluate(() => { window.scrollTo(0, document.body.scrollHeight); for (const el of document.querySelectorAll("*")) { const o = getComputedStyle(el).overflowY; if ((o === "auto" || o === "scroll") && el.scrollHeight > el.clientHeight + 4) el.scrollTop = el.scrollHeight; } });
        await shot("cashier-amount");
        await open("/caja/comprobante/1");
        await shot("receipt");
      } else {
        await ctx.addCookies([{ name: "access_token", value: "admin." + locale + ".volcan", url: base }]);
        await open("/clientes");
        await shot("customers");
        await open("/niveles");
        await shot("tiers");
        await open("/movimientos");
        await shot("movements");
        await open("/clientes/1");
        await shot("customer-file");
      }
      await ctx.close();
      res[kind + locale] = "ok";
    }
  }
  return res;
}
