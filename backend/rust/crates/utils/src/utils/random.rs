use rand::{thread_rng, Rng};

pub fn generate_verification_code() -> u32 {
  thread_rng().gen_range(100_000..=999_999)
}
