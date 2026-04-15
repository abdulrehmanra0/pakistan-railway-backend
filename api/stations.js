const { fetchWithFallback } = require('../lib/fetcher');
const { normalizeStation } = require('../lib/transform');
const { TTL } = require('../lib/cache');

module.exports = async (req, res) => {
  try {
    const { data, source } = await fetchWithFallback('stations', TTL.STATIONS);
    const { search } = req.query;

    let stations = data.map(normalizeStation).filter(s => s.isActive);

    if (search && search.length >= 2) {
      const q = search.toLowerCase();
      stations = stations.filter(s => 
        s.name.toLowerCase().includes(q) || 
        s.city.toLowerCase().includes(q)
      );
    }

    res.setHeader('X-Data-Source', source);
    return res.status(200).json({
      success: true,
      total: stations.length,
      stations,
    });

  } catch (error) {
    return res.status(503).json({
      success: false,
      error: 'Stations data temporarily unavailable',
    });
  }
};