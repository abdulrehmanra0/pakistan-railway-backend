const { fetchWithFallback } = require('../lib/fetcher');
const { normalizeTrain, buildSlug } = require('../lib/transform');
const { TTL } = require('../lib/cache');

module.exports = async (req, res) => {
  // Handle CORS pre-flight
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { data, source } = await fetchWithFallback('trains', TTL.TRAINS);
    
    const trains = data.map(t => ({
      ...normalizeTrain(t),
      slug: buildSlug(t.TrainName),
    }));

    const { direction, live_only, search } = req.query;
    
    let filtered = trains;
    if (direction) {
      filtered = filtered.filter(t => t.direction.toUpperCase() === direction.toUpperCase());
    }
    if (live_only === 'true') {
      filtered = filtered.filter(t => t.isLive);
    }
    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(t => 
        t.name.toLowerCase().includes(q) ||
        t.origin.toLowerCase().includes(q) ||
        t.destination.toLowerCase().includes(q)
      );
    }

    res.setHeader('X-Data-Source', source);
    return res.status(200).json({
      success: true,
      total: filtered.length,
      source,
      trains: filtered,
    });

  } catch (error) {
    return res.status(503).json({
      success: false,
      error: 'Data temporarily unavailable',
      message: error.message,
    });
  }
};