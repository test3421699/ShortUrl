import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.database();

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  // Ensure ID only contains alphanumeric characters, dashes, and underscores
  const idRegex = /^[a-zA-Z0-9_-]+$/;
  if (!idRegex.test(id)) {
    return res.status(200).json({ available: false, error: 'Only letters, numbers, -, and _ allowed.' });
  }

  try {
    const snapshot = await db.ref('urls/' + id).once('value');
    return res.status(200).json({ available: !snapshot.exists() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
