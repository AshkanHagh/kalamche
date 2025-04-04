use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};

use crate::error::{KalamcheError, KalamcheErrorExt, KalamcheErrorType, KalamcheResult};
use crate::settings::structs::EmailConfig;

pub fn send_email(subject: &str, to: &str, html: &str, config: &EmailConfig) -> KalamcheResult<()> {
  let from_email = config
    .email
    .parse()
    .with_kalamche_type(KalamcheErrorType::InvalidEmailAddress)?;
  let to_email = to
    .parse()
    .with_kalamche_type(KalamcheErrorType::InvalidEmailAddress)?;

  let email = Message::builder()
    .from(from_email)
    .to(to_email)
    .subject(subject)
    .body(html.to_string())
    .with_kalamche_type(KalamcheErrorType::EmailSendFailed)?;

  let mailer = match config.tls {
    true => SmtpTransport::relay(&config.host)
      .with_kalamche_type(KalamcheErrorType::EmailSendFailed)?
      .port(config.port)
      .credentials(Credentials::new(
        config.user.clone(),
        config.password.clone(),
      ))
      .build(),
    false => SmtpTransport::builder_dangerous(&config.host)
      .port(config.port)
      .build(),
  };

  mailer
    .send(&email)
    .map_err(|_| KalamcheError::from(KalamcheErrorType::EmailSendFailed))?;

  Ok(())
}
