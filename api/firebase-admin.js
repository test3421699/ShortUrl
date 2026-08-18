import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKeyRaw = process.env.FIREBASE_PRIVATE_KEY;
const databaseURL = process.env.FIREBASE_DATABASE_URL;

if (!projectId) {
  throw new Error("FIREBASE_PROJECT_ID is missing");
}

if (!clientEmail) {
  throw new Error("FIREBASE_CLIENT_EMAIL is missing");
}

if (!privateKeyRaw) {
  throw new Error("FIREBASE_PRIVATE_KEY is missing");
}

if (!databaseURL) {
  throw new Error("FIREBASE_DATABASE_URL is missing");
}

const privateKey = privateKeyRaw
  .replace(/\\n/g, "\n")
  .replace(/\r\n/g, "\n")
  .trim();

if (!privateKey.includes("BEGIN PRIVATE KEY")) {
  throw new Error(
    "FIREBASE_PRIVATE_KEY does not contain a valid private key"
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId,
      clientEmail,
      privateKey
    }),
    databaseURL
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.database();