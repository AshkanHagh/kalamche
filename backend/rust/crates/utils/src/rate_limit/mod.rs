use actix_web::dev::{Service, ServiceRequest, ServiceResponse, Transform};
use futures::future::{ok, Ready};
use rate_limiter::{ActionType, BucketConfig, RateLimitChecker};
use std::{collections::HashMap, future::Future, net::IpAddr, pin::Pin, rc::Rc};

use crate::{
  cache::Peak,
  error::{KalamcheError, KalamcheErrorExt, KalamcheErrorType},
};

pub mod rate_limiter;

#[derive(Clone)]
pub struct RateLimiter {
  cache: Peak<String, u32>,
  bucket_configs: HashMap<ActionType, BucketConfig>,
}

// bucket configs are all set for development
impl RateLimiter {
  pub fn new(cache: &Peak<String, u32>) -> Self {
    let mut bucket_configs = HashMap::new();
    Self::with_test_config(&mut bucket_configs);

    Self {
      cache: cache.clone(),
      bucket_configs,
    }
  }

  pub fn register(&self) -> RateLimitChecker {
    self.new_checker(ActionType::Register)
  }

  pub fn product(&self) -> RateLimitChecker {
    self.new_checker(ActionType::Product)
  }

  pub fn search(&self) -> RateLimitChecker {
    self.new_checker(ActionType::Search)
  }

  pub fn image(&self) -> RateLimitChecker {
    self.new_checker(ActionType::Image)
  }

  pub fn payment(&self) -> RateLimitChecker {
    self.new_checker(ActionType::Payment)
  }

  fn new_checker(&self, action_type: ActionType) -> RateLimitChecker {
    let config = self
      .bucket_configs
      .get(&action_type)
      .ok_or(KalamcheErrorType::InvalidRateLimitActionType)
      .unwrap();

    RateLimitChecker {
      action_type,
      bucket_config: config.clone(),
      cache: self.cache.clone(),
      key: "".to_string(),
    }
  }

  fn with_test_config(bucket_configs: &mut HashMap<ActionType, BucketConfig>) {
    bucket_configs.insert(
      ActionType::Register,
      BucketConfig {
        capacity: 300,
        secs_to_refill: 5,
      },
    );

    bucket_configs.insert(
      ActionType::Image,
      BucketConfig {
        capacity: 300,
        secs_to_refill: 5,
      },
    );

    bucket_configs.insert(
      ActionType::Product,
      BucketConfig {
        capacity: 300,
        secs_to_refill: 5,
      },
    );

    bucket_configs.insert(
      ActionType::Search,
      BucketConfig {
        capacity: 300,
        secs_to_refill: 5,
      },
    );

    bucket_configs.insert(
      ActionType::Payment,
      BucketConfig {
        capacity: 300,
        secs_to_refill: 5,
      },
    );
  }
}

pub struct RateLimitMiddleware<S> {
  checker: RateLimitChecker,
  service: Rc<S>,
}

impl<S> Transform<S, ServiceRequest> for RateLimitChecker
where
  S: Service<ServiceRequest, Response = ServiceResponse, Error = actix_web::Error> + 'static,
  S::Future: 'static,
{
  type Response = S::Response;
  type Error = actix_web::Error;
  type InitError = ();
  type Transform = RateLimitMiddleware<S>;
  type Future = Ready<Result<Self::Transform, Self::InitError>>;

  fn new_transform(&self, service: S) -> Self::Future {
    ok(RateLimitMiddleware {
      checker: self.clone(),
      service: Rc::new(service),
    })
  }
}

type FutResult<T, E> = dyn Future<Output = Result<T, E>>;

impl<S> Service<ServiceRequest> for RateLimitMiddleware<S>
where
  S: Service<ServiceRequest, Response = ServiceResponse, Error = actix_web::Error> + 'static,
  S::Future: 'static,
{
  type Response = S::Response;
  type Error = actix_web::Error;
  type Future = Pin<Box<FutResult<Self::Response, Self::Error>>>;

  fn poll_ready(
    &self,
    ctx: &mut core::task::Context<'_>,
  ) -> std::task::Poll<Result<(), Self::Error>> {
    self.service.poll_ready(ctx)
  }

  fn call(&self, req: ServiceRequest) -> Self::Future {
    let mut checker = self.checker.clone();
    let service = self.service.clone();

    Box::pin(async move {
      let ip = match req.connection_info().realip_remote_addr() {
        Some(ip) => {
          let ip: IpAddr = ip
            .parse()
            .with_kalamche_type(KalamcheErrorType::RateLimitError)?;
          Ok(ip)
        }
        None => Err(KalamcheError::from(KalamcheErrorType::RateLimitError)),
      }?;

      checker.for_ip(&ip).check().await?;
      service.call(req).await
    })
  }
}
