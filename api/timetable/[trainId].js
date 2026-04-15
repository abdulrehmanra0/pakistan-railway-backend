const { fetchWithFallback } = require('../../lib/fetcher');
const { normalizeTimetableStop, normalizeTrain } = require('../../lib/transform');
const { TTL } = require('../../lib/cache');

module.exports = async (req, res) => {
  const trainId = parseInt(req.query.trainId);

  if (!trainId || isNaN(trainId)) {
    return res.status(400).json({ success: false, error: 'Invalid trainId' });
  }

  try {
    const [{ data: rawTrains }, { data: rawTimetables }] = await Promise.all([
      fetchWithFallback('trains', TTL.TRAINS),
      fetchWithFallback('timetables', TTL.TIMETABLES),
    ]);

    const rawTrain = rawTrains.find(t => t.TrainId === trainId);
    if (!rawTrain) {
      return res.status(404).json({ success: false, error: 'Train not found' });
    }

    const timetableEntry = rawTimetables.find(t => t.TrainId === trainId);
    const stops = (timetableEntry?.stations || []).map(normalizeTimetableStop);

    return res.status(200).json({
      success: true,
      train: normalizeTrain(rawTrain),
      totalStops: stops.length,
      timetable: stops,
    });

  } catch (error) {
    return res.status(503).json({
      success: false,
      error: 'Timetable temporarily unavailable',
    });
  }
};