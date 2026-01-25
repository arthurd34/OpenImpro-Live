# ---------- Build Stage ----------
FROM node:20-alpine AS build
WORKDIR /app
COPY . .
RUN yarn install
RUN yarn build

# ---------- Prod Stage ----------
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
