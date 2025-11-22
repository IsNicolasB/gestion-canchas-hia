# Dockerfile.dev (frontend - Desarrollo)
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Deshabilita el análisis de Angular CLI
ENV NG_CLI_ANALYTICS=false

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm ci

# Configura Angular CLI para no preguntar por analytics
RUN npx ng config -g cli.analytics false

# Copia el resto de la aplicación
COPY . .

# Expone el puerto de desarrollo de Angular
EXPOSE 4200

# Comando para iniciar la aplicación en modo desarrollo
CMD ["npx", "ng", "serve", "--host", "0.0.0.0", "--disable-host-check"]