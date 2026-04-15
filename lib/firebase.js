let adminApp = null;

function getFirebaseAdmin() {
  if (adminApp) return adminApp;

  const admin = require('firebase-admin');

  if (admin.apps.length > 0) {
    adminApp = admin.apps[0];
    return adminApp;
  }

  // Parse the service account JSON from the environment variable
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

  adminApp = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });

  return adminApp;
}

function getFirestore() {
  const admin = require('firebase-admin');
  getFirebaseAdmin();
  return admin.firestore();
}

function getMessaging() {
  const admin = require('firebase-admin');
  getFirebaseAdmin();
  return admin.messaging();
}

module.exports = { getFirebaseAdmin, getFirestore, getMessaging };