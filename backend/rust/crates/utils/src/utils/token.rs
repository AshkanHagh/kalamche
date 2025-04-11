use chrono::{Duration, Utc};
use jsonwebtoken::{decode, encode, Algorithm, DecodingKey, EncodingKey, Header, Validation};
use serde::{de::DeserializeOwned, Deserialize, Serialize};
use uuid::Uuid;

use crate::{
  error::{KalamcheErrorExt, KalamcheErrorType, KalamcheResult},
  settings::structs::JwtConfig,
};

const TOKEN_AUD: &str = "Klamache";
const TOKEN_ISS: &str = "Kalamche";

#[derive(Debug, Serialize, Deserialize)]
pub struct ATClaims {
  pub sub: Uuid,
  pub aud: String,
  pub iss: String,
  pub exp: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RTClaims {
  pub sub: Uuid,
  pub aud: String,
  pub iss: String,
  pub exp: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VerificationClaims {
  pub sub: Uuid,
  pub code: u32,
  pub aud: String,
  pub iss: String,
  pub exp: usize,
}

pub fn sign_access_token(config: &JwtConfig, sub: Uuid) -> KalamcheResult<String> {
  let claims = ATClaims {
    sub,
    aud: TOKEN_AUD.to_owned(),
    iss: TOKEN_ISS.to_owned(),
    exp: (Utc::now() + Duration::minutes(config.at_expiry as i64)).timestamp() as usize,
  };

  let access_token = encode(
    &Header::default(),
    &claims,
    &EncodingKey::from_secret(config.at_secret.as_bytes()),
  )?;

  Ok(access_token)
}

pub fn sign_refresh_token(config: &JwtConfig, sub: Uuid) -> KalamcheResult<String> {
  let claims = RTClaims {
    sub,
    aud: TOKEN_AUD.to_owned(),
    iss: TOKEN_ISS.to_owned(),
    exp: (Utc::now() + Duration::days(config.rt_expiry as i64)).timestamp() as usize,
  };

  let refresh_token = encode(
    &Header::default(),
    &claims,
    &EncodingKey::from_secret(config.rt_secret.as_bytes()),
  )?;

  Ok(refresh_token)
}

pub fn sign_verification_token(config: &JwtConfig, sub: Uuid, code: u32) -> KalamcheResult<String> {
  let claims = VerificationClaims {
    sub,
    code,
    aud: TOKEN_AUD.to_owned(),
    iss: TOKEN_ISS.to_owned(),
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

  Ok(token_claims)
}

pub fn verify_verification_token(
  config: &JwtConfig,
  token: &str,
) -> KalamcheResult<VerificationClaims> {
  let token_claims =
    decode_token::<VerificationClaims>(&config.verification_secret.as_bytes(), token)?;

  Ok(token_claims)
}

pub fn verify_access_token(config: &JwtConfig, token: &str) -> KalamcheResult<ATClaims> {
  let token_claims = decode_token::<ATClaims>(config.at_secret.as_bytes(), token)?;

  Ok(token_claims)
}

pub(crate) fn decode_token<Claims>(secret: &[u8], token: &str) -> KalamcheResult<Claims>
where
  Claims: DeserializeOwned,
{
  let token = decode::<Claims>(
    token,
    &DecodingKey::from_secret(secret),
    &config_vaidation(),
  )
  .with_kalamche_type(KalamcheErrorType::NotLoggedIn)?;

  Ok(token.claims)
}

fn config_vaidation() -> Validation {
  let mut validation = Validation::new(Algorithm::HS256);
  validation.set_audience(&[TOKEN_AUD]);
  validation.set_issuer(&[TOKEN_ISS]);
  validation.set_required_spec_claims(&["sub", "exp", "aud"]);

  validation
}
