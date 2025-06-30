import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { KalamcheError } from "./exception";
import { Request, Response } from "express";

@Catch(HttpException)
export class KalamcheExceptionFilter implements ExceptionFilter {
  catch(exception: KalamcheError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();
    const statusCode = exception.getStatus();

    console.error("ERROR:", {
      errorType: exception.type,
      originalError: exception.cause,
      statusCode,
      path: req.url,
    });

    res.status(statusCode).json({
      statusCode: `${statusCode} ${HttpStatus[statusCode]}`,
      message: exception.type,
    });
  }
}
