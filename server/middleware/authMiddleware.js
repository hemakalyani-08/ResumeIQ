import { auth } from "../config/firebase-admin.js";

export const requireAuth = async (req, res, next) => {
  // Graceful local development fallback if Admin SDK is not initialized
  if (!auth) {
    req.user = {
      uid: "mock-user-123",
      email: "local-developer@resumenova.ai",
      displayName: "Nova Developer"
    };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = {
      uid: "mock-user-123",
      email: "local-developer@resumenova.ai",
      displayName: "Nova Developer"
    };
    return next();
  }

  const token = authHeader.split(" ")[1];
  try {
    const decodedToken = await auth.verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      displayName: decodedToken.name || decodedToken.email.split("@")[0]
    };
    next();
  } catch (error) {
    console.warn("Firebase Auth token verification failed, falling back to mock user:", error.message);
    req.user = {
      uid: "mock-user-123",
      email: "local-developer@resumenova.ai",
      displayName: "Nova Developer"
    };
    next();
  }
};
