# Build stage
FROM node:18-slim as build-stage

WORKDIR /app

# Install dependencies first for better caching
COPY package*.json ./
RUN npm install

# Copy source and build
COPY . .

# Set build-time variables (Note: Vite needs these at build time for client injection)
ARG VITE_API_URL=/api/v1
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Production stage
FROM node:18-slim as production-stage

WORKDIR /app

# Install 'serve' package to handle the static dist folder
RUN npm install -g serve

# Copy built assets from build-stage
COPY --from=build-stage /app/dist /app/dist

EXPOSE 3000

# Start serving the production build on port 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
