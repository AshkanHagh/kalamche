import * as z from "zod";
import { OAuthPlatforms } from "../services/oauth/oauth-strategy";

export const oAuthCallbackDto = z.object({
  code: z.string(),
  oauth: z.nativeEnum(OAuthPlatforms),
});

export type OAuthCallbackDto = z.infer<typeof oAuthCallbackDto>;
