import { z } from "zod";
import { createZodDto } from "nestjs-zod";

const CreateProductSchema = z.object({
  title: z.string(),
  description: z.string(),
  categoryId: z.string().uuid(),
  brandId: z.string().uuid(),
  specifications: z.array(z.object({ key: z.string(), value: z.string() })),
  websiteUrl: z.string().url(),
  initialPrice: z.number(),
  finalPrice: z.number(),
  modelNumber: z.string(),
  upc: z.string(),
  imageIds: z.array(z.uuid()).max(6),
});

export class CreateProductDto extends createZodDto(CreateProductSchema) {}

export const CreateOfferSchema = z.object({
  title: z.string().max(255),
  finalPrice: z.number(),
  websiteUrl: z.string().url(),
});

export class CreateOfferDto extends createZodDto(CreateOfferSchema) {}

const FilterSchema = z.object({
  sort: z.enum([
    "cheapest",
    "view",
    "newest",
    "expensive",
    "popular",
    "relevent",
  ]),
  prMax: z.coerce.number().optional(),
  prMin: z.coerce.number().optional(),
  brand: z.string().max(255).optional(),
  offset: z.coerce.number(),
  limit: z.coerce.number(),
});
const SearchSchema = z
  .object({
    q: z.string().max(255),
  })
  .merge(FilterSchema);

export class SearchDto extends createZodDto(SearchSchema) {}
export class CategorySearchDto extends createZodDto(FilterSchema) {}

const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export class PaginationDto extends createZodDto(PaginationSchema) {}
