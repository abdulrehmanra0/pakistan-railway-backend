const fetch = require('node-fetch');
const cache = require('./cache');
const SOURCES = require('./sources');

async function fetchWithFallback(dataKey, ttlMs) {
  // 1. Check cache first
  const cached = cache.get(dataKey);
  if (cached) {
    return { data: cached, source: 'cache' };
  }

  // 2. Try primary source
  try {
    const response = await fetch(SOURCES.PRIMARY[dataKey], {
      timeout: 5000, // 5 second timeout
      headers: {
        'User-Agent': 'PakistanRailwayApp/1.0',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const raw = await response.json();
    
    // Normalize: some return { Response: [...] }, others return [...] directly
    const data = raw.Response || raw;
    
    cache.set(dataKey, data, ttlMs);
    return { data, source: 'primary' };

  } catch (primaryError) {
    console.error(`Primary source failed for ${dataKey}:`, primaryError.message);

    // 3. Try GitHub fallback
    try {
      const response = await fetch(SOURCES.FALLBACK[dataKey]);
      if (!response.ok) throw new Error(`Fallback HTTP ${response.status}`);
      
      const data = await response.json();
      return { data, source: 'fallback' };

    } catch (fallbackError) {
      console.error(`Fallback also failed for ${dataKey}:`, fallbackError.message);
      throw new Error(`All sources failed for ${dataKey}`);
    }
  }
}

module.exports = { fetchWithFallback };