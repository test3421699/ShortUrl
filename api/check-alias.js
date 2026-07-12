import { initializeApp } from "firebase/app";
import { getDatabase, ref, get } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }

  const idRegex = /^[a-zA-Z0-9_-]+$/;
  if (!idRegex.test(id)) {
    return res.status(200).json({ available: false, error: 'Only letters, numbers, -, and _ allowed.' });
  }

  try {
    const snapshot = await get(ref(db, 'urls/' + id));
    return res.status(200).json({ available: !snapshot.exists() });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
