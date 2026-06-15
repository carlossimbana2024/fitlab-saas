const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const localServiceAccountPath = path.resolve(
  __dirname,
  "../../firebase-service-account.json"
);

const getCredential = () => {
  if (
    process.env.FIREBASE_PROJECT_ID &&
    process.env.FIREBASE_CLIENT_EMAIL &&
    process.env.FIREBASE_PRIVATE_KEY
  ) {
    return admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    });
  }

  if (fs.existsSync(localServiceAccountPath)) {
    const serviceAccount = require(localServiceAccountPath);
    return admin.credential.cert(serviceAccount);
  }

  throw new Error(
    "Configura Firebase por variables de entorno o agrega firebase-service-account.json"
  );
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: getCredential(),
  });
}

const db = admin.firestore();
const auth = admin.auth();

module.exports = {
  admin,
  db,
  auth,
};
