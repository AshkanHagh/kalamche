use std::{
  net::{IpAddr, Ipv4Addr},
  sync::LazyLock,
};
use structs::{
  DatabaseConfig, EmailConfig, ImageConfig, JwtConfig, OAuthConfig, OAuthProviderConfig,
  PaymentConfig, Settings,
};

pub mod structs;

pub static SETTINGS: LazyLock<Settings> = LazyLock::new(|| {
  if std::env::var("KALAMCHE_INITIALIZE_WITH_DEFAULT_SETTINGS").is_ok() {
    println!("KALAMCHE_INITIALIZE_WITH_DEFAULT_SETTINGS was set, any env file has been ignored.");
    Settings::default()
  } else {
    Settings::init()
  }
});

impl Settings {
  pub(self) fn init() -> Self {
    Self {
      database: DatabaseConfig {
        connection: Self::get_var("DATABASE_URL"),
        pool_size: 100,
      },

      oauth_providers: Some(OAuthConfig {
        github: Some(OAuthProviderConfig {
          client_id: Self::get_var("GITHUB_CLIENT_ID"),
          client_secret: Self::get_var("GITHUB_CLIENT_SECRET"),
          redirect_url: Self::get_var("GITHUB_REDIRECT_URL"),
          auth_url: "https://github.com/login/oauth/authorize".to_string(),
          token_url: "https://github.com/login/oauth/access_token".to_string(),
          user_info_url: "https://api.github.com/user".to_string(),
          other_info_url: Some("https://api.github.com/user/emails".to_string()),
        }),
        discord: Some(OAuthProviderConfig {
          client_id: Self::get_var("DISCORD_CLIENT_ID"),
          client_secret: Self::get_var("DISCORD_CLIENT_SECRET"),
          redirect_url: Self::get_var("DISCORD_REDIRECT_URL"),
          auth_url: "https://discord.com/api/oauth2/authorize".to_string(),
          token_url: "https://discord.com/api/oauth2/token".to_string(),
          user_info_url: "https://discord.com/api/users/@me".to_string(),
          other_info_url: None,
        }),
      }),

      email: EmailConfig {
        email: Self::get_var("SMTP_SEND_EMAIL"),
        host: Self::get_var("SMTP_HOST"),
        port: Self::get_var("SMTP_PORT").parse::<u16>().unwrap(),
        user: Self::get_var("SMTP_USER"),
        password: Self::get_var("SMTP_PASSWORD"),
        tls: Self::get_var("SMTP_TLS_ENABLED").parse::<bool>().unwrap(),
      },

      jwt: JwtConfig {
        rt_secret: Self::get_var("REFRESH_TOKEN_SECRET"),
        at_secret: Self::get_var("ACCESS_TOKEN_SECRET"),
        rt_expiry: 2,  // 2d
        at_expiry: 15, // 15m
        verification_secret: Self::get_var("VERIFICATION_TOKEN_SECRET"),
        verfication_expiry: 10, // 10m
      },

      // by default kalamche uses stripe for payment process
      payment: PaymentConfig {
        secret: Self::get_var("STRIPE_SECRET_KEY"),
        success_url: Self::get_var("PAYMENT_SUCCESS_REDIRECT_URL"),
        cancel_url: Self::get_var("PAYMENT_CANCEL_REDIRECT_URL"),
      },

      image: ImageConfig {
        access_key: Self::get_var("S3_ACCESS_KEY"),
        secret_key: Self::get_var("S3_SECRET_KEY"),
        bucket_name: Self::get_var("S3_BUCKET_NAME"),
        endpoint: Self::get_var("S3_ENDPOINT"),
        allow_path_syle: Self::get_var("S3_ALLOW_PATH_STYLE")
          .parse::<bool>()
          .unwrap(),
      },

      bind: IpAddr::V4(Ipv4Addr::new(0, 0, 0, 0)),
      hostname: Self::get_var("HOSTNAME"),
      port: 7319,
      allowed_origin_url: Self::get_var("CORS_ORIGIN"),
    }
  }

  pub fn get_database(&self) -> &DatabaseConfig {
    &self.database
  }

  pub fn get_oauth(&self) -> &Option<OAuthConfig> {
    &self.oauth_providers
  }

  pub fn get_jwt(&self) -> &JwtConfig {
    &self.jwt
  }

  pub fn get_email(&self) -> &EmailConfig {
    &self.email
  }

  pub fn get_payment(&self) -> &PaymentConfig {
    &self.payment
  }

  pub fn get_image(&self) -> &ImageConfig {
    &self.image
  }

  fn get_var(key: &str) -> String {
    dotenvy::var(key).expect(format!("ERROR: could not found env: {}", key).as_ref())
  }
}
