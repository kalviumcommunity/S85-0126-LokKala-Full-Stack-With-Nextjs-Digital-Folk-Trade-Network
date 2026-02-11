# Use official Node.js image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --legacy-peer-deps

# Install platform-specific TailwindCSS binaries for Alpine Linux ARM64
RUN npm install --no-save @tailwindcss/oxide-linux-arm64-musl lightningcss-linux-arm64-musl

# Copy application code
COPY . .

# Generate Prisma Client for Linux
RUN npx prisma generate

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3000

# Start application
CMD ["npm", "run", "start"]
