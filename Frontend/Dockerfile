# --- Build Stage ---
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Install system tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

# Copy lock files first for better Docker caching
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --check-files --frozen-lockfile

# Copy the rest of the codebase
COPY . .

# Build the production static site
RUN yarn build

# --- Run Stage ---
FROM node:20-slim

WORKDIR /app

# Copy build output and dependencies from builder
COPY --from=builder /app /app

# Expose Vite preview port
EXPOSE 4173

# Production preview server
CMD ["yarn", "preview", "--host"]
