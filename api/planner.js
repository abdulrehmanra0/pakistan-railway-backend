const { fetchWithFallback } = require('../lib/fetcher');
const { normalizeTrain, normalizeTimetableStop } = require('../lib/transform');
const { TTL } = require('../lib/cache');

module.exports = async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    return res.status(400).json({
      success: false,
      error: 'Both "from" and "to" query parameters are required',
    });
  }

  try {
    const [{ data: rawTrains }, { data: rawTimetables }] = await Promise.all([
      fetchWithFallback('trains', TTL.TRAINS),
      fetchWithFallback('timetables', TTL.TIMETABLES),
    ]);

    const fromLower = from.toLowerCase();
    const toLower   = to.toLowerCase();
    const journeys  = [];

    const timetableMap = {};
    for (const entry of rawTimetables) {
      timetableMap[entry.TrainId] = entry.stations || [];
    }

    for (const rawTrain of rawTrains) {
      const stops = timetableMap[rawTrain.TrainId] || [];
      
      const fromIdx = stops.findIndex(s => s.StationName.toLowerCase().includes(fromLower));
      const toIdx = stops.findIndex(s => s.StationName.toLowerCase().includes(toLower));

      if (fromIdx === -1 || toIdx === -1 || fromIdx >= toIdx) continue;

      const segment = stops.slice(fromIdx, toIdx + 1).map(normalizeTimetableStop);
      const train = normalizeTrain(rawTrain);

      journeys.push({
        train: {
          id: train.id,
          name: train.name,
          nameUrdu: train.nameUrdu,
          trainNumber: train.trainNumber,
          direction: train.direction,
          isLive: train.isLive,
        },
        journey: {
          from: segment[0].station,
          to: segment[segment.length - 1].station,
          departure: segment[0].departure,
          arrival: segment[segment.length - 1].arrival,
          stopsEnRoute: segment.length - 2,
          arrivesDay: segment[segment.length - 1].day,
        },
        stops: segment,
      });
    }

    journeys.sort((a, b) => a.journey.departure.localeCompare(b.journey.departure));

    return res.status(200).json({
      success: true,
      from,
      to,
      totalOptions: journeys.length,
      journeys,
    });

  } catch (error) {
    return res.status(503).json({
      success: false,
      error: 'Journey planner temporarily unavailable',
      message: error.message,
    });
  }
};