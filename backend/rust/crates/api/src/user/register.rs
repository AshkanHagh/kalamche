use actix_web::{
  post,
  web::{Data, Json},
};
use api_common::{
  context::KalamcheContext,
  user::{Register, RegisterResponse},
  utils::send_account_verification_email,
};
use database::source::{
  pending_user::{PendingUser, PendingUserInsertForm},
  user::User,
};
use utils::{
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
  setting::SETTINGS,
  utils::{
    hash::hash_passwrod,
    random::generate_random_string,
    token::sign_verification_token,
    validation::{is_email_valid, is_password_valid},
  },
};
use uuid::Uuid;

#[post("/signup")]
pub async fn register(
  context: Data<KalamcheContext>,
  payload: Json<Register>,
) -> KalamcheResult<Json<RegisterResponse>> {
  is_email_valid(&payload.email)?;
  is_password_valid(&payload.password)?;

  // returns error if exists
  User::email_exists(context.pool(), &payload.email).await?;

  if PendingUser::find_by_email(context.pool(), &payload.email).await? {
    return Err(KalamcheError::from(
      KalamcheErrorType::AccountVerificationIsPending,
    ));
  }

  let pending_user_id = Uuid::new_v4();
  let verification_code = generate_random_string();
  let verification_token = sign_verification_token(
    SETTINGS.get_jwt(),
    pending_user_id,
    verification_code.clone(),
  )?;

  let _ = PendingUser::insert(
    context.pool(),
    PendingUserInsertForm {
      id: pending_user_id,
      email: payload.email.clone(),
      token: verification_token.clone(),
      password_hash: Some(hash_passwrod(&payload.password)?),
    },
  )
  .await?;

  send_account_verification_email(&payload.email, &verification_code).await?;

  Ok(Json(RegisterResponse {
    success: true,
    verification_token,
  }))
}
