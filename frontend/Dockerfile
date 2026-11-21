# Etapa 1: compilar la aplicación Angular
FROM node:22-alpine AS build
WORKDIR /app

# Copiar primero los manifiestos para reutilizar la caché de Docker al cambiar solo código
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del proyecto y generar el bundle de producción
COPY . .
RUN npm run build

# Etapa 2: servir los archivos estáticos con Nginx (imagen final muy ligera)
FROM nginx:alpine AS serve

# El builder "application" de Angular deja el sitio estático en dist/frontend/browser.
# Con SSR activo, Angular 22 genera el shell como index.csr.html en vez de index.html,
# así que además se publica ese archivo como index.html para Nginx.
COPY --from=build /app/dist/frontend/browser/ /usr/share/nginx/html/
COPY --from=build /app/dist/frontend/browser/index.csr.html /usr/share/nginx/html/index.html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
