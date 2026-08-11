import express from "express";
import { getUserProfile } from "../controllers/userController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get profile details or create if not exists
router.get("/profile", requireAuth, getUserProfile);

export default router;
