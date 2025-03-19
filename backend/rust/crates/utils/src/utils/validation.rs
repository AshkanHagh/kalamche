use regex::Regex;

use crate::error::{KalamcheError, KalamcheErrorType, KalamcheResult};

// Regex pattern for validating email addresses:
// - The email must consist of alphanumeric characters, special characters (_%+-), followed by '@'.
// - After '@', it must contain a domain name (alphanumeric, hyphens allowed).
// - The domain must end with a dot followed by a valid 2 or more character top-level domain.
const EMAIL_REGEX: &str = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$";

// Regex pattern for validating passwords:
// - Minimum length of 7 characters.
// - Must contain at least one lowercase letter.
// - Must contain at least one uppercase letter.
// - Must contain at least one number.
const PASSWORD_REGEX: &str = r"^[a-zA-Z\d]{7,}$";

pub fn is_email_valid(email: &str) -> KalamcheResult<()> {
  let regex = Regex::new(EMAIL_REGEX)?;
  if !regex.is_match(email) {
    return Err(KalamcheError::from(KalamcheErrorType::InvalidEmailAddress));
  }

  Ok(())
}

pub fn is_password_valid(password: &str) -> KalamcheResult<()> {
  let regex = Regex::new(PASSWORD_REGEX)?;
  if !regex.is_match(password) {
    return Err(KalamcheError::from(KalamcheErrorType::InvalidPassword));
  }

  Ok(())
}
