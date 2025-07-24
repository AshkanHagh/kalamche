import { Request, Response } from "express";
import { IUserView } from "src/drizzle/types";
import { HandelCallbackDto } from "../dto";

export interface IOAuthService {
  initiateOAuth(provider: string): Promise<string>;
  handelCallback(
    req: Request,
    res: Response,
    payload: HandelCallbackDto,
  ): Promise<{ user: IUserView; accessToken: string }>;
}
