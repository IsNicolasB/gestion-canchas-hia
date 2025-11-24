FROM node:20-alpine

WORKDIR /usr/src/app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias de producción
RUN npm ci --only=production

# Copiar código fuente
COPY . .

# Variables temporales para Swagger
ENV MONGODB_URI="mongodb://localhost/temp_db"
ENV SWAGGER_BUILD_MODE="true"

# Generar Swagger
RUN npm run swagger

# Limpiar variables temporales
ENV MONGODB_URI=""
ENV SWAGGER_BUILD_MODE=""

EXPOSE 3000

CMD ["npm", "start"]