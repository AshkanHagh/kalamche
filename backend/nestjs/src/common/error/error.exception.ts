import { HttpException, HttpStatus } from "@nestjs/common";

/**
 * @description
 * The KalamcheErrorType enum defines a comprehensive set of error types
 * used across the application for consistent error handling and reporting.
 *
 * Each error type represents a specific failure scenario, allowing for
 * precise error identification and handling.
 *
 * :::info
 * Error types are designed to cover various domains including
 * authentication, OAuth, validation, and system-level errors.
 */
export enum KalamcheErrorType {
  NotFound = "NOT_FOUND",
  InternalServerError = "INTERNAL_SERVER_ERROR",
  EmailMissing = "EMAIL_MISSING",
  InvalidCredentials = "INVALID_CREDENTIALS",
  InvalidFieldInRequestBody = "INVALID_FIELD_IN_REQUEST_BODY",
  InvalidOAuthAuthorization = "INVALID_OAUTH_AUTHORIZATION",
  OAuthLoginFailure = "OAUTH_LOGIN_FAILURE",
  OAuthRegistrationUnavailable = "OAUTH_REGISTRATION_UNAVAILABLE",
  OAuthNoVerifiedPrimaryEmail = "OAUTH_NO_VERIFIED_PRIMARY_EMAIL",
  OAuthNotConfigured = "OAUTH_NOT_CONFIGURED",
  OAuthLoginFailed = "OAUTH_LOGIN_FAILED",
  RedisNotConfigured = "REDIS_NOT_CONFIGURED",
  FailedToMigrate = "FAILED_TO_MIGRATE",
  NotLoggedIn = "NOT_LOGGED_IN",
  CaptchaIncorrect = "CAPTCHA_INCORRECT",
  CouldntCreateImageCaptcha = "COULDNT_CREATE_IMAGE_CAPTCHA",
  InvalidToken = "INVALID_TOKEN",
  TokenExpired = "TOKEN_EXPIRED",
  InvalidAud = "INVALID_AUD",
  InvalidIss = "INVALID_ISS",
  InvalidEmailAddress = "INVALID_EMAIL_ADDRESS",
  EmailSendFailed = "EMAIL_SEND_FAILED",
  EmailAlreadyExists = "EMAIL_ALREADY_EXISTS",
  InvalidPassword = "INVALID_PASSWORD",
  AccountVerificationIsPending = "ACCOUNT_VERIFICATION_IS_PENDING",
  AccountNotRegistered = "ACCOUNT_NOT_REGISTERED",
  InvalidVerificationCode = "INVALID_VERIFICATION_CODE",
  ExpiredVerificationCode = "EXPIRED_VERIFICATION_CODE",
  AccountUsesOAuth = "ACCOUNT_USES_OAUTH",
  RateLimitError = "RATE_LIMIT_ERROR",
  InvalidRateLimitActionType = "INVALID_RATE_LIMIT_ACTION_TYPE",
}

/**
 * @description
 * KalamcheError is a custom error class that extends HttpException,
 * providing a standardized way to handle and report errors across the application.
 *
 * It encapsulates both the error type and allows for optional original error tracking.
 *
 * @example
 * ```typescript
 * // Throwing an error in a service
 * if (!email) {
 *   throw new KalamcheError(KalamcheErrorType.EmailMissing);
 * }
 *
 * // With an original error
 * try {
 *   // Some operation that might fail
 * } catch (originalError) {
 *   throw new KalamcheError(
 *     KalamcheErrorType.InternalServerError,
 *     originalError
 *   );
 * }
 * ```
 *
 * :::info
 * This error class automatically maps error types to appropriate
 * HTTP status codes for API responses.
 */
export class KalamcheError extends HttpException {
  /**
   * @description
   * Creates a new KalamcheError instance.
   *
   * @param errorType - The specific type of error that occurred
   * @param originalError - Optional original error for additional context
   */
  constructor(
    public errorType: KalamcheErrorType,
    public originalError?: Error,
  ) {
    super(errorType, KalamcheError.getStatusCode(errorType));
  }

  /**
   * @description
   * Maps KalamcheErrorType to appropriate HTTP status codes.
   *
   * @param errorType - The error type to convert to a status code
   * @returns The corresponding HTTP status code
   *
   * @privateRemarks
   * This method ensures consistent status code mapping for different error types.
   */
  private static getStatusCode(errorType: KalamcheErrorType): number {
    switch (errorType) {
      case KalamcheErrorType.NotFound:
        return HttpStatus.NOT_FOUND;
      case KalamcheErrorType.InvalidFieldInRequestBody:
      case KalamcheErrorType.InvalidOAuthAuthorization:
        return HttpStatus.BAD_REQUEST;
      case KalamcheErrorType.InvalidCredentials:
        return HttpStatus.UNAUTHORIZED;
      default:
        return HttpStatus.INTERNAL_SERVER_ERROR;
    }
  }
}
