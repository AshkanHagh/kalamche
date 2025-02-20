import z from "zod";

export const updateStoreDto = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  imageId: z.string().uuid().optional(),
  siteUrl: z.string().url().optional(),
});

export type UpdateStoreDto = z.infer<typeof updateStoreDto>;
