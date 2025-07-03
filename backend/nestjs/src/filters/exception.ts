import { HttpException, HttpStatus } from "@nestjs/common";

export enum KalamcheErrorType {
  InternalServerError = "INTERNAL_SERVER_ERROR",
  InvalidBodyField = "INVALID_BODY_FIELD",
  EmailAlreadyExists = "EMAIL_ALREADY_EXISTS",
  RegistrationCooldown = "REGISTRATION_COOLDOWN",
  FailedToSendMail = "FAILED_TO_SEND_MAIL",
}

export class KalamcheError extends HttpException {
  constructor(
    public type: KalamcheErrorType,
    cause?: unknown,
  ) {
    super(type, KalamcheError.getStatusCode(type), {
      cause,
    });
  }

  static getStatusCode(type: KalamcheErrorType) {
    switch (type) {
      case KalamcheErrorType.InvalidBodyField: {
        return HttpStatus.UNPROCESSABLE_ENTITY;
      }

      case KalamcheErrorType.EmailAlreadyExists ||
        KalamcheErrorType.RegistrationCooldown: {
        return HttpStatus.BAD_REQUEST;
      }

      default: {
        return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
  }
}
