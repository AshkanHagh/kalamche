use rand::{distributions::Alphanumeric, thread_rng, Rng};

pub fn generate_random_string() -> String {
  thread_rng()
    .sample_iter(&Alphanumeric)
    .take(6)
    .map(char::from)
    .collect()
}
