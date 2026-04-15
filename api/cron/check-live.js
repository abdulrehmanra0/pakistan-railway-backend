const { getFirestore } = require('../../lib/firebase');
const { sendToMultiple, getSubscribersForTrain } = require('../../lib/fcm');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const authHeader = req.headers['x-cron-secret'];
  if (authHeader !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const response = await fetch('https://traintracking.pk/api/live-trains');
    const rawData = await response.json();
    const currentLiveStatus = Array.isArray(rawData) ? rawData : (rawData.Response || []);

    const db = getFirestore();
    const notifications = [];

    for (const train of currentLiveStatus) {
      const trainId = train.TrainId;
      const isNowLive = train.IsLive;
      const trainName = train.TrainName;

      const stateRef = db.collection('live_state').doc(String(trainId));
      const stateDoc = await stateRef.get();
      const lastState = stateDoc.exists ? stateDoc.data() : null;
      const wasLive = lastState?.isLive ?? null;

      if (wasLive !== null && wasLive !== isNowLive) {
        notifications.push({ trainId, trainName, isNowLive });
      }

      await stateRef.set({
        trainId, trainName, isLive: isNowLive,
        lastChecked: new Date(),
        previousState: wasLive,
      }, { merge: true });
    }

    for (const { trainId, trainName, isNowLive } of notifications) {
      const tokens = await getSubscribersForTrain(trainId);
      if (tokens.length === 0) continue;

      const notif = isNowLive 
        ? { title: `${trainName} is now running`, body: 'Your train is active. Check the schedule!' }
        : { title: `${trainName} update`, body: 'This train is currently not running.' };

      await sendToMultiple(tokens, notif, { trainId: String(trainId), type: 'live_status_change' });
    }

    return res.status(200).json({ success: true, stateChanges: notifications.length });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};