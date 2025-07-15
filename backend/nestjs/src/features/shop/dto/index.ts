import { z } from "zod";

export const UpdateShopSchema = z.object({
  name: z.string().max(255).optional(),
  description: z.string().max(500).optional(),
  email: z.string().email().optional(),
  phone: z.string().min(11).max(20).optional(),
  website: z.string().url().optional(),
  country: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  streetAddress: z.string().max(255).optional(),
  zipCode: z.number().optional(),
  taxId: z.string().min(10).max(20).optional(),
});

export type UpdateShopDto = z.infer<typeof UpdateShopSchema>;
