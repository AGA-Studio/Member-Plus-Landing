import type { APIRoute } from "astro";
import { defaultLocale, locales, localePath, type Locale } from "@/i18n";

// Solo se anuncian las páginas indexables: las legales llevan `noindex`
// mientras su texto sea un marcador de posición (ver LegalPage.astro).
export const prerender = true;

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("https://memberplus.neyzt.org");
  const url = (path: string) => new URL(path, origin).toString();

  const home = Object.fromEntries(locales.map((code: Locale) => [code, localePath(code)])) as Record<Locale, string>;

  const alternates = locales
    .map((code) => `    <xhtml:link rel="alternate" hreflang="${code}" href="${url(home[code])}" />`)
    .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${url(home[defaultLocale])}" />`)
    .join("\n");

  const entries = locales
    .map(
      (code) => `  <url>
    <loc>${url(home[code])}</loc>
${alternates}
  </url>`,
    )
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries}
</urlset>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
