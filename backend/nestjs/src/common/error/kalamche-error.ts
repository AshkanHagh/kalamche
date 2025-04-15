import { HttpException, HttpStatus } from "@nestjs/common";

export enum KalamcheErrorType {
  PendingToVerify = "pending_to_verify",
  NotRegistered = "not_registered",
  InvalidCode = "invalid_code",
  ExpiredCode = "expired_code",
  AccountUsesOAuth = "account_uses_oauth",
  InvalidRateLimitActionType = "invalid_rate_limit_action_type",
  CouldntUpdateUser = "couldnt_update_user",
  EmailNotVerified = "email_not_verified",
  EmailRequired = "email_required",
  ImageUrlMissingPathSegments = "image_url_missing_path_segments",
  ImageUrlMissingLastPathSegment = "image_url_missing_last_path_segment",
  NotAnImageType = "not_an_image_type",
  InvalidImageUpload = "invalid_image_upload",
  NotLoggedIn = "not_logged_in",
  InvalidPassword = "invalid_password",
  RegistrationCooldown = "registration_cooldown",
  ProductDescriptionLengthOverflow = "product_description_length_overflow",
  CouldntUpdateProduct = "couldnt_update_product",
  EmailAlreadyExists = "email_already_exists",
  InvalidEmailAddress = "invalid_email_address",
  NoIdGiven = "no_id_given",
  IncorrectLogin = "incorrect_login",
  AuthorizationHeaderRequired = "authorization_header_required",
  InvalidBearerToken = "invalid_bearer_token",
  NoEmailSetup = "no_email_setup",
  RateLimitError = "rate_limit_error",
  InvalidName = "invalid_name",
  InvalidCodeVerifier = "invalid_code_verifier",
  InvalidProductTitle = "invalid_product_title",
  InvalidBodyField = "invalid_body_field",
  UserAlreadyExists = "user_already_exists",
  CouldntCreateProduct = "couldnt_create_product",
  SystemErrLogin = "system_err_login",
  CacheSystemErr = "cache_system_err",
  BlockedUrl = "blocked_url",
  CouldntGetProducts = "couldnt_get_products",
  InvalidUrl = "invalid_url",
  EmailSendFailed = "email_send_failed",
  InvalidRegex = "invalid_regex",
  FaildToMigrate = "failed_to_migrate",
  CaptchaIncorrect = "captcha_incorrect",
  CouldntCreateImageCaptcha = "couldnt_create_image_captcha",
  TooManyItems = "too_many_items",
  OAuthAuthorizationInvalid = "oauth_authorization_invalid",
  OAuthLoginFailed = "oauth_login_failed",
  OAuthRegistrationClosed = "oauth_registration_closed",
  PaymentGatewayFailed = "payment_gateway_failed",
  PaymentVerificationFailed = "payment_verification_failed",
  NotFound = "not_found",
  InternalServerError = "internal_server_error",
}

export class KalamcheError extends HttpException {
  constructor(
    public errorType: KalamcheErrorType,
    public originalError?: Error,
  ) {
    super(errorType, KalamcheError.getStatusCode(errorType));
  }

  private static getStatusCode(errorType: KalamcheErrorType): number {
    switch (errorType) {
      case KalamcheErrorType.NotFound: {
        return HttpStatus.NOT_FOUND;
      }

      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
