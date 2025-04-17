use actix_web::{
  get, post,
  web::{Data, Json, Query},
  HttpRequest, HttpResponse,
};
use api_common::{
  context::KalamcheContext,
  oauth_provider::{AuthenticateWithOAuth, AuthenticateWithOAuthResponse},
  user::{VerifyEmail, VerifyEmailResponse},
  utils::{build_cookie, get_my_user, refresh_tokens, RT_COOKIE_MAX_AGE, RT_COOKIE_NAME},
};
use chrono::{Duration, Utc};
use db_schema::source::{
  oauth_account::{OAuthAccount, OAuthAccountInsertForm},
  pending_user::PendingUser,
  user::{User, UserInsertForm},
  user_role::UserRole,
  wallet::{Wallet, WalletInsertForm},
};
use utils::{
  error::{KalamcheError, KalamcheErrorType, KalamcheResult},
  settings::SETTINGS,
  utils::token::verify_verification_token,
};

#[get("/oauth/callback")]
pub async fn authenticate_with_oauth(
  context: Data<KalamcheContext>,
  req: HttpRequest,
  Query(query): Query<AuthenticateWithOAuth>,
) -> KalamcheResult<HttpResponse> {
  let oauth_user = context
    .oauth()
    .authenticate(&query.provider, query.code)
    .await?;

  let user = match OAuthAccount::find_by_oauth_id(&mut context.pool(), &oauth_user.id).await? {
    Some(account) => User::find_by_id(&mut context.pool(), account.user_id)
      .await?
      .ok_or(KalamcheErrorType::OAuthAuthorizationInvalid)?,
    None => {
      User::email_exists(&mut context.pool(), &oauth_user.email).await?;

      let user_form = UserInsertForm {
        name: oauth_user.name,
        email: oauth_user.email,
        avatar_url: oauth_user.avatar_url,
        password_hash: None,
      };
      let user = insert_new_user(&context, user_form).await?;

      let oauth_account_form = OAuthAccountInsertForm {
        user_id: user.id,
        oauth_user_id: oauth_user.id,
      };
      OAuthAccount::insert(&mut context.pool(), oauth_account_form).await?;

      user
    }
  };

  let (access_token, refresh_token) = refresh_tokens(&context, &req, user.id).await?;
  let my_user = get_my_user(&context, user.id).await?;

  let cookie = build_cookie(&refresh_token, RT_COOKIE_NAME, RT_COOKIE_MAX_AGE);
  Ok(
    HttpResponse::Created()
      .cookie(cookie)
      .json(AuthenticateWithOAuthResponse {
        success: true,
        access_token,
        my_user,
      }),
  )
}

#[post("/verify")]
pub async fn verify_email_registration(
  context: Data<KalamcheContext>,
  req: HttpRequest,
  Json(payload): Json<VerifyEmail>,
) -> KalamcheResult<HttpResponse> {
  let claims = verify_verification_token(SETTINGS.get_jwt(), &payload.token)?;
  if payload.code != claims.code {
    return Err(KalamcheError::from(KalamcheErrorType::InvalidCodeVerifier));
  }

  let pending_user = PendingUser::find_by_id(&mut context.pool(), claims.sub)
    .await?
    .ok_or(KalamcheErrorType::NotRegistered)?;

  // age of the verification token by subtracting the token's created_at time from the current time
  let token_age = Utc::now() - pending_user.created_at;

  // Check if the verification token has expired
  if token_age > Duration::minutes(SETTINGS.get_jwt().verfication_expiry as i64) {
    return Err(KalamcheError::from(KalamcheErrorType::InvalidCodeVerifier));
  }

  let user = match User::find_by_email(&mut context.pool(), &pending_user.email).await? {
    Some(user) => user,
    None => {
      // there is a low chanse to throw error
      let user_name = pending_user
        .email
        .split("@")
        .next()
        .ok_or(KalamcheError::from(KalamcheErrorType::InvalidEmailAddress))?
        .to_string();

      // this never return error
      let password_hash = pending_user
        .password_hash
        .ok_or(KalamcheErrorType::InvalidPassword)?;

      let user_form = UserInsertForm {
        name: user_name,
        email: pending_user.email,
        password_hash: Some(password_hash),
        avatar_url: "#".to_string(), // default avatar_url
      };
      insert_new_user(&context, user_form).await?
    }
  };

  PendingUser::delete_by_id(&mut context.pool(), pending_user.id).await?;

  let (access_token, refresh_token) = refresh_tokens(&context, &req, user.id).await?;
  let my_user = get_my_user(&context, user.id).await?;

  let cookie = build_cookie(&refresh_token, RT_COOKIE_NAME, RT_COOKIE_MAX_AGE);
  Ok(
    HttpResponse::Created()
      .cookie(cookie)
      .json(VerifyEmailResponse {
        success: true,
        access_token,
        my_user,
      }),
  )
}

pub async fn insert_new_user(
  context: &KalamcheContext,
  insert_form: UserInsertForm,
) -> KalamcheResult<User> {
  let user = User::insert(&mut context.pool(), insert_form).await?;
  UserRole::insert_with_default_role(&mut context.pool(), user.id).await?;

  // default first signin wallet
  let wallet_form = WalletInsertForm {
    user_id: user.id,
    fr_tokens: 50,
  };
  Wallet::insert_default_if_not_exists(&mut context.pool(), wallet_form).await?;

  Ok(user)
}
