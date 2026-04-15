const { getFirestore } = require('../lib/firebase');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { fcmToken, trainId } = req.body;
  if (!fcmToken) return res.status(400).json({ success: false, error: 'fcmToken is required' });

  try {
    const db = getFirestore();
    const query = db.collection('subscriptions').where('fcmToken', '==', fcmToken);

    const finalQuery = trainId ? query.where('trainId', '==', parseInt(trainId)) : query;
    const snapshot = await finalQuery.get();

    const deletePromises = snapshot.docs.map(doc => doc.ref.delete());
    await Promise.all(deletePromises);

    return res.status(200).json({ success: true, removedCount: snapshot.size });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};