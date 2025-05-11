# Use a slim, fast Node image
FROM node:20-slim

# Create working directory
WORKDIR /app

# Install minimal system tools needed for Yarn
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl ca-certificates git \
    && rm -rf /var/lib/apt/lists/*

# Only copy lock files to leverage Docker cache
COPY package.json yarn.lock ./

# Validate lockfile and install exact dependencies
RUN yarn install --check-files --frozen-lockfile

# Now copy the rest of the frontend app
COPY . .

# Optional: optimize build cache further
# RUN yarn build    # ← only if you're building static assets

EXPOSE 5173

# Start Vite dev server (for development use)
CMD ["yarn", "dev"]
