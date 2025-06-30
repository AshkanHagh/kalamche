## Getting Started

### Prerequisites

- Node.js (v18+)
- Docker

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/AshkanHagh/kalamche.git
   cd kalamche/backend/nestjs
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Set up PostgreSQL, Mailhog, Minio using Docker:

   ```bash
   docker-compose up -d
   ```

4. Run database migrations with Drizzle ORM:

   ```bash
   pnpm run db:generate
   pnpm run db:migrate
   ```

5. Start the application:

   ```bash
   npm run start:dev
   ```
