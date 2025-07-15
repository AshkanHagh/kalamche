import { HttpException, HttpStatus } from "@nestjs/common";

export enum KalamcheErrorType {
  InternalServerError = "INTERNAL_SERVER_ERROR",
  InvalidBodyField = "INVALID_BODY_FIELD",
  EmailAlreadyExists = "EMAIL_ALREADY_EXISTS",
  RegistrationCooldown = "REGISTRATION_COOLDOWN",
  FailedToSendMail = "FAILED_TO_SEND_MAIL",
  NotRegistered = "NOT_REGISTERED",
  NotFound = "NOT_FOUND",
  InvalidEmailAddress = "INVALID_EMAIL_ADDRESS",
  NoPasswordOAuthError = "NO_PASSWORD_OAUTH_ERROR",
  InvalidJwtToken = "INVALID_JWT_TOKEN",
  InvalidVerifyCode = "INVALID_VERIFY_CODE",
  VerifyTokenExpired = "VERIFY_TOKEN_EXPIRED",
  PermissionDenied = "PERMISSION_DENIED",
  UnAuthorized = "UNAUTHORIZED",
  S3ReqFailed = "S3_REQUEST_FAILED",
  ShopAlreadyExists = "SHOP_ALREADY_EXISTS",
  DbQueryFailed = "DB_QUERY_FAILED",
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
      case KalamcheErrorType.NotFound: {
        return HttpStatus.NOT_FOUND;
      }
      case KalamcheErrorType.InvalidBodyField: {
        return HttpStatus.UNPROCESSABLE_ENTITY;
      }
      case KalamcheErrorType.InvalidJwtToken ||
        KalamcheErrorType.UnAuthorized: {
        return HttpStatus.UNAUTHORIZED;
      }
      case KalamcheErrorType.PermissionDenied: {
        return HttpStatus.FORBIDDEN;
      }
      case KalamcheErrorType.ShopAlreadyExists: {
        return HttpStatus.CONFLICT;
      }

      case KalamcheErrorType.EmailAlreadyExists ||
        KalamcheErrorType.RegistrationCooldown ||
        KalamcheErrorType.NotRegistered ||
        KalamcheErrorType.InvalidEmailAddress ||
        KalamcheErrorType.NoPasswordOAuthError ||
        KalamcheErrorType.InvalidVerifyCode ||
        KalamcheErrorType.VerifyTokenExpired: {
        return HttpStatus.BAD_REQUEST;
      }

      default: {
        return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
  }
}
