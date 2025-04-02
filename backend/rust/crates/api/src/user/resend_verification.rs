use actix_web::{
  post,
  web::{Data, Json},
};
use api_common::{
  context::KalamcheContext,
  user::{RegisterResponse, ResendVerification},
  utils::send_account_verification_email,
};
use database::source::pending_user::{PendingUser, PendingUserInsertForm};
use utils::{
  error::{KalamcheErrorType, KalamcheResult},
  settings::SETTINGS,
  utils::{
    random::generate_verification_code, token::sign_verification_token, validation::is_email_valid,
  },
};

#[post("/verify/resend")]
pub async fn resend_verification_code(
  context: Data<KalamcheContext>,
  payload: Json<ResendVerification>,
) -> KalamcheResult<Json<RegisterResponse>> {
  is_email_valid(&payload.email)?;

  // find pending user and delete for new insert
  let pending_user = PendingUser::find_by_email(context.pool(), &payload.email)
    .await?
    .ok_or(KalamcheErrorType::AccountNotRegistered)?;

  PendingUser::delete_by_id(context.pool(), pending_user.id).await?;

  let pending_user = PendingUser::insert(
    context.pool(),
    PendingUserInsertForm {
      email: pending_user.email,
      password_hash: pending_user.password_hash,
      token: "".to_owned(),
    },
  )
  .await?;

  let verification_code = generate_verification_code();
  let verification_token =
    sign_verification_token(SETTINGS.get_jwt(), pending_user.id, verification_code)?;

  PendingUser::update_token(context.pool(), pending_user.id, verification_token.clone()).await?;

  send_account_verification_email(&payload.email, verification_code).await?;

  Ok(Json(RegisterResponse {
    success: true,
    verification_token,
  }))
}
