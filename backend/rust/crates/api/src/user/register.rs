use actix_web::{
  post,
  web::{Data, Json},
};
use api_common::{
  context::KalamcheContext,
  user::{Register, RegisterResponse},
  utils::send_account_verification_email,
};
use db_schema::source::{
  pending_user::{PendingUser, PendingUserInsertForm},
  user::User,
};
use utils::{
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
  settings::SETTINGS,
  utils::{
    hash::hash_passwrod,
    random::generate_verification_code,
    token::sign_verification_token,
    validation::{is_email_valid, is_password_valid},
  },
};

#[post("/register")]
pub async fn register(
  context: Data<KalamcheContext>,
  payload: Json<Register>,
) -> KalamcheResult<Json<RegisterResponse>> {
  is_email_valid(&payload.email)?;
  is_password_valid(&payload.password)?;

  // returns error if exists
  User::email_exists(context.pool(), &payload.email).await?;

  if PendingUser::exists_by_email(context.pool(), &payload.email).await? {
    return Err(KalamcheError::from(KalamcheErrorType::PendingToVerify));
  }

  let pending_user = PendingUser::insert(
    context.pool(),
    PendingUserInsertForm {
      email: payload.email.clone(),
      token: "".to_string(),
      password_hash: Some(hash_passwrod(&payload.password)?),
    },
  )
  .await?;

  let verification_code = generate_verification_code();
  let verification_token = sign_verification_token(
    SETTINGS.get_jwt(),
    pending_user.id,
    verification_code.clone(),
  )?;

  PendingUser::update_token(context.pool(), pending_user.id, verification_token.clone()).await?;

  send_account_verification_email(&payload.email, verification_code).await?;

  Ok(Json(RegisterResponse {
    success: true,
    verification_token,
  }))
}
