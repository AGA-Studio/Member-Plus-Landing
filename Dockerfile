# La landing es estática: Astro compila a HTML/CSS/JS y nginx lo sirve. La
# imagen final no lleva Node, así que arranca en un segundo.

FROM node:22-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

COPY . .

# De aquí salen el canonical, las etiquetas hreflang, robots.txt y sitemap.xml.
# Con el default de astro.config.mjs el build local apunta al dominio público;
# el CI y Coolify pasan este argumento para dejarlo escrito en la imagen.
ARG SITE_URL=https://memberplus.neyzt.org
ENV SITE_URL=$SITE_URL
RUN npm run build


FROM nginx:1.29-alpine AS runner

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

# Coolify lee este HEALTHCHECK en vez de configurar el suyo en el panel: su
# healthcheck por HTTP necesita curl o wget dentro de la imagen y aquí solo hay
# busybox, así que el que se declara es este.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://127.0.0.1/healthz.txt >/dev/null || exit 1
