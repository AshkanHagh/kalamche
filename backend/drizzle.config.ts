import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/database/schemas",
  out: "./src/database/migrations",
  dialect: "postgresql",
  casing: "snake_case",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  strict: true,
  verbose: true,
});
