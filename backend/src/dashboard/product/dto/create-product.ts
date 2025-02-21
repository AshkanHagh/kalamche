import z from "zod";

export const createProductDto = z.object({
  storeId: z.string().uuid(),
  name: z.string(),
  originalName: z.string(),
  description: z.string(),
  details: z
    .object({
      title: z.string(),
      description: z.string(),
    })
    .array(),
  price: z.number(),
  images: z
    .object({
      id: z.string(),
      url: z.string(),
    })
    .array(),
  category: z.string().array(),
  callbackUrl: z.string().url(),
});

export type CreateProductDto = z.infer<typeof createProductDto>;
