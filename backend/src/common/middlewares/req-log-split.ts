import { NextFunction, Request, Response } from "express";

export function splitReqLog(req: Request, res: Response, next: NextFunction) {
  console.log("");
  next();
}
