const fetch = require('node-fetch');

module.exports = async (req, res) => {
  if (req.method === 'OPTIONS') return res.status(200).end();
  const { id } = req.query; // trainId passed as query param
  if (!id) return res.status(400).json({ success: false, error: 'id is required' });

  try {
    const response = await fetch(`https://app-api.pakraillive.com/api/Train/GetTrainStationsByTrainId?id=${id}`, {
      headers: { 
        'app-api-key': '6f48b484-5e12-4b2c-9f37-09788e6a159d',
        'Host': 'app-api.pakraillive.com',
        'Accept': 'application/json' 
      }
    });
    const data = await response.json();
    return res.status(200).json({ success: true, stations: data.Response || data });
  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};