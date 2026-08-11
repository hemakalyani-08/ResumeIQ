import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

let db = null;
let auth = null;

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY;

if (projectId && clientEmail && privateKey) {
  try {
    const formattedPrivateKey = privateKey.replace(/\\n/g, "\n");
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey: formattedPrivateKey
      })
    });
    db = admin.firestore();
    auth = admin.auth();
    console.log("🚀 Firebase Admin SDK initialized successfully.");
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error.message);
  }
} else {
  console.warn("⚠️  Firebase Admin environment variables are missing or incomplete. Firestore and real authentication checks will run in mockup/simulation mode.");
}

export { admin, db, auth };
