use lettre::transport::smtp::authentication::Credentials;
use lettre::{Message, SmtpTransport, Transport};

use crate::error::{KalamcheError, KalamcheErrorExt, KalamcheErrorType, KalamcheResult};
use crate::settings::structs::EmailConfig;

pub fn send_email(subject: &str, to: &str, html: &str, config: &EmailConfig) -> KalamcheResult<()> {
  let email = Message::builder()
    .from(
      config
        .email
        .parse()
        .with_kalamche_type(KalamcheErrorType::InvalidEmailAddress)?,
    )
    .to(
      to.parse()
        .with_kalamche_type(KalamcheErrorType::InvalidEmailAddress)?,
    )
    .subject(subject)
    .body(html.to_string())
    .with_kalamche_type(KalamcheErrorType::EmailSendFaild)?;

  let mailer = match config.tls {
    true => SmtpTransport::relay(&config.host)
      .with_kalamche_type(KalamcheErrorType::EmailSendFaild)?
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
    .map_err(|_| KalamcheError::from(KalamcheErrorType::EmailSendFaild))?;

  Ok(())
}
