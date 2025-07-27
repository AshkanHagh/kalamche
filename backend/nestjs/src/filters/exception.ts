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
  ProductWithUpcAlreadyExists = "PRODUCT_WITH_UPC_ALREADY_EXISTS",
  InvalidUpc = "INVALID_UPC",
  UserHasNoShop = "USER_HAS_NO_SHOP",
  OfferAlreadyExists = "OFFER_ALREADY_EXISTS",
  ImageProcessingFailed = "IMAGE_PROCESSING_FAILED",
  ImageLimitExceeded = "IMAGE_LIMIT_EXCEEDED",
  OAuthReqFailed = "OAUTH_REQ_FAILED",
  InvalidOAuthProvider = "INVALID_OAUTH_PROVIDER",
  StateExpired = "STATE_EXPIRED",
  InvalidOAuthState = "INVALID_OAUTH_STATE",
  OAuthAccountNotVerified = "OAUTH_ACCOUNT_NOT_VERIFIED",
  RateLimitInvalidIdentifier = "RATE_LIMIT_INVALID_IDENTIFIER",
  RateLimitExceeded = "RATE_LIMIT_EXCEEDED",
  ZarinpalReqFailed = "ZARINPAL_REQUEST_FAILED",
  PaymentVerificationFailed = "PAYMENT_VERIFICATION_FAILED",
  InvalidPaymentMethod = "INVALID_PAYMENT_METHOD",
  NotEnoughTokens = "NOT_ENOUGH_TOKENS",
  ApiFetchFailed = "API_FETCH_FAILED",
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
      case KalamcheErrorType.NotEnoughTokens: {
        return HttpStatus.PAYMENT_REQUIRED;
      }
      case KalamcheErrorType.PaymentVerificationFailed: {
        return HttpStatus.NOT_ACCEPTABLE;
      }
      case KalamcheErrorType.RateLimitExceeded: {
        return HttpStatus.TOO_MANY_REQUESTS;
      }
      case KalamcheErrorType.NotFound: {
        return HttpStatus.NOT_FOUND;
      }
      case KalamcheErrorType.InvalidBodyField: {
        return HttpStatus.UNPROCESSABLE_ENTITY;
      }
      case KalamcheErrorType.InvalidJwtToken:
      case KalamcheErrorType.OAuthAccountNotVerified:
      case KalamcheErrorType.UnAuthorized: {
        return HttpStatus.UNAUTHORIZED;
      }
      case KalamcheErrorType.UserHasNoShop:
      case KalamcheErrorType.PermissionDenied: {
        return HttpStatus.FORBIDDEN;
      }
      case KalamcheErrorType.OfferAlreadyExists:
      case KalamcheErrorType.ShopAlreadyExists:
      case KalamcheErrorType.ProductWithUpcAlreadyExists: {
        return HttpStatus.CONFLICT;
      }

      case KalamcheErrorType.EmailAlreadyExists:
      case KalamcheErrorType.RegistrationCooldown:
      case KalamcheErrorType.NotRegistered:
      case KalamcheErrorType.InvalidEmailAddress:
      case KalamcheErrorType.NoPasswordOAuthError:
      case KalamcheErrorType.InvalidVerifyCode:
      case KalamcheErrorType.VerifyTokenExpired:
      case KalamcheErrorType.InvalidOAuthProvider:
      case KalamcheErrorType.StateExpired:
      case KalamcheErrorType.InvalidPaymentMethod:
      case KalamcheErrorType.InvalidOAuthState:
      case KalamcheErrorType.RateLimitInvalidIdentifier:
      case KalamcheErrorType.InvalidUpc: {
        return HttpStatus.BAD_REQUEST;
      }

      default: {
        return HttpStatus.INTERNAL_SERVER_ERROR;
      }
    }
  }
}
