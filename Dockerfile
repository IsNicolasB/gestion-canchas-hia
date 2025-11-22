# Dockerfile (backend-hia/Dockerfile)
FROM node:20-alpine

WORKDIR /usr/src/app

# 1. Copia e instala dependencias (Solo archivos package*.json)
COPY package.json package-lock.json ./
RUN npm install

# ------------------------------------------------
# PASO CRÍTICO: Copiar TODO EL CÓDIGO FUENTE ANTES de ejecutar el script Swagger
# Esto garantiza que todas las dependencias internas (rutas, controladores, modelos, etc.) existan.
COPY . . 
ENV MONGODB_URI="mongodb://localhost/temp_db" 
# SWAGGER_BUILD_MODE (para evitar que el servidor intente conectarse a MongoDB)
ENV SWAGGER_BUILD_MODE="true" 

RUN npm run swagger

# IMPORTANTE: Limpiar las variables del entorno final del contenedor
RUN unset MONGODB_URI
RUN unset SWAGGER_BUILD_MODE
# ------------------------------------------------

# Mantiene la solución para evitar el conflicto de volumen de desarrollo
RUN mv node_modules /tmp/node_modules_cache
RUN ln -s /tmp/node_modules_cache node_modules 

EXPOSE 3000

CMD [ "npm", "start" ]