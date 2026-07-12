import { initializeApp } from "firebase/app";
import { getDatabase, ref, get, set } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
    const urlRef = ref(db, 'urls/' + shortId);
    const snapshot = await get(urlRef);
    if (snapshot.exists()) {
      return res.status(400).json({ error: 'This custom link is already taken' });
    }

    await set(urlRef, {
      longUrl,
      createdAt: Date.now()
    });

    return res.status(200).json({ shortId });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}  if (!longUrl || !shortId) {
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
