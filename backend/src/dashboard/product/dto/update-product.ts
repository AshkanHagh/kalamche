import z from "zod";

export const updateProductDto = z.object({
  name: z.string().optional(),
  originalName: z.string().optional(),
  description: z.string().optional(),
  details: z
    .object({
      title: z.string(),
      description: z.string(),
    })
    .array()
    .optional(),
  price: z.number().optional(),
  images: z
    .object({
      id: z.string(),
      url: z.string(),
    })
    .array()
    .optional(),
  category: z.string().array().optional(),
  callbackUrl: z.string().url().optional(),
});

export type UpdateProductDto = z.infer<typeof updateProductDto>;
