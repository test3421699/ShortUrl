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

    const idToken = authHeader.substring(7);

    const decodedToken = await adminAuth.verifyIdToken(idToken);

    const userId = decodedToken.uid;

    const snapshot = await adminDb
      .ref("urls")
      .orderByChild("userId")
      .equalTo(userId)
      .get();

    const data = snapshot.val() || {};

    const links = Object.entries(data).map(([shortId, link]) => ({
      shortId,
      longUrl: link.longUrl || "",
      userId: link.userId,
      createdAt: link.createdAt || 0,
      clicks: Number(link.clicks) || 0
    }));

    links.sort((a, b) => b.createdAt - a.createdAt);

    return res.status(200).json({
      success: true,
      links
    });

  } catch (error) {
    console.error("My links error:", error);

    return res.status(500).json({
      error: "Failed to load your links."
    });
  }
}