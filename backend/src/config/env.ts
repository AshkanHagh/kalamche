import * as z from "zod";

export default function envValidation() {
  return z.object({
    NODE_ENV: z.string().default("development"),
    PORT: z.coerce.number(),
    DATABASE_URL: z.string(),
  });
}
