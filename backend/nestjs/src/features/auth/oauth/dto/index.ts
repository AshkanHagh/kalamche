import { createZodDto } from "nestjs-zod";
import { z } from "zod";

export const OAuthUserSchema = z.object({
  providerId: z.string(),
  email: z.string().email(),
  name: z.string(),
  avatar: z.string().url().optional(),
  provider: z.enum(["github", "discord"]),
});

export type OAuthUserPayload = z.infer<typeof OAuthUserSchema>;
export class OAuthUserDto extends createZodDto(OAuthUserSchema) {}

export const HandleCallbackSchema = z.object({
  provider: z.string(),
  code: z.string(),
  state: z.string(),
});

export type HandleCallbackPayload = z.infer<typeof HandleCallbackSchema>;
export class HandleCallbackDto extends createZodDto(HandleCallbackSchema) {}
