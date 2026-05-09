const { fetchWithFallback } = require('../lib/fetcher');
const { normalizeTrain } = require('../lib/transform');
const { TTL } = require('../lib/cache');

module.exports = async (req, res) => {
  // Handle CORS
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { stationId } = req.query;

  if (!stationId) {
    return res.status(400).json({
      success: false,
      error: 'stationId is required',
    });
  }

  try {
    // 1. Fetch both trains and timetables to cross-reference them
    const [{ data: rawTrains }, { data: rawTimetables }] = await Promise.all([
      fetchWithFallback('trains', TTL.TRAINS),
      fetchWithFallback('timetables', TTL.TIMETABLES),
    ]);

    const targetStationId = parseInt(stationId);
    const trainsAtStation = [];

    // 2. Create a map of TrainId -> Stations
    const timetableMap = {};
    for (const entry of rawTimetables) {
      timetableMap[entry.TrainId] = entry.stations || [];
    }

    // 3. Scan every train to see if it stops at this station
    for (const rawTrain of rawTrains) {
      const stops = timetableMap[rawTrain.TrainId] || [];
      
      // Find the specific stop that matches our stationId
      const stop = stops.find(s => s.StationId === targetStationId);

      if (stop) {
        const train = normalizeTrain(rawTrain);
        trainsAtStation.push({
          trainId: train.id,
          trainName: train.name,
          trainNumber: train.trainNumber,
          direction: train.direction,
          arrivalTime: stop.ArrivalTime || '--:--',
          departureTime: stop.DepartureTime || '--:--',
          stopOrder: stop.OrderNumber
        });
      }
    }

    // 4. Sort trains by departure time so the user sees the next train first
    trainsAtStation.sort((a, b) => a.departureTime.localeCompare(b.departureTime));

    return res.status(200).json({
      success: true,
      stationId: targetStationId,
      totalTrains: trainsAtStation.length,
      trains: trainsAtStation,
    });

  } catch (error) {
    console.error('Station Schedule Error:', error);
    return res.status(503).json({
      success: false,
      error: 'Station schedule temporarily unavailable',
      message: error.message,
    });
  }
};