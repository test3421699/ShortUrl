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
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify Auth token
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  let userId;
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    userId = decodedToken.uid;
  } catch (e) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }

  const { longUrl, shortId } = req.body;
  if (!longUrl || !shortId) {
    return res.status(400).json({ error: 'Missing longUrl or shortId' });
  }

  const idRegex = /^[a-zA-Z0-9_-]+$/;
  if (!idRegex.test(shortId)) {
    return res.status(400).json({ error: 'Invalid short ID format' });
  }

  try {
    const ref = db.ref('urls/' + shortId);
    const snapshot = await ref.once('value');
    if (snapshot.exists()) {
      return res.status(400).json({ error: 'This custom link is already taken' });
    }

    await ref.set({
      longUrl,
      userId,
      createdAt: Date.now()
    });

    return res.status(200).json({ shortId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
