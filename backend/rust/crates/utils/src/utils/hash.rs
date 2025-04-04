use argon2::{
  password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
  Argon2,
};

use crate::error::{KalamcheError, KalamcheErrorType, KalamcheResult};

pub fn hash_passwrod(password: &str) -> KalamcheResult<String> {
  let salt = SaltString::generate(&mut OsRng);
  let password_hash = match Argon2::default().hash_password(password.as_bytes(), &salt) {
    Ok(hash) => hash.to_string(),
    Err(_) => return Err(KalamcheError::from(KalamcheErrorType::InvalidPassword)),
  };

  Ok(password_hash)
}

pub fn verify_passwrod(password: &str, hash: &str) -> KalamcheResult<bool> {
  let parsed_hash =
    PasswordHash::new(hash).map_err(|_| KalamcheError::from(KalamcheErrorType::InvalidPassword))?;

  let matches = Argon2::default()
    .verify_password(password.as_bytes(), &parsed_hash)
    .is_ok();

  Ok(matches)
}
