const cache = new Map();
const MAX_ENTRIES = 100;
const DEFAULT_TTL = 60 * 1000;

function get(key) {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiry) {
    cache.delete(key);
    return null;
  }
  entry.lastAccess = Date.now();
  return entry.data;
}

function set(key, data, ttl = DEFAULT_TTL) {
  if (cache.size >= MAX_ENTRIES) {
    let oldest = null;
    let oldestKey = null;
    const now = Date.now();
    for (const [k, v] of cache) {
      if (v.expiry <= now) {
        cache.delete(k);
        continue;
      }
      if (!oldest || v.lastAccess < oldest) {
        oldest = v.lastAccess;
        oldestKey = k;
      }
    }
    if (oldestKey && cache.size >= MAX_ENTRIES) {
      cache.delete(oldestKey);
    }
  }
  cache.set(key, { data, expiry: Date.now() + ttl, lastAccess: Date.now() });
}

function del(key) {
  cache.delete(key);
}

function invalidateUserCache(userId) {
  if (!userId) return;
  const idStr = String(userId);
  for (const key of [...cache.keys()]) {
    if (key.includes(idStr)) cache.delete(key);
  }
}

function clear() {
  cache.clear();
}

module.exports = { get, set, del, clear, invalidateUserCache };
