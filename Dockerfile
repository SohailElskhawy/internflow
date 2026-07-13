# Use official Node.js runtime as parent image
FROM node:20-alpine

# Install postgresql-client to get pg_isready
RUN apk add --no-cache postgresql-client

# Set the working directory in container
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy remaining code files
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application with env validation bypassed during build
ENV SKIP_ENV_VALIDATION=true
RUN npm run build

# Expose port 3000
EXPOSE 3000

# Default command to run the app
CMD ["npm", "run", "start"]
