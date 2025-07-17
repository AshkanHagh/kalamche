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
