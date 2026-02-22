# backend/Dockerfile
FROM node:20-alpine

# Set production environment
ENV NODE_ENV=production

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json yarn.lock* ./
RUN yarn install --production --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Ensure the "shows" and "db" directories exist and are writable
RUN mkdir -p shows && chmod 777 shows

EXPOSE 3000

# Start with node directly, not nodemon
CMD ["node", "src/server.js"]