use oauth2::http::StatusCode;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fmt::{self, Debug};
use strum::{Display, EnumIter};

#[derive(Display, EnumIter, Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum KalamcheErrorType {
  PendingToVerify,
  NotRegistered,
  InvalidCode,
  ExpiredCode,
  AccountUsesOAuth,
  InvalidRateLimitActionType,
  CouldntUpdateUser,
  EmailNotVerified,
  EmailRequired,
  // CouldntUpdatePrivateMessage,
  // PictrsResponseError(String),
  ImageUrlMissingPathSegments,
  ImageUrlMissingLastPathSegment,
  // NoContentTypeHeader,
  NotAnImageType,
  InvalidImageUpload,
  // ImageUploadDisabled,
  NotLoggedIn,
  InvalidPassword,
  ProductDescriptionLengthOverflow,
  // RegistrationApplicationIsPending,
  // CouldntCreateComment,
  // LanguageNotAllowed,
  CouldntUpdateProduct,
  // NoProductEditAllowed,
  // InvalidDefaultProductListingType,
  EmailAlreadyExists,
  InvalidEmailAddress,
  NoIdGiven,
  IncorrectLogin,
  AuthorizationHeaderRequired,
  InvalidBearerToken,
  NoEmailSetup,
  RateLimitError,
  InvalidName,
  InvalidCodeVerifier,
  InvalidProductTitle,
  InvalidBodyField,
  UserAlreadyExists,
  CouldntCreateProduct,
  SystemErrLogin,
  CacheSystemErr(String),
  BlockedUrl,
  CouldntGetProducts,
  InvalidUrl,
  EmailSendFailed,
  InvalidRegex,
  FaildToMigrate,
  CaptchaIncorrect,
  CouldntCreateImageCaptcha,
  TooManyItems,
  // Unknown(String),
  OAuthAuthorizationInvalid,
  OAuthLoginFailed,
  OAuthRegistrationClosed,
  // PaymentClientError,
  // PaymentCheckoutSessionFailed,
  // PaymentPaymentVerificationFailed,
  // PaymentSessionExpired,
  // PaymentInvalidPaymentStatus,
  NotFound,
  InternalServerError,
}

pub type KalamcheResult<T> = std::result::Result<T, KalamcheError>;

pub struct KalamcheError {
  pub error_type: KalamcheErrorType,
  pub inner: anyhow::Error,
}

impl<T> From<T> for KalamcheError
where
  T: Into<anyhow::Error>,
{
  fn from(t: T) -> Self {
    let cause = t.into();
    let error_type = match cause.downcast_ref::<sea_orm::DbErr>() {
      Some(&sea_orm::DbErr::RecordNotFound(_)) => KalamcheErrorType::NotFound,
      _ => KalamcheErrorType::InternalServerError,
    };

    KalamcheError {
      error_type,
      inner: cause,
    }
  }
}

impl Debug for KalamcheError {
  fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
    f.debug_struct("KalamcheError")
      .field("message", &self.error_type)
      .field("inner", &self.inner)
      .finish()
  }
}

impl fmt::Display for KalamcheError {
  fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
    write!(f, "{}", &self.error_type)?;
    writeln!(f, "{}", self.inner)?;
    Ok(())
  }
}

impl actix_web::error::ResponseError for KalamcheError {
  fn status_code(&self) -> actix_web::http::StatusCode {
    match self.error_type {
      KalamcheErrorType::NotFound => StatusCode::NOT_FOUND,
      KalamcheErrorType::InvalidBodyField
      | KalamcheErrorType::OAuthLoginFailed
      | KalamcheErrorType::AccountUsesOAuth
      | KalamcheErrorType::OAuthAuthorizationInvalid
      | KalamcheErrorType::AuthorizationHeaderRequired
      | KalamcheErrorType::PendingToVerify
      | KalamcheErrorType::NotRegistered
      | KalamcheErrorType::InvalidPassword
      | KalamcheErrorType::InvalidEmailAddress
      | KalamcheErrorType::InvalidCode
      | KalamcheErrorType::InvalidCodeVerifier
      | KalamcheErrorType::ExpiredCode
      | KalamcheErrorType::EmailRequired
      | KalamcheErrorType::EmailNotVerified
      | KalamcheErrorType::EmailAlreadyExists => StatusCode::BAD_REQUEST,
      KalamcheErrorType::NotLoggedIn | KalamcheErrorType::InvalidBearerToken => {
        StatusCode::UNAUTHORIZED
      }
      KalamcheErrorType::RateLimitError => StatusCode::TOO_MANY_REQUESTS,
      _ => actix_web::http::StatusCode::INTERNAL_SERVER_ERROR,
    }
  }

  fn error_response(&self) -> actix_web::HttpResponse {
    log::debug!("ERROR: {:?}", self);
    actix_web::HttpResponse::build(self.status_code()).json(json!({
      "success": false,
      "statusCode": self.status_code().to_string(),
      "message": &self.error_type
    }))
  }
}

impl From<KalamcheErrorType> for KalamcheError {
  fn from(error_type: KalamcheErrorType) -> Self {
    let inner = anyhow::anyhow!("{}", error_type);

    KalamcheError { error_type, inner }
  }
}

pub trait KalamcheErrorExt<T, E: Into<anyhow::Error>> {
  fn with_kalamche_type(self, error_type: KalamcheErrorType) -> KalamcheResult<T>;
}

impl<T, E: Into<anyhow::Error>> KalamcheErrorExt<T, E> for Result<T, E> {
  fn with_kalamche_type(self, error_type: KalamcheErrorType) -> KalamcheResult<T> {
    self.map_err(|error| KalamcheError {
      error_type,
      inner: error.into(),
    })
  }
}
