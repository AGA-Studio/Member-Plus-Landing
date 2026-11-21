# Member+ — landing pública

Sitio de marketing de Member+ (Astro 7 + Tailwind 4, salida 100 % estática). Se sirve
en `https://memberplus.neyzt.org` y comparte dominio con la aplicación: esta landing
atiende las rutas públicas y el frontend de Next atiende `/login`, `/panel`, `/caja` y
el resto de la app.

## Desarrollo

```bash
npm ci
npm run dev        # http://localhost:4321
npm run build      # genera dist/
npm run preview    # sirve dist/
npm run typecheck  # astro sync && tsc --noEmit
```

`SITE_URL` decide el origen que se escribe en `<link rel="canonical">`, en las
etiquetas `hreflang`, en `robots.txt` y en `sitemap.xml`. Por omisión es el dominio
público; para probar otro origen:

```bash
SITE_URL=http://localhost:4321 npm run build
```

## Imagen

El `Dockerfile` compila con Node y sirve el resultado con nginx. La imagen final no
lleva Node.

```bash
docker build --network=host -t memberplus-landing .   # --network=host: DNS del host
docker run --rm -p 8080:80 memberplus-landing
curl -sI http://127.0.0.1:8080/ | head -3
```

`docker/nginx.conf` resuelve las rutas que Astro emite como `directorio/index.html`
(`/privacidad` y `/privacidad/` sirven lo mismo), cachea `/_astro/` para siempre y
devuelve 404 —no un fallback— cuando un archivo no existe.

## Despliegue

Cada push a `main` publica `ghcr.io/aga-studio/member-plus-landing:latest` y llama al
webhook de Coolify, que redespliega la app. Los tags son `sha-<7>` (inmutable, para
fijar y revertir), `main`, la versión en los `v*` y `latest` (móvil, solo en `main`).

En Coolify la landing **no** se queda con el dominio en el campo *Domains*: el router
que la publica se declara en las labels del contenedor con prioridad alta y una regla
que solo reclama las rutas del sitio (`/`, `/privacidad`, `/terminos`, `/en*`,
`/_astro/*`, `/screens/*`, `/robots.txt`, `/sitemap.xml`, los iconos y los tres
`.webp` de `/brand/`). El resto del host lo sigue atendiendo el frontend. El detalle
está en `docs/DEPLOY.md` del repo de la landing y en la wiki del proyecto.
