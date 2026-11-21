async page => {
  const out = "__ROOT__/tools/captures/";
  const base = "http://localhost:3100";
  const browser = page.context().browser();
  const shots = [
    ["panel", "admin", "/panel"],
    ["customers", "admin", "/clientes"],
    ["file", "admin", "/clientes/MP-K7Q4N"],
    ["tiers", "admin", "/niveles"],
    ["movements", "admin", "/movimientos"],
    ["receipt", "cashier", "/caja/comprobante/1"],
    ["card", "admin", "/tarjeta/demo-__LOCALE__"],
  ];
  for (const locale of ["es", "en"]) {
    for (const [name, role, path] of shots) {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
      await ctx.addCookies([
        { name: "access_token", value: role + "." + locale + ".volcan", url: base },
        { name: "NEXT_LOCALE", value: locale, url: base },
      ]);
      const p = await ctx.newPage();
      const target = base + path.replace("__LOCALE__", locale);
      await p.goto(target, { waitUntil: "networkidle" });
      await p.reload({ waitUntil: "networkidle" });
      await p.waitForTimeout(3800);
      await p.addStyleTag({ content: "nextjs-portal{display:none!important}" });
      await p.waitForTimeout(300);
      await p.screenshot({ path: out + "hd-" + name + "-" + locale + ".png" });
      await ctx.close();
    }
  }
  return "ok";
}
