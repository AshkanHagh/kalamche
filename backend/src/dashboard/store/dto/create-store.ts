import z from "zod";

export const createStoreDto = z.object({
  name: z.string(),
  description: z.string(),
  image: z.object({
    id: z.string().uuid(),
    url: z.string().url(),
  }),
  siteUrl: z.string().url(),
});

export type CreateStoreDto = z.infer<typeof createStoreDto>;
