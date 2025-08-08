import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const UpdateShopCreationSchema = z.object({
  name: z.string().max(255),
  description: z.string().max(500),
  email: z.string().email(),
  phone: z.string().min(11).max(20),
  website: z.string().url(),
  country: z.string().max(100),
  city: z.string().max(100),
  state: z.string().max(100),
  streetAddress: z.string().max(255),
  zipCode: z.string().min(5).max(10),
});

export type UpdateShopCreationPayload = z.infer<
  typeof UpdateShopCreationSchema
>;
export class UpdateShopCreationDto extends createZodDto(
  UpdateShopCreationSchema,
) {}

export const UploadImageSchema = z.object({
  shopId: z.string().uuid(),
  isTempShop: z.boolean(),
});

export type UploadImagePayload = z.infer<typeof UploadImageSchema>;
export class UploadImageDto extends createZodDto(UploadImageSchema) {}

export const UpdateShopSchema = z.object({
  name: z.string().max(255).optional(),
  description: z.string().max(500).optional(),
  website: z.string().url().optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  streetAddress: z.string().max(255).optional(),
  zipCode: z.string().min(5).max(10).optional(),
});

export type UpdateShopPayload = z.infer<typeof UpdateShopSchema>;
export class UpdateShopDto extends createZodDto(UpdateShopSchema) {}

export const PaginationSchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export type PaginationPayload = z.infer<typeof PaginationSchema>;
export class PaginationDto extends createZodDto(PaginationSchema) {}

export const GetProductSchema = z.object({
  shopId: z.string().uuid(),
  productId: z.string().uuid(),
});

export type GetProductPayload = z.infer<typeof GetProductSchema>;
export class GetProductDto extends createZodDto(GetProductSchema) {}
