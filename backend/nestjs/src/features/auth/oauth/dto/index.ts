import { z } from "zod";

export const OAuthUserSchema = z.object({
  providerId: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().url().optional(),
  provider: z.enum(["github", "discord"]),
});

export type OAuthUserDto = z.infer<typeof OAuthUserSchema>;

export const handleCallbackSchema = z.object({
  provider: z.string(),
  code: z.string(),
  state: z.string(),
});

export type handleCallbackDto = z.infer<typeof handleCallbackSchema>;
