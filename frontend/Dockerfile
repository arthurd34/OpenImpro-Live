# frontend/Dockerfile

# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package.json yarn.lock* ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

# Stage 2: Serve
FROM nginx:stable-alpine
# On copie les fichiers compilés
COPY --from=build /app/dist /usr/share/nginx/html
# ON AJOUTE CETTE LIGNE : On remplace la config par défaut d'Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]