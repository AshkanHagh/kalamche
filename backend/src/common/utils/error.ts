import { HttpException } from "@nestjs/common";

export function CatchError(error: unknown): HttpException {
  console.log(error);
  if (error instanceof HttpException) {
    return error;
  } else if (error instanceof Error) {
    return new HttpException(error.message, 500);
  } else {
    return new HttpException("unknown error", 500);
  }
}
