import * as z from "zod";
import { OAuthPlatforms } from "../services/oauth/oauth-strategy";

export const getOAuthUrlDto = z.object({
  oauth: z.nativeEnum(OAuthPlatforms),
});

export type GetOAuthUrlDto = z.infer<typeof getOAuthUrlDto>;
