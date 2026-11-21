import type { APIRoute } from "astro";

export const prerender = true;

// Las rutas de la aplicación las sirve el frontend de Next, no esta landing.
// Se piden desde SITE_URL para que un build local no anuncie el sitemap de
// producción bajo otro origen.
export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL("https://memberplus.neyzt.org");
  const sitemap = new URL("/sitemap.xml", origin).toString();

  const body = `User-agent: *
Allow: /

# Rutas privadas: las sirve el frontend y responden con X-Robots-Tag noindex.
Disallow: /api/
Disallow: /login
Disallow: /panel
Disallow: /clientes
Disallow: /niveles
Disallow: /movimientos
Disallow: /usuarios
Disallow: /configuracion
Disallow: /plataforma
Disallow: /caja
Disallow: /imprimir
Disallow: /tarjeta
Disallow: /sin-conexion

Sitemap: ${sitemap}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
