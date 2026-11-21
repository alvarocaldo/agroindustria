# Etapa 1: compilar la aplicación Angular
FROM node:20-alpine AS build
WORKDIR /app

# Copiar primero los manifiestos para reutilizar la caché de Docker al cambiar solo código
COPY package.json package-lock.json ./
RUN npm install

# Copiar el resto del proyecto y generar el bundle de producción
COPY . .
RUN npm run build

# Etapa 2: servir los archivos estáticos con Nginx (imagen final muy ligera)
FROM nginx:alpine AS serve

# El builder "application" de Angular deja el sitio estático en dist/frontend/browser
COPY --from=build /app/dist/frontend/browser/ /usr/share/nginx/html/
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
