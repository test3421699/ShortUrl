import { adminAuth, adminDb } from "./firebase-admin.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
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
    
    const idToken = authHeader.substring(7);
    
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    
    const userId = decodedToken.uid;
    
    const { shortId } = req.body || {};
    
    if (!shortId) {
      return res.status(400).json({
        error: "shortId is required."
      });
    }
    
    const idRegex = /^[a-zA-Z0-9_-]+$/;
    
    if (!idRegex.test(shortId)) {
      return res.status(400).json({
        error: "Invalid short ID."
      });
    }
    
    const urlRef = adminDb.ref(`urls/${shortId}`);
    
    const snapshot = await urlRef.get();
    
    if (!snapshot.exists()) {
      return res.status(404).json({
        error: "Short link not found."
      });
    }
    
    const data = snapshot.val();
    
    /*
     * IMPORTANT:
     * Only the person who created the link
     * can reset its click count.
     */
    if (data.userId !== userId) {
      return res.status(403).json({
        error: "You do not own this link."
      });
    }
    
    await urlRef.child("clicks").set(0);
    
    return res.status(200).json({
      success: true,
      shortId,
      clicks: 0
    });
    
  } catch (error) {
    console.error("Reset clicks error:", error);
    
    if (
      error.code === "auth/id-token-expired" ||
      error.code === "auth/argument-error" ||
      error.code === "auth/invalid-id-token"
    ) {
      return res.status(401).json({
        error: "Your login session has expired."
      });
    }
    
    return res.status(500).json({
      error: "Failed to reset click count."
    });
  }
}