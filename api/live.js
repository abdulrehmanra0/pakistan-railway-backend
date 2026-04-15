const { fetchWithFallback } = require('../lib/fetcher');
const { TTL } = require('../lib/cache');

module.exports = async (req, res) => {
  try {
    const { data, source } = await fetchWithFallback('live', TTL.LIVE);

    const liveTrains = (Array.isArray(data) ? data : data.Response || [])
      .map(t => ({
        id:          t.TrainId,
        trainNumber: t.TrainNumber,
        name:        t.TrainName,
        nameUrdu:    t.TrainNameUR,
        isLive:      t.IsLive,
        direction:   t.IsUp ? 'UP' : 'DN',
        description: t.TrainDescription,
      }));

    const liveCount = liveTrains.filter(t => t.isLive).length;

    res.setHeader('X-Data-Source', source);
    return res.status(200).json({
      success: true,
      checkedAt: new Date().toISOString(),
      liveCount,
      totalTrains: liveTrains.length,
      trains: liveTrains,
    });

  } catch (error) {
    return res.status(503).json({
      success: false,
      error: 'Live status temporarily unavailable',
    });
  }
};