use jsonwebtoken::{encode, EncodingKey, Header};
use serde::{Deserialize, Serialize};
use uuid::Uuid;

use crate::{error::KalamcheResult, setting::structs::JwtConfig};

#[derive(Debug, Serialize, Deserialize)]
pub struct ATClaims {
  pub sub: Uuid,
  pub aud: String,
  pub iss: String,
  pub t_type: String,
  pub scope: Vec<String>,
  pub exp: usize,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct RTClaims {
  pub sub: Uuid,
  pub aud: String,
  pub iss: String,
  pub t_type: String,
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
    exp: config.at_expiry,
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
    t_type: "refresh".to_string(),
    exp: config.rt_expiry,
  };

  let refresh_token = encode(
    &Header::default(),
    &claims,
    &EncodingKey::from_secret(config.rt_secret.as_bytes()),
  )?;

  Ok(refresh_token)
}
