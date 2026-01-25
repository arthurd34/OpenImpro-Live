FROM node:20-alpine

WORKDIR /app

# Copy package.json & yarn.lock
COPY package.json yarn.lock ./

# Copy the rest of your source code
COPY . .

# Install dependencies with yarn
RUN yarn install

EXPOSE 3000

# Run in dev mode (ou prod selon ton script)
CMD ["yarn", "dev"]
