# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the app and build
COPY . .
RUN npm run build

# Runtime stage
FROM nginx:1.27-alpine

# SPA fallback for react-router
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Runtime env injection for VITE_* variables
COPY docker-entrypoint-env.sh /docker-entrypoint.d/99-env.sh
RUN chmod +x /docker-entrypoint.d/99-env.sh

# Copy built assets
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
