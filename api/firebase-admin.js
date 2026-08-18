import admin from "firebase-admin";

function getPrivateKey() {
  const key = process.env.FIREBASE_PRIVATE_KEY;
  
  if (!key) {
    throw new Error("FIREBASE_PRIVATE_KEY is missing.");
  }
  
  return key.replace(/\\n/g, "\n");
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: getPrivateKey()
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

export const adminAuth = admin.auth();
export const adminDb = admin.database();