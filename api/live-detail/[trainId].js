const { fetchWithFallback } = require('../lib/fetcher');
const SOURCES = require('../lib/sources');

module.exports = async (req, res) => {
  // Handle CORS
  if (req.method === 'OPTIONS') return res.status(200).end();

  const trainId = req.query.trainId;

  if (!trainId) {
    return res.status(400).json({ success: false, error: 'trainId is required' });
  }

  try {
    // Construct the URL for the specific train detail
    const url = `${SOURCES.LIVE_TELEMETRY.base_url}?action=train-detail&trainId=${trainId}`;
    
    const response = await fetch(url, {
      headers: { 'Accept': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Telemetry API returned ${response.status}`);
    }

    const rawData = await response.json();

    if (!rawData.success) {
      return res.status(404).json({ success: false, error: 'Train data not found' });
    }

    // We return the data exactly as it is because it is already very clean
    return res.status(200).json({
      success: true,
      timestamp: rawData.timestamp,
      trainDetail: rawData.data
    });

  } catch (error) {
    console.error('Live Detail Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch live telemetry data',
      message: error.message
    });
  }
};