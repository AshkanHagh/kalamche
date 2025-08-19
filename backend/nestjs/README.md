# Project Setup

## Prerequisites
- Docker and Docker Compose
- pnpm

## Installation

```bash
pnpm install
```

## Running the Application

```bash
# Start with Docker Compose
docker-compose up -d

pnpm start:dev
```

## Database

```bash
# Generate migrations
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed

# Open Drizzle Studio
pnpm db:studio
```

## Testing

```bash
# Run all tests
pnpm test

pnpm test:watch
```
