import { Request, Response } from "express";
import { HandleCallbackDto } from "../dto";

export interface IOAuthController {
  initiateOAuth(provider: string): Promise<{ url: string }>;
  handleCallback(
    req: Request,
    res: Response,
    payload: HandleCallbackDto,
  ): Promise<Response>;
}
