import { HttpException } from "@nestjs/common";
import { KalamcheError, KalamcheErrorType } from "./error.exception";

export function CatchError(error: unknown) {
  if (error instanceof HttpException) {
    return error;
  } else if (error instanceof Error) {
    return new KalamcheError(KalamcheErrorType.InternalServerError, error);
  } else {
    return new KalamcheError(KalamcheErrorType.InternalServerError);
  }
}
