import z from "zod";

export const productSearchDto = z.object({
  limit: z.coerce.number().positive().max(50),
  offset: z.coerce.number().min(0),
  name: z.string(),
});

export type ProductSearchDto = z.infer<typeof productSearchDto>;
