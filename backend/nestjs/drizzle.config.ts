import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./src/drizzle/migrations",
  schema: "./src/drizzle/schema",
  dialect: "postgresql",
  casing: "snake_case",
  verbose: true,
  breakpoints: true,
  strict: true,
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
