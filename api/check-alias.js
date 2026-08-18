import { adminDb } from "./firebase-admin.js";

export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({
      error: "ID is required."
    });
  }
  
  const idRegex = /^[a-zA-Z0-9_-]+$/;
  
  if (!idRegex.test(id)) {
    return res.status(200).json({
      available: false,
      error: "Only letters, numbers, - and _ are allowed."
    });
  }
  
  try {
    const snapshot = await adminDb
      .ref(`urls/${id}`)
      .get();
    
    return res.status(200).json({
      available: !snapshot.exists()
    });
    
  } catch (error) {
    console.error("Alias check error:", error);
    
    return res.status(500).json({
      error: "Failed to check alias."
    });
  }
}