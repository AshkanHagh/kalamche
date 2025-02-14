import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";
import { logger } from "../config/log";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let errorMessage: string | object = "";
    let statusCode: number = 500;

    if (exception instanceof HttpException) {
      errorMessage = exception.getResponse();
      statusCode = exception.getStatus();
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
    }

    logger.error({
      userAgent: req.header("User-Agent"),
      url: req.url,
      method: req.method,
      status: statusCode,
      error: errorMessage,
    });

    res.status(statusCode).json({
      success: false,
      statusCode: statusCode,
      message: clientError(statusCode),
    });
  }
}

function clientError(status: number): string {
  switch (status) {
    case 500: {
      return "Internal server error";
    }
    case 401: {
      return "Unauthorized";
    }
    case 400: {
      return "Bad request";
    }
    default: {
      return "Internal server error";
    }
  }
}
