import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest<Request>();
    const res = ctx.getResponse<Response>();

    let errorMessage: string | object = "Internal server error";
    let statusCode: number = 500;

    if (exception instanceof HttpException) {
      errorMessage = exception.getResponse();
      statusCode = exception.getStatus();
    } else if (exception instanceof Error) {
      errorMessage = exception.message;
    }

    // TODO: add complete log
    console.log(
      `ERROR: error in req ${req.url} Client ${req.ip} err: ${JSON.stringify(errorMessage)}`,
    );

    res.status(statusCode).json({
      success: false,
      statusCode: req.statusMessage,
      message: clientError(statusCode),
    });
  }
}

function clientError(statusCode: number): string {
  switch (statusCode) {
    case 400: {
      return "BAD REQUEST";
    }
    case 404: {
      return "NOT FOUND";
    }
    case 500: {
      return "INTERNAL SERVER ERROR";
    }
    default: {
      return "INTERNAL SERVER ERROR";
    }
  }
}
