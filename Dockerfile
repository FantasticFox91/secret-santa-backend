# Pull the base image
FROM node:18.16.0

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json yarn.lock ./

# Install dependencies
RUN yarn install

# Copy all files
COPY . .

# Build the app
RUN yarn build

# Copy email templates
COPY src/mail/templates /app/dist/mail/templates

# Copy email templates
COPY src/prisma/seed.ts /app/dist/prisma/seed.ts

EXPOSE 80

# Start the backend server
CMD ["yarn", "start:prod"]
