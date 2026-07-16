const admin = require("firebase-admin");

const requiredEnvVars = [
  "FIREBASE_PROJECT_ID",
  "FIREBASE_CLIENT_EMAIL",
  "FIREBASE_PRIVATE_KEY",
];

const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Falta la variable de entorno requerida: ${name}`);
  }

  return value;
};

const normalizePrivateKey = (privateKey) =>
  privateKey
    .replace(/^"|"$/g, "")
    .replace(/\\n/g, "\n");

const getCredential = () => {
  const missingEnvVars = requiredEnvVars.filter(
    (name) => !process.env[name] || !process.env[name].trim()
  );

  if (missingEnvVars.length) {
    throw new Error(
      `Configura Firebase mediante variables de entorno. Faltan: ${missingEnvVars.join(
        ", "
      )}`
    );
  }

  return admin.credential.cert({
    projectId: getRequiredEnv("FIREBASE_PROJECT_ID"),
    clientEmail: getRequiredEnv("FIREBASE_CLIENT_EMAIL"),
    privateKey: normalizePrivateKey(getRequiredEnv("FIREBASE_PRIVATE_KEY")),
  });
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
