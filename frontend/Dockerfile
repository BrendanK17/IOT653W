# Stage 1: build the React app
FROM node:20-slim AS build

WORKDIR /app

# Copy dependency files first for layer caching
COPY package.json package-lock.json ./

RUN npm ci

# Copy application source and build
COPY . .

RUN npm run build


# Stage 2: NGINX runtime
FROM nginx:1.26-alpine

RUN apk add --no-cache gettext

COPY --from=build /app/dist /usr/share/nginx/html
COPY public/config.template.js /usr/share/nginx/html/config.template.js

EXPOSE 80

CMD sh -c "envsubst '\$VITE_API_BASE' < /usr/share/nginx/html/config.template.js > /usr/share/nginx/html/config.js && nginx -g 'daemon off;'"
