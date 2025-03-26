import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";
import { KalamcheError } from "./error.exception";

@Catch()
export class KalamcheExceptionsFilter implements ExceptionFilter {
  catch(exception: KalamcheError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    // TODO: add complete log
    console.error("ERROR:", {
      errorType: exception.errorType,
      originalError: exception.originalError,
      path: req.url,
    });

    const statusCode = exception.getStatus();
    res.status(statusCode).json({
      success: false,
      statusCode: `${statusCode} ${HttpStatus[statusCode]}`,
      message: exception.errorType,
    });
  }
}
