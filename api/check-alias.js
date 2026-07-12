export default async function handler(req, res) {
  const { id } = req.query;
  if (!id) {
    return res.status(400).json({ error: 'ID is required' });
  }
  
  const idRegex = /^[a-zA-Z0-9_-]+$/;
  if (!idRegex.test(id)) {
    return res.status(200).json({ available: false, error: 'Only letters, numbers, -, and _ allowed.' });
  }
  
  const dbUrl = process.env.FIREBASE_DATABASE_URL;
  if (!dbUrl) {
    return res.status(500).json({ error: "Database configuration is missing." });
  }
  
  const formattedDbUrl = dbUrl.replace(/\/$/, "");
  
  try {
    const response = await fetch(`${formattedDbUrl}/urls/${id}.json`);
    if (!response.ok) {
      return res.status(500).json({ error: "Failed to connect to database" });
    }
    
    const data = await response.json();
    // If the REST API returns null, the alias is unused and available
    return res.status(200).json({ available: data === null });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}