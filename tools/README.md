# Herramientas de desarrollo

Nada de esta carpeta se publica con el sitio.

- `tools/mock-api/server.mjs`: API simulada (puerto 8000) con negocios y clientes ficticios. Con `API_INTERNAL_URL=http://127.0.0.1:8000` el frontend real del producto corre contra ella. La cookie `access_token` lleva `rol.idioma.negocio`, por ejemplo `cashier.es.volcan`.
- `tools/captures/*.run.js`: guiones de `playwright-cli run-code` (reemplaza `__ROOT__` por la ruta del proyecto) que guardan las pantallas reales del producto en `tools/captures/`.
- `tools/fidelity/`: comparación de fidelidad entre la pantalla de caja portada (`src/product/`) y la real. Copia `fidelity.astro` a `src/pages/` y `FidelityPreview.tsx` a `src/islands/`, levanta el sitio, corre `shoot.run.js` y luego `node tools/fidelity/compare.mjs` (usa `pixelmatch`). Borra los dos archivos copiados al terminar.
- `tools/captures/screens.run.js` y `encode.mjs`: capturas de las pantallas del producto a 1440×900 con `deviceScaleFactor` 2 (panel, clientes, ficha, niveles, movimientos, comprobante y tarjeta digital, en es y en) y su codificación a WebP calidad 90 en `public/screens/`.
