const fetch = require('node-fetch'); 
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
    const url = `${SOURCES.LIVE_TELEMETRY.base_url}?action=train-detail&trainId=${trainId}`;
    
    // We add a User-Agent to prevent the external API from blocking us
    const response = await fetch(url, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      // This will tell us exactly if it's a 403 Forbidden or 404 Not Found
      return res.status(response.status).json({ 
        success: false, 
        error: `Telemetry API responded with status ${response.status}` 
      });
    }

    const rawData = await response.json();

    if (!rawData || !rawData.success) {
      return res.status(404).json({ success: false, error: 'Train data not found' });
    }

    return res.status(200).json({
      success: true,
      timestamp: rawData.timestamp,
      trainDetail: rawData.data
    });

  } catch (error) {
    console.error('CRITICAL ERROR:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
};