import { adminAuth, adminDb } from "./firebase-admin.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({
      error: "Method not allowed."
    });
  }
  
  try {
    const authHeader = req.headers.authorization || "";
    
    if (!authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        error: "Authentication required."
      });
    }
    
    const idToken = authHeader.substring(7).trim();
    
    if (!idToken) {
      return res.status(401).json({
        error: "Missing Firebase ID token."
      });
    }
    
    // Verify the currently logged-in Firebase user
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const userId = decodedToken.uid;
    
    // Read all URLs
    const snapshot = await adminDb.ref("urls").get();
    
    const data = snapshot.val();
    
    if (!data || typeof data !== "object") {
      return res.status(200).json({
        success: true,
        links: []
      });
    }
    
    const links = [];
    
    for (const [shortId, link] of Object.entries(data)) {
      // Ignore invalid database entries
      if (!link || typeof link !== "object") {
        continue;
      }
      
      // Only return links belonging to this user
      if (link.userId !== userId) {
        continue;
      }
      
      links.push({
        shortId,
        longUrl: link.longUrl || "",
        userId: link.userId,
        createdAt: Number(link.createdAt) || 0,
        clicks: Number(link.clicks) || 0
      });
    }
    
    links.sort((a, b) => b.createdAt - a.createdAt);
    
    return res.status(200).json({
      success: true,
      links
    });
    
  } catch (error) {
    console.error("MY_LINKS_ERROR:", error);
    
    return res.status(500).json({
      error: "Failed to load your links.",
      debug: error.message,
      code: error.code || null
    });
  }
}