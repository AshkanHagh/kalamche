import { Request, Response } from "express";
import { handleCallbackDto } from "../dto";
import { IUserRecord } from "src/drizzle/types";

export interface IOAuthService {
  initiateOAuth(provider: string): Promise<string>;
  handleCallback(
    req: Request,
    res: Response,
    payload: handleCallbackDto,
  ): Promise<{ user: IUserRecord; accessToken: string }>;
}
