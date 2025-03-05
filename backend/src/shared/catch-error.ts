import { HttpException } from "@nestjs/common";

export function CatchError(error: unknown) {
  if (error instanceof HttpException) {
    return error;
  } else if (error instanceof Error) {
    return new HttpException(error.message, 500);
  } else {
    return new HttpException("INTERNAL SERVER ERROR", 500);
  }
}
