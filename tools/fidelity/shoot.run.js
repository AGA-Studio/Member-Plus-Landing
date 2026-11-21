async page => {
  const browser = page.context().browser();
  for (const locale of ["es", "en"]) {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    for (const state of ["empty", "dialog", "member", "amount", "receipt"]) {
      await p.goto("http://localhost:4321/fidelity?state=" + state + "&lang=" + locale, { waitUntil: "networkidle" });
      await p.waitForTimeout(900);
      await p.screenshot({ path: "__ROOT__/.tmp/fidelity/mine-" + state + "-" + locale + ".png" });
    }
    await ctx.close();
  }
  return "ok";
}
