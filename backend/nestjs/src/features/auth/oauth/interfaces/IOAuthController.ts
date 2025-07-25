import { Request, Response } from "express";
import { handleCallbackDto } from "../dto";

export interface IOAuthController {
  initiateOAuth(provider: string): Promise<{ url: string }>;
  handleCallback(
    req: Request,
    res: Response,
    payload: handleCallbackDto,
  ): Promise<Response>;
}
