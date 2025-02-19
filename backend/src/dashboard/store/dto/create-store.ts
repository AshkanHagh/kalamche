import z from "zod";

export const createStoreDto = z.object({
  name: z.string(),
  description: z.string(),
  imageId: z.string().uuid(),
  siteUrl: z.string().url(),
});

export type CreateStoreDto = z.infer<typeof createStoreDto>;
