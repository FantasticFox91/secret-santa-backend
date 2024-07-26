#!/bin/sh
set -e

echo "Starting entrypoint script..."

# Wait for the MySQL service to be ready

echo "MySQL is ready. Running migrations and seeds..."

Run Prisma migrations
npx prisma migrate deploy

Run Prisma migrations
npx prisma migrate dev --name init

Seed the database
npx prisma db seed

# Start the application
echo "Starting the application..."
exec "$@"
