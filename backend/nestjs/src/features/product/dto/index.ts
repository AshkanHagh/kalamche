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

const FilterSchema = z.object({
  sort,
  prMax: z.coerce.number().optional(),
  prMin: z.coerce.number().optional(),
  brand: z.string().max(255).optional(),
  offset: z.coerce.number(),
  limit: z.coerce.number(),
});

export type FilterOptions = z.infer<typeof FilterSchema>;

export const SearchSchema = z
  .object({
    q: z.string().max(255),
  })
  .merge(FilterSchema);

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

export const GetProductsByCategorySchema = z
  .object({
    category: z.string().max(255),
  })
  .merge(FilterSchema);

export type GetproductsByCategoryPayload = z.infer<
  typeof GetProductsByCategorySchema
>;
export class GetProductsByCategoryDto extends createZodDto(
  GetProductsByCategorySchema,
) {}

export const UpdateProductSchema = z.object({
  title: z.string().max(500).optional(),
  description: z.string().max(10_000).optional(),
  categoryId: z.string().uuid().optional(),
  brandId: z.string().uuid().optional(),
  specifications: z
    .array(
      z.object({
        key: z.string().max(255),
        value: z.string().max(255),
      }),
    )
    .max(50)
    .optional(),
  initialPrice: z.number().min(0).optional(),
});

export type UpdateProductPayload = z.infer<typeof UpdateProductSchema>;
export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}
