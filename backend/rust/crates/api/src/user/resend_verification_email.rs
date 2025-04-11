use actix_web::{
  post,
  web::{Data, Json},
};
use api_common::{
  context::KalamcheContext,
  user::{ResendVerificationEmail, ResendVerificationEmailResponse},
  utils::send_account_verification_email,
};
use chrono::{Duration, Utc};
use db_schema::source::pending_user::{PendingUser, PendingUserInsertForm};
use utils::{
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
  settings::SETTINGS,
  utils::{
    random::generate_verification_code, token::sign_verification_token, validation::is_email_valid,
  },
};

#[post("/verify/resend")]
pub async fn resend_verification_code(
  context: Data<KalamcheContext>,
  payload: Json<ResendVerificationEmail>,
) -> KalamcheResult<Json<ResendVerificationEmailResponse>> {
  is_email_valid(&payload.email)?;

  // find pending user and delete for new insert
  let pending_user = PendingUser::find_by_email(&mut context.pool(), &payload.email)
    .await?
    .ok_or(KalamcheErrorType::NotRegistered)?;
  if Utc::now().signed_duration_since(pending_user.created_at) < Duration::minutes(1) {
    return Err(KalamcheError::from(KalamcheErrorType::RegistrationCooldown));
  }

  PendingUser::delete_by_id(&mut context.pool(), pending_user.id).await?;

  let pending_user_form = PendingUserInsertForm {
    email: pending_user.email,
    password_hash: pending_user.password_hash,
    token: "".to_owned(),
  };
  let pending_user = PendingUser::insert(&mut context.pool(), pending_user_form).await?;

  let verification_code = generate_verification_code();
  let verification_token =
    sign_verification_token(SETTINGS.get_jwt(), pending_user.id, verification_code)?;

  PendingUser::update_token(
    &mut context.pool(),
    pending_user.id,
    verification_token.clone(),
  )
  .await?;

  send_account_verification_email(&payload.email, verification_code).await?;

  Ok(Json(ResendVerificationEmailResponse {
    success: true,
    verification_token,
  }))
}
