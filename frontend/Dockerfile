# Dockerfile (frontend - Producción)
FROM node:18-alpine AS build

WORKDIR /app

ENV NG_CLI_ANALYTICS=false

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

RUN ls -la /app/dist/football/browser/


FROM nginx:alpine

COPY --from=build /app/dist/football/browser /usr/share/nginx/html

RUN ls -la /usr/share/nginx/html

COPY nginx-custom.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]