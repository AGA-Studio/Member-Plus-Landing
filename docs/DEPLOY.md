# Despliegue de la landing

La landing y la aplicación comparten `https://memberplus.neyzt.org`. Son **dos
contenedores distintos** en el proyecto `Member+` de Coolify y quien reparte el
tráfico es el proxy de la instancia (Traefik v3.7): cada app declara sus propias
rutas y el router con la regla más específica gana.

| Ruta | La atiende |
|---|---|
| `/`, `/privacidad`, `/terminos`, `/en*` | landing (nginx, esta imagen) |
| `/_astro/*`, `/screens/*`, los `.webp` de `/brand/`, `robots.txt`, `sitemap.xml`, iconos | landing |
| `/login`, `/panel`, `/clientes`, `/niveles`, `/movimientos`, `/usuarios`, `/configuracion`, `/plataforma`, `/caja`, `/imprimir`, `/tarjeta`, `/sin-conexion` | frontend (Next) |
| `/api/*`, `/_next/*` | frontend (Next; `/api` lo reenvía al API) |

## Por qué el campo *Domains* va vacío

Coolify genera un router por cada dominio del campo, siempre con la regla
`Host(...) && PathPrefix(<ruta del dominio>)`. Si ahí se pusiera
`https://memberplus.neyzt.org/`, el router de la landing quedaría empatado con el
del frontend (misma regla, misma prioridad) y el reparto dependería del orden en
que Traefik cargue los dos contenedores — que cambia en cada deploy.

Por eso el dominio de la landing **no** se declara en *Domains*: se declaran las
labels a mano, con un router de prioridad alta y la lista exacta de rutas. El
frontend conserva su `PathPrefix(/)` y solo atiende lo que la landing no reclama.

## Configuración de la app en Coolify

Aplicación tipo **Docker Image** en el proyecto `Member+`:

| Campo | Valor |
|---|---|
| Image | `ghcr.io/aga-studio/member-plus-landing:latest` |
| Puerto expuesto | `80` |
| Dominios | *(vacío)* |
| Readonly labels | **apagado** (si no, no se pueden agregar las labels) |
| Healthcheck | vacío: la imagen ya declara `HEALTHCHECK` |

Y estas labels (Application → *Custom Labels*):

```text
traefik.enable=true
traefik.http.services.landing.loadbalancer.server.port=80
traefik.http.routers.landing-https.rule=Host(`memberplus.neyzt.org`) && (Path(`/`) || Path(`/en`) || PathPrefix(`/en/`) || Path(`/privacidad`) || PathPrefix(`/privacidad/`) || Path(`/terminos`) || PathPrefix(`/terminos/`) || PathPrefix(`/_astro/`) || PathPrefix(`/screens/`) || Path(`/robots.txt`) || Path(`/sitemap.xml`) || Path(`/favicon.ico`) || Path(`/icon.png`) || Path(`/apple-icon.png`) || Path(`/brand/icon-on-dark.webp`) || Path(`/brand/icon-on-light.webp`) || Path(`/brand/logo-on-dark.webp`))
traefik.http.routers.landing-https.entryPoints=https
traefik.http.routers.landing-https.priority=100
traefik.http.routers.landing-https.tls=true
traefik.http.routers.landing-https.tls.certresolver=letsencrypt
traefik.http.routers.landing-https.service=landing
```

El router de la landing **no** lleva el middleware de `X-Robots-Tag`: el sitio se
indexa. La app del frontend sí lo lleva (Coolify → *Search Engine Indexing*
encendido), de modo que `/login`, `/panel`, `/caja` y `/tarjeta/*` quedan fuera
del índice sin tocar el código.

## Verificación

```bash
# La landing responde y se puede indexar
curl -sI https://memberplus.neyzt.org/ | grep -E 'HTTP/|X-Robots-Tag|Cache-Control'
curl -s https://memberplus.neyzt.org/ | grep -o '<link rel="canonical"[^>]*>'
curl -s https://memberplus.neyzt.org/robots.txt

# La app sigue viva y sí va marcada como noindex
curl -sI https://memberplus.neyzt.org/login | grep -E 'HTTP/|X-Robots-Tag'
curl -s -o /dev/null -w '%{http_code}\n' https://memberplus.neyzt.org/api/v1/health

# Un asset de la landing no debe servirse desde el frontend
curl -s -o /dev/null -w '%{http_code}\n' https://memberplus.neyzt.org/screens/panel-es.webp
```

## Rollback

Como el frontend sigue siendo el dueño del host, revertir la landing es apartar su
app: apagar el contenedor (o cambiar el tag a un `sha-<7>` anterior) y `/` vuelve a
redirigir a `/login` en el siguiente request. No hay que tocar el frontend ni DNS.
