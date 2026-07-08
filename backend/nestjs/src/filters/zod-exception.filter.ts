import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { ZodValidationException } from "nestjs-zod";
import { Response } from "express";
import { KalamcheErrorType } from "./exception";

@Catch(ZodValidationExceptionFilter)
export class ZodValidationExceptionFilter implements ExceptionFilter {
  private logger = new Logger(ZodValidationExceptionFilter.name);

  catch(exception: ZodValidationException, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();

    const statusCode = HttpStatus.UNPROCESSABLE_ENTITY;
    const error = exception.getZodError().issues.map((issue) => ({
      field: issue.path.join(","),
      message: issue.message,
      code: issue.code,
    }));
    this.logger.error({
      type: "zod-validation",
      ...error,
    });

    res.status(statusCode).json({
      statusCode: statusCode.toString(),
      message: KalamcheErrorType.InvalidBodyField,
    });
  }
}
