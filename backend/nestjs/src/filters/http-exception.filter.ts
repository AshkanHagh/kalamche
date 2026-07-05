import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { KalamcheError, KalamcheErrorType } from "./exception";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException | KalamcheError | Error, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const req = host.switchToHttp().getRequest<Request>();

    this.logger.error({
      type: "http",
      url: req.url,
      method: req.method,
      name: exception.name,
      message: exception.message,
      cause: exception.cause,
    });

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let resMessage: string;
    if (exception instanceof KalamcheError) {
      resMessage = exception.type;
    } else {
      const allowedStatusCode = [HttpStatus.NOT_FOUND];
      // internal server error for all none lina error
      // only some status codes must have thir own error message
      resMessage = allowedStatusCode.includes(statusCode)
        ? HttpStatus[statusCode]
        : KalamcheErrorType.InternalServerError;
    }

    res.status(statusCode).json({
      message: resMessage,
      statusCode: statusCode.toString(),
    });
  }
}
