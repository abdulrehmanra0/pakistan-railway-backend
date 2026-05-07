const fetch = require('node-fetch');
const { getFirestore } = require('../../lib/firebase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  // Security check
  const authHeader = req.headers['x-cron-secret'];
  if (authHeader !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // 1. Fetch all live trains from the "Perfect API"
    const response = await fetch('https://app-api.pakraillive.com/api/Train/GetLiveTrains', {
      headers: { 
        'app-api-key': '6f48b484-5e12-4b2c-9f37-09788e6a159d',
        'Accept': 'application/json'
      }
    });
    
    const rawData = await response.json();
    const liveTrains = rawData.Response || rawData;

    const db = getFirestore();
    const batch = db.batch(); // Use a batch for faster, more efficient writes
    let updateCount = 0;

    for (const train of liveTrains) {
      if (!train.IsLive) continue; // Only update trains that are actually moving

      // For each live train, get the high-precision GPS detail
      try {
        const detailUrl = `https://app-api.pakraillive.com/api/Train/GetTrainStationsByTrainId?id=${train.TrainId}`;
        // Note: In a real scenario, we'd use a separate endpoint for current position
        // For now, we store the basic live status and any telemetry available
        
        const trainRef = db.collection('live_positions').doc(String(train.TrainId));
        
        batch.set(trainRef, {
          trainId: train.TrainId,
          trainNumber: train.TrainNumber,
          trainName: train.TrainName,
          isLive: true,
          lastUpdated: new Date().toISOString(),
          // Here we store the general status; 
          // The Flutter app will call the detail API for the exact moving dot
          status: 'active' 
        }, { merge: true });
        
        updateCount++;
      } catch (e) {
        console.error(`Failed to update train ${train.TrainId}`);
      }
    }

    await batch.commit();

    return res.status(200).json({
      success: true,
      updatedTrains: updateCount,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Update Positions Error:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
};