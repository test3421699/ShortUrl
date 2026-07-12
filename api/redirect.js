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
    return res.redirect('/');
  }

  try {
    const snapshot = await get(ref(db, 'urls/' + id));
    if (snapshot.exists()) {
      let targetUrl = snapshot.val().longUrl;
      if (!/^https?:\/\//i.test(targetUrl)) {
        targetUrl = 'http://' + targetUrl;
      }
      return res.redirect(301, targetUrl);
    } else {
      return res.status(404).send('Short URL not found');
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}}
