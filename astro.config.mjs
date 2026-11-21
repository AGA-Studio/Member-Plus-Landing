import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // El canonical y las etiquetas hreflang salen de aquí: un build de producción
  // tiene que apuntar al dominio público, nunca a localhost. El CI lo fija con
  // SITE_URL; el default es el dominio real para que un `npm run build` local no
  // publique canonicals a localhost:4321.
  site: process.env.SITE_URL ?? "https://memberplus.neyzt.org",
  integrations: [react()],
  i18n: {
    defaultLocale: "es",
    locales: ["es", "en"],
    routing: { prefixDefaultLocale: false },
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
