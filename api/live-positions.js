const fetch = require('node-fetch'); 
const SOURCES = require('../lib/sources');

module.exports = async (req, res) => {
  // Handle CORS
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    // We use the 'positions' action from the Supabase API
    const url = `${SOURCES.LIVE_TELEMETRY.base_url}?action=positions`;
    
    const response = await fetch(url, {
      headers: { 
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ 
        success: false, 
        error: `Telemetry API responded with status ${response.status}` 
      });
    }

    const rawData = await response.json();

    if (!rawData || !rawData.success) {
      return res.status(404).json({ success: false, error: 'Live positions not found' });
    }

    // The data is already an array of trains, so we return it directly
    return res.status(200).json({
      success: true,
      timestamp: rawData.timestamp || new Date().toISOString(),
      count: rawData.data.length,
      positions: rawData.data
    });

  } catch (error) {
    console.error('Live Positions Error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error.message
    });
  }
};