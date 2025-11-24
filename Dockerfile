FROM node:20-alpine AS builder

# Backend setup
WORKDIR /app/backend
COPY backend/package*.json ./
RUN npm install
COPY backend/ .
ENV MONGODB_URI="mongodb://localhost/temp_db"
ENV SWAGGER_BUILD_MODE="true"
RUN npm run swagger

# Frontend setup
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Final image
FROM nginx:alpine
RUN apk add --no-cache nodejs npm supervisor

# Copy backend
COPY --from=builder /app/backend /app/backend
WORKDIR /app/backend

# Copy frontend build to nginx (ajustado al path correcto)
COPY --from=builder /app/frontend/dist/football/browser /usr/share/nginx/html

# Copy nginx config
COPY frontend/nginx-custom.conf /etc/nginx/conf.d/default.conf

# Copy supervisord config
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 80 3000

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]
