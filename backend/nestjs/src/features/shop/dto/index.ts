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

export type UpdateShopCreationDto = z.infer<typeof UpdateShopCreationSchema>;

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
  zipCode: z.string().min(5).max(10).optional(),
});

export type UpdateShopDto = z.infer<typeof UpdateShopSchema>;
