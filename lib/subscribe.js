const { getFirestore } = require('../lib/firebase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fcmToken, trainId, trainName, platform } = req.body;

  if (!fcmToken || !trainId) {
    return res.status(400).json({ success: false, error: 'fcmToken and trainId are required' });
  }

  try {
    const db = getFirestore();

    const existing = await db.collection('subscriptions')
      .where('fcmToken', '==', fcmToken)
      .where('trainId', '==', parseInt(trainId))
      .limit(1)
      .get();

    if (!existing.empty) {
      return res.status(200).json({ success: true, message: 'Already subscribed' });
    }

    await db.collection('subscriptions').add({
      fcmToken,
      trainId: parseInt(trainId),
      trainName: trainName || `Train ${trainId}`,
      platform: platform || 'unknown',
      createdAt: new Date(),
      isActive: true,
    });

    return res.status(201).json({ success: true, message: 'Subscribed successfully' });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};