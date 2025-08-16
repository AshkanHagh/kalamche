import { Request, Response } from "express";
import { HandleCallbackPayload } from "../dto";
import { IUserRecord } from "src/drizzle/schemas";

export interface IOAuthService {
  initiateOAuth(provider: string): Promise<string>;
  handleCallback(
    req: Request,
    res: Response,
    payload: HandleCallbackPayload,
  ): Promise<{ user: IUserRecord; accessToken: string }>;
}
