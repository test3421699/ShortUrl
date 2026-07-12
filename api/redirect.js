export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.redirect('/');
  }
  
  const dbUrl = process.env.FIREBASE_DATABASE_URL;
  if (!dbUrl) {
    return res.status(500).send("Database configuration is missing.");
  }
  
  // Remove any trailing slash to avoid malformed URLs
  const formattedDbUrl = dbUrl.replace(/\/$/, "");
  
  try {
    // Request data using Firebase's native, lightweight REST API
    const response = await fetch(`${formattedDbUrl}/urls/${id}.json`);
    if (!response.ok) {
      return res.status(500).send("Failed to query database.");
    }
    
    const data = await response.json();
    
    if (data && data.longUrl) {
      let targetUrl = data.longUrl;
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