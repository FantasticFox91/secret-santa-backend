# Pull the base image
FROM node:18.16.0

# Install netcat-openbsd
RUN apt-get update && apt-get install -y netcat-openbsd

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

# Copy prisma seed
COPY src/prisma/seed.ts /app/dist/prisma/seed.ts

# Copy entrypoint script and ensure it's executable
COPY ./entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh

# Set entrypoint (use absolute path)
ENTRYPOINT ["/app/entrypoint.sh"]

EXPOSE 80

# Start the backend server
CMD ["yarn", "start:prod"]
