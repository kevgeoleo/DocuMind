# --- Stage 1: Compile Assets ---
FROM node:20-alpine AS build-stage
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# --- Stage 2: Serve via Nginx Server ---
FROM nginx:alpine
# Copy compiled static assets directly to Nginx public webroot directory
COPY --from=build-stage /usr/src/app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]