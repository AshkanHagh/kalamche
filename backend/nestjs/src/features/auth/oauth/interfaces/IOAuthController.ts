import { Request, Response } from "express";
import { HandelCallbackDto } from "../dto";

export interface IOAuthController {
  initiateOAuth(provider: string): Promise<{ url: string }>;
  handelCallback(
    req: Request,
    res: Response,
    payload: HandelCallbackDto,
  ): Promise<Response>;
}
