const TTL = {
  LIVE:      5  * 60 * 1000,       // 5 minutes
  TRAINS:    24 * 60 * 60 * 1000,  // 24 hours
  TIMETABLES:24 * 60 * 60 * 1000,  // 24 hours
  STATIONS:  24 * 60 * 60 * 1000,  // 24 hours
}

const store = {}

function get(key) {
  const entry = store[key]
  if (!entry) return null
  if (Date.now() > entry.expires) {
    delete store[key]
    return null
  }
  return entry.data
}

function set(key, data, ttlMs) {
  store[key] = {
    data,
    expires: Date.now() + ttlMs,
    cachedAt: new Date().toISOString()
  }
}

function invalidate(key) {
  delete store[key]
}

module.exports = { get, set, invalidate, TTL }