use chrono::{Duration, Utc};
use jsonwebtoken::{
  decode, encode, errors::ErrorKind, Algorithm, DecodingKey, EncodingKey, Header, Validation,
};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use uuid::Uuid;

use crate::{
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
  settings::structs::JwtConfig,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct ATClaims {
  pub sub: Uuid,
  pub aud: String,
  pub iss: String,
  pub t_type: String,
  pub scope: Vec<String>,
  pub exp: usize,
}

const TOKEN_AUD: &str = "Klamache";
const TOKEN_ISS: &str = "Kalamche";

pub fn sign_access_token(
  config: &JwtConfig,
  sub: Uuid,
  scope: Vec<String>,
) -> KalamcheResult<String> {
  let claims = ATClaims {
    sub,
    scope,
    aud: TOKEN_AUD.to_owned(),
    iss: TOKEN_ISS.to_owned(),
    t_type: "access".to_string(),
    exp: (Utc::now() + Duration::minutes(config.at_expiry as i64)).timestamp() as usize,
  };

  let access_token = encode(
    &Header::default(),
    &claims,
    &EncodingKey::from_secret(config.at_secret.as_bytes()),
  )?;

  Ok(access_token)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RTClaims {
  pub sub: Uuid,
  pub aud: String,
  pub iss: String,
  pub t_type: String,
  pub exp: usize,
}

pub fn sign_refresh_token(config: &JwtConfig, sub: Uuid) -> KalamcheResult<String> {
  let claims = RTClaims {
    sub,
    aud: TOKEN_AUD.to_owned(),
    iss: TOKEN_ISS.to_owned(),
    t_type: "refresh".to_string(),
    exp: (Utc::now() + Duration::days(config.rt_expiry as i64)).timestamp() as usize,
  };

  let refresh_token = encode(
    &Header::default(),
    &claims,
    &EncodingKey::from_secret(config.rt_secret.as_bytes()),
  )?;

  Ok(refresh_token)
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerificationClaims {
  pub sub: Uuid,
  pub code: u32,
  pub aud: String,
  pub iss: String,
  pub t_type: String,
  pub exp: usize,
}

pub fn sign_verification_token(config: &JwtConfig, sub: Uuid, code: u32) -> KalamcheResult<String> {
  let claims = VerificationClaims {
    sub,
    code,
    aud: TOKEN_AUD.to_owned(),
    iss: TOKEN_ISS.to_owned(),
    t_type: "verification".to_string(),
    exp: (Utc::now() + Duration::minutes(config.verfication_expiry as i64)).timestamp() as usize,
  };

  let verification_token = encode(
    &Header::default(),
    &claims,
    &EncodingKey::from_secret(config.verification_secret.as_bytes()),
  )?;

  Ok(verification_token)
}

pub fn verify_refresh_token(config: &JwtConfig, token: &str) -> KalamcheResult<RTClaims> {
  let token_claims = decode_token::<RTClaims>(&config.rt_secret.as_bytes(), token)?;
  if token_claims.t_type != "refresh" {
    return Err(KalamcheError::from(KalamcheErrorType::InvalidToken));
  }

  Ok(token_claims)
}

pub fn verify_verification_token(
  config: &JwtConfig,
  token: &str,
) -> KalamcheResult<VerificationClaims> {
  let token_claims =
    decode_token::<VerificationClaims>(&config.verification_secret.as_bytes(), token)?;

  if token_claims.t_type != "verification" {
    return Err(KalamcheError::from(KalamcheErrorType::InvalidToken));
  }

  Ok(token_claims)
}

pub fn decode_token<Claims>(secret: &[u8], token: &str) -> KalamcheResult<Claims>
where
  Claims: DeserializeOwned,
{
  let token_result = decode::<Claims>(
    token,
    &DecodingKey::from_secret(secret),
    &config_vaidation(),
  );

  let token = match token_result {
    Ok(token) => token,
    Err(err) => match err.into_kind() {
      ErrorKind::InvalidToken => return Err(KalamcheError::from(KalamcheErrorType::InvalidToken)),
      ErrorKind::InvalidAudience => return Err(KalamcheError::from(KalamcheErrorType::InvalidAud)),
      ErrorKind::InvalidIssuer => return Err(KalamcheError::from(KalamcheErrorType::InvalidIss)),
      ErrorKind::ExpiredSignature => {
        return Err(KalamcheError::from(KalamcheErrorType::TokenExpired))
      }
      _ => return Err(KalamcheError::from(KalamcheErrorType::InternalServerError)),
    },
  };

  Ok(token.claims)
}

fn config_vaidation() -> Validation {
  let mut validation = Validation::new(Algorithm::HS256);
  validation.set_audience(&[TOKEN_AUD]);
  validation.set_issuer(&[TOKEN_ISS]);
  validation.set_required_spec_claims(&["sub", "exp", "aud"]);

  validation
}
