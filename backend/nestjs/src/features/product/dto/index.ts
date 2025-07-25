import { z } from "zod";

export const CreateProductSchema = z.object({
  upc: z.string(),
});

export type CreateProductDto = z.infer<typeof CreateProductSchema>;

export const CompleteProductCreationSchema = z.object({
  title: z.string(),
  description: z.string(),
  categories: z.array(z.string()),
  brand: z.string(),
  specifications: z.array(z.object({ key: z.string(), value: z.string() })),
  websiteUrl: z.string().url(),
  initialPrice: z.number(),
  modelNumber: z.string(),
});

export type CompleteProductCreationDto = z.infer<
  typeof CompleteProductCreationSchema
>;

export const CreateOfferSchema = z.object({
  title: z.string().max(255),
  finalPrice: z.number(),
  pageUrl: z.string().url(),
});

export type CreateOfferDto = z.infer<typeof CreateOfferSchema>;

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
