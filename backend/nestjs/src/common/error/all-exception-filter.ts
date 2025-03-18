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

    const { statusCode, message } = this.getErrorDetails(exception);

    // TODO: add complete log
    console.log(
      `ERROR: ${req.method} ${req.url} | client: ${req.ip} | status: ${statusCode} | message: ${message}`,
    );

    res.status(statusCode).json({
      success: false,
      message,
    });
  }

  private getErrorDetails(exception: unknown) {
    if (exception instanceof HttpException) {
      const response = exception.getResponse();
      const message = response["error"] as string;

      return { statusCode: exception.getStatus(), message };
    } else {
      return { statusCode: 500, message: "Internal server error" };
    }
  }
}
