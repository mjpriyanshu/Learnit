// Simple in-memory TTL cache.
// NOTE: This cache is per-process (not shared across instances) and will reset on restart.

export class TTLCache {
  constructor({ maxSize = 1000 } = {}) {
    this.maxSize = maxSize;
    this.map = new Map();
  }

  get(key) {
    const entry = this.map.get(key);
    if (!entry) return null;

    if (entry.expiresAt !== null && Date.now() > entry.expiresAt) {
      this.map.delete(key);
      return null;
    }

    return entry.value;
  }

  set(key, value, ttlMs) {
    const expiresAt = typeof ttlMs === "number" ? Date.now() + ttlMs : null;

    // Basic cap to avoid unbounded memory growth
    if (!this.map.has(key) && this.map.size >= this.maxSize) {
      // delete oldest
      const oldestKey = this.map.keys().next().value;
      if (oldestKey !== undefined) this.map.delete(oldestKey);
    }

    this.map.set(key, { value, expiresAt });
  }

  delete(key) {
    this.map.delete(key);
  }

  clear() {
    this.map.clear();
  }
}
