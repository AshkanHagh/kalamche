use actix_web::dev::{Service, ServiceRequest, ServiceResponse, Transform};
use futures::future::{ok, Ready};
use rate_limiter::{ActionType, BucketConfig, RateLimitChecker};
use std::{collections::HashMap, future::Future, pin::Pin, rc::Rc};

use crate::{cache::RedisCache, error::KalamcheErrorType};

pub mod rate_limiter;

#[derive(Clone)]
pub struct RateLimiter {
  redis_pool: RedisCache,
  bucket_configs: HashMap<ActionType, BucketConfig>,
}

impl RateLimiter {
  #[rustfmt::skip]
  pub fn new(redis_pool: &RedisCache) -> Self {
    let mut bucket_configs = HashMap::new();

    bucket_configs.insert(
      ActionType::Register,
      BucketConfig { capacity: 10, secs_to_refill: 5 },
    );
    bucket_configs.insert(
      ActionType::Image,
      BucketConfig { capacity: 10, secs_to_refill: 5 },
    );
    bucket_configs.insert(
      ActionType::Product,
      BucketConfig { capacity: 10, secs_to_refill: 5 },
    );
    bucket_configs.insert(
      ActionType::Search,
      BucketConfig { capacity: 10, secs_to_refill: 5 },
    );

    Self {
      redis_pool: redis_pool.clone(),
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

  fn new_checker(&self, action_type: ActionType) -> RateLimitChecker {
    let config = self
      .bucket_configs
      .get(&action_type)
      .ok_or(KalamcheErrorType::InvalidRateLimitActionType)
      .unwrap();

    RateLimitChecker {
      action_type,
      bucket_config: config.clone(),
      redis_pool: self.redis_pool.clone(),
      key: "".to_string(),
    }
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
      let ip = req
        .connection_info()
        .realip_remote_addr()
        .unwrap_or("127.0.0.1")
        .to_string();

      checker.for_ip(&ip).check().await?;
      service.call(req).await
    })
  }
}

// fn get_ip(conn_info: &ConnectionInfo) -> IpAddr {
//   conn_info
//     .realip_remote_addr()
//     .and_then(parse_ip)
//     .unwrap_or(IpAddr::V4(Ipv4Addr::new(127, 0, 0, 1)))
// }

// fn parse_ip(addr: &str) -> Option<IpAddr> {
//   if let Some(s) = addr.strip_suffix(']') {
//     IpAddr::from_str(s.get(1..)?).ok()
//   } else if let Ok(ip) = IpAddr::from_str(addr) {
//     Some(ip)
//   } else if let Ok(socket) = SocketAddr::from_str(addr) {
//     Some(socket.ip())
//   } else {
//     None
//   }
// }
