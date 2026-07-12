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
    return res.redirect('/');
  }

  try {
    const snapshot = await db.ref('urls/' + id).once('value');
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
}
