use serde::{Deserialize, Serialize};
use serde_json::json;
use std::fmt::{self, Debug};
use strum::{Display, EnumIter};

#[derive(Display, EnumIter, Debug, Serialize, Deserialize, Clone, PartialEq, Eq, Hash)]
#[serde(rename_all = "snake_case")]
pub enum KalamcheErrorType {
  NotFound,
  InternalServerError,
  EmailMissing,
  InvalidCredentials,
  InvalidFieldInRequestBody,
  InvalidOAuthAuthorization,
  OAuthLoginFailure,
  OAuthRegistrationUnavailable,
  OAuthNoVerifiedPrimaryEmail,
  OAuthNotConfigured,
  OAuthLoginFailed,
  RedisNotConfigured,
  FaildToMigrate,
  NotLoggedIn,
  CaptchaIncorrect,
  CouldntCreateImageCaptcha,
  InvalidToken,
  TokenExpired,
  InvalidAud,
  InvalidIss,
  InvalidEmailAddress,
  EmailSendFaild,
  EmailAlreadyExists,
  InvalidPassword,
  AccountVerificationIsPending,
  AccountNotRegistered,
  InvalidVerificationCode,
  ExpiredVerificationCode,
  AccountUsesOAuth,
  RateLimitError,
  InvalidRateLimitActionType,
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
      KalamcheErrorType::NotFound => actix_web::http::StatusCode::NOT_FOUND,
      KalamcheErrorType::InvalidFieldInRequestBody => actix_web::http::StatusCode::BAD_REQUEST,
      KalamcheErrorType::InvalidOAuthAuthorization => actix_web::http::StatusCode::BAD_REQUEST,
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
