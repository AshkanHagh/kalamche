use std::{
  collections::HashMap,
  hash::Hash,
  sync::{Arc, RwLock},
  thread,
  time::{Duration, Instant},
};

use crate::error::{KalamcheErrorType, KalamcheResult};

struct CacheEntry<V> {
  value: V,
  inserted_at: Instant,
}

pub struct Peak<K, V> {
  inner: Arc<RwLock<CacheInner<K, V>>>,
  cleanup_interval: Duration,
}

struct CacheInner<K, V> {
  map: HashMap<K, CacheEntry<V>>,
  max_capacity: usize,
  ttl: Duration,
  keys_by_access_time: Vec<K>,
}

impl<K, V> Peak<K, V>
where
  K: Clone + Eq + Hash + Send + Sync + 'static,
  V: Clone + Send + Sync + 'static,
{
  pub fn new(max_capacity: usize, ttl_seconds: u64, cleanup_interval_seconds: u64) -> Self {
    let inner = Arc::new(RwLock::new(CacheInner {
      map: HashMap::with_capacity(max_capacity),
      max_capacity,
      ttl: Duration::from_secs(ttl_seconds),
      keys_by_access_time: Vec::with_capacity(max_capacity),
    }));

    let cache = Peak {
      inner,
      cleanup_interval: Duration::from_secs(cleanup_interval_seconds),
    };

    if cleanup_interval_seconds > 0 {
      cache.start_cleanup_thread();
    }

    cache
  }

  fn start_cleanup_thread(&self) {
    let inner_clone = Arc::clone(&self.inner);
    let interval = self.cleanup_interval;

    thread::spawn(move || loop {
      thread::sleep(interval);

      if let Ok(mut cache) = inner_clone.write() {
        Self::remove_expired_entries(&mut cache);
      }
    });
  }

  fn remove_expired_entries(cache: &mut CacheInner<K, V>) {
    let now = Instant::now();
    let expired_keys: Vec<K> = cache
      .map
      .iter()
      .filter(|(_, entry)| now.duration_since(entry.inserted_at) > cache.ttl)
      .map(|(k, _)| k.clone())
      .collect();

    for key in expired_keys {
      if let Some(pos) = cache.keys_by_access_time.iter().position(|k| k == &key) {
        cache.keys_by_access_time.remove(pos);
      }
      cache.map.remove(&key);
    }
  }

  pub fn insert(&self, key: K, value: V) -> KalamcheResult<()> {
    let mut cache = self
      .inner
      .write()
      .map_err(|err| KalamcheErrorType::CacheSystemErr(err.to_string()))?;

    Self::remove_expired_entries(&mut cache);

    if cache.map.len() >= cache.max_capacity && !cache.map.contains_key(&key) {
      if let Some(oldest_key) = cache.keys_by_access_time.first().cloned() {
        if let Some(pos) = cache
          .keys_by_access_time
          .iter()
          .position(|k| k == &oldest_key)
        {
          cache.keys_by_access_time.remove(pos);
        }
        cache.map.remove(&oldest_key);
      }
    }

    let entry = CacheEntry {
      value,
      inserted_at: Instant::now(),
    };

    if let Some(pos) = cache.keys_by_access_time.iter().position(|k| k == &key) {
      cache.keys_by_access_time.remove(pos);
    }

    cache.map.insert(key.clone(), entry);
    cache.keys_by_access_time.push(key);

    Ok(())
  }

  pub fn get(&self, key: &K) -> KalamcheResult<Option<V>> {
    let read_cache = self
      .inner
      .read()
      .map_err(|err| KalamcheErrorType::CacheSystemErr(err.to_string()))?;

    match read_cache.map.get(key) {
      Some(entry) => {
        if entry.inserted_at.elapsed() > read_cache.ttl {
          drop(read_cache);

          let mut write_cache = self
            .inner
            .write()
            .map_err(|err| KalamcheErrorType::CacheSystemErr(err.to_string()))?;

          write_cache.map.remove(key);
          write_cache.keys_by_access_time.retain(|k| k != key);

          Ok(None)
        } else {
          drop(read_cache);

          let mut write_cache = self
            .inner
            .write()
            .map_err(|err| KalamcheErrorType::CacheSystemErr(err.to_string()))?;

          let value = if let Some(entry) = write_cache.map.get(key) {
            entry.value.clone()
          } else {
            return Ok(None); // Entry was removed by another thread
          };

          write_cache.keys_by_access_time.retain(|k| k != key);
          write_cache.keys_by_access_time.push(key.clone());

          Ok(Some(value))
        }
      }
      None => Ok(None),
    }
  }

  pub fn remove(&self, key: &K) -> KalamcheResult<()> {
    let mut cache = self
      .inner
      .write()
      .map_err(|err| KalamcheErrorType::CacheSystemErr(err.to_string()))?;

    cache.map.remove(key);
    cache.keys_by_access_time.retain(|k| k == key);

    Ok(())
  }

  pub fn len(&self) -> KalamcheResult<usize> {
    let cache = self
      .inner
      .read()
      .map_err(|err| KalamcheErrorType::CacheSystemErr(err.to_string()))?;

    Ok(cache.map.len())
  }

  pub fn is_empty(&self) -> KalamcheResult<bool> {
    let cache = self
      .inner
      .read()
      .map_err(|err| KalamcheErrorType::CacheSystemErr(err.to_string()))?;
    Ok(cache.map.is_empty())
  }

  pub fn clear(&self) -> KalamcheResult<()> {
    let mut cache = self
      .inner
      .write()
      .map_err(|err| KalamcheErrorType::CacheSystemErr(err.to_string()))?;

    cache.map.clear();
    cache.keys_by_access_time.clear();

    Ok(())
  }
}

impl<K, V> Clone for Peak<K, V>
where
  K: Clone + Eq + Hash + Send + Sync + 'static,
  V: Clone + Send + Sync + 'static,
{
  fn clone(&self) -> Self {
    Peak {
      inner: Arc::clone(&self.inner),
      cleanup_interval: self.cleanup_interval,
    }
  }
}
