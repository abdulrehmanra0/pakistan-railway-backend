const { getMessaging, getFirestore } = require('./firebase');

async function sendToMultiple(tokens, notification, data = {}) {
  if (tokens.length === 0) return { successCount: 0, failureCount: 0 };

  const messaging = getMessaging();

  const message = {
    tokens: tokens,
    notification: {
      title: notification.title,
      body:  notification.body,
    },
    data: {
      ...data,
      clickAction: 'FLUTTER_NOTIFICATION_CLICK',
    },
    android: {
      notification: {
        channelId: 'train_alerts',
        priority:  'high',
      },
    },
  };

  try {
    const response = await messaging.sendEachForMulticast(message);
    return { successCount: response.successCount, failureCount: response.failureCount };
  } catch (error) {
    console.error('FCM Error:', error);
    return { successCount: 0, failureCount: tokens.length };
  }
}

async function getSubscribersForTrain(trainId) {
  const db = getFirestore();
  const snapshot = await db.collection('subscriptions')
    .where('trainId', '==', parseInt(trainId))
    .where('isActive', '==', true)
    .get();
  return snapshot.docs.map(d => d.data().fcmToken);
}

module.exports = { sendToMultiple, getSubscribersForTrain };