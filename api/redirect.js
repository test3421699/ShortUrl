import { adminDb } from "./firebase-admin.js";

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.redirect("/");
  }
  
  const idRegex = /^[a-zA-Z0-9_-]+$/;
  
  if (!idRegex.test(id)) {
    return res.status(400).send("Invalid short URL.");
  }
  
  try {
    const urlRef = adminDb.ref(`urls/${id}`);
    
    const snapshot = await urlRef.get();
    
    if (!snapshot.exists()) {
      return res.status(404).send("Short URL not found.");
    }
    
    const data = snapshot.val();
    
    if (!data || !data.longUrl) {
      return res.status(404).send("Short URL not found.");
    }
    
    /*
     * Atomically increment the click count.
     *
     * Firebase transactions make sure simultaneous clicks
     * don't overwrite each other.
     */
    const clicksRef = urlRef.child("clicks");
    
    await clicksRef.transaction((currentClicks) => {
      const current = Number(currentClicks);
      
      if (!Number.isFinite(current) || current < 0) {
        return 1;
      }
      
      return current + 1;
    });
    
    let targetUrl = data.longUrl;
    
    if (!/^https?:\/\//i.test(targetUrl)) {
      targetUrl = "https://" + targetUrl;
    }
    
    return res.redirect(302, targetUrl);
    
  } catch (error) {
    console.error("Redirect error:", error);
    
    return res.status(500).send(
      "Unable to process this short link."
    );
  }
}