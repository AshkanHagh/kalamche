import { z } from "zod";

const sort = z.enum(["cheapest", "view", "newest", "expensive", "popular"]);

export const SearchSchema = z.object({
  sort,
  brand: z.string().max(255),
  q: z.string().max(255),
  prMax: z.coerce.number(),
  prMin: z.coerce.number(),
  offset: z.coerce.number().default(0),
  limit: z.coerce.number().default(10),
});

export type SearchDto = z.infer<typeof SearchSchema>;
