import { db } from "../config/firebase-admin.js";

export const getUserProfile = async (req, res) => {
  try {
    const { uid, email, displayName } = req.user;

    // Graceful local development fallback if Firestore is not initialized
    if (!db) {
      return res.status(200).json({
        uid,
        email,
        displayName,
        createdAt: new Date().toISOString()
      });
    }

    const userRef = db.collection("users").doc(uid);
    const doc = await userRef.get();

    if (!doc.exists) {
      const newUser = {
        uid,
        email,
        displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await userRef.set(newUser);
      return res.status(201).json(newUser);
    }

    return res.status(200).json(doc.data());
  } catch (error) {
    console.error("User profile controller error:", error.message);
    return res.status(500).json({ error: "Failed to retrieve user profile." });
  }
};
