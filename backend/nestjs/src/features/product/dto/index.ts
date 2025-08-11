import { z } from "zod";
import { createZodDto } from "nestjs-zod";

export const CreateProductSchema = z.object({
  upc: z.string(),
});

export type CreateProductPayload = z.infer<typeof CreateProductSchema>;
export class CreateProductDto extends createZodDto(CreateProductSchema) {}

export const CompleteProductCreationSchema = z.object({
  title: z.string(),
  description: z.string(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid(),
  specifications: z.array(z.object({ key: z.string(), value: z.string() })),
  websiteUrl: z.string().url(),
  initialPrice: z.number(),
  finalPrice: z.number(),
  modelNumber: z.string(),
});

export type CompleteProductCreationPayload = z.infer<
  typeof CompleteProductCreationSchema
>;
export class CompleteProductCreationDto extends createZodDto(
  CompleteProductCreationSchema,
) {}

export const CreateOfferSchema = z.object({
  title: z.string().max(255),
  finalPrice: z.number(),
  pageUrl: z.string().url(),
});

export type CreateOfferPayload = z.infer<typeof CreateOfferSchema>;
export class CreateOfferDto extends createZodDto(CreateOfferSchema) {}

const sort = z.enum([
  "cheapest",
  "view",
  "newest",
  "expensive",
  "popular",
  "relevent",
]);

export const SearchSchema = z.object({
  sort,
  brand: z.string().max(255).optional(),
  q: z.string().max(255),
  prMax: z.coerce.number().optional(),
  prMin: z.coerce.number().optional(),
  offset: z.coerce.number(),
  limit: z.coerce.number(),
});

export type SearchPayload = z.infer<typeof SearchSchema>;
export class SearchDto extends createZodDto(SearchSchema) {}

export const RedirectToProductPageSchema = z.object({
  shopId: z.string().uuid(),
  productId: z.string().uuid(),
});

export type RedirectToProductPagePayload = z.infer<
  typeof RedirectToProductPageSchema
>;
export class RedirectToProductPageDto extends createZodDto(
  RedirectToProductPageSchema,
) {}

export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export type PaginationPayload = z.infer<typeof PaginationSchema>;
export class PaginationDto extends createZodDto(PaginationSchema) {}
