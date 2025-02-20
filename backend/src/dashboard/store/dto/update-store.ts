import z from "zod";

export const updateStoreDto = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  image: z
    .object({
      id: z.string().uuid(),
      url: z.string().url(),
    })
    .optional(),
  siteUrl: z.string().url().optional(),
});

export type UpdateStoreDto = z.infer<typeof updateStoreDto>;
