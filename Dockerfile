# Base image
FROM node:20-alpine AS base
WORKDIR /usr/src/app
COPY package*.json ./

# Dev image (hot reload, nodemon)
FROM base as dev
RUN npm install
COPY . .
CMD ["npm", "run", "dev"]

# Prod image (smaller, no dev steps)
FROM base as prod
RUN npm ci --omit=dev
COPY . .
CMD ["npm", "start"]
