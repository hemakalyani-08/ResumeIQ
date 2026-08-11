import express from "express";
import { uploadResume, getResumeHistory, deleteResume } from "../controllers/resumeController.js";
import { requireAuth } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Upload a resume PDF (requires auth + file upload parsed by multer)
router.post("/upload", requireAuth, upload, uploadResume);

// Fetch upload history log of user
router.get("/history", requireAuth, getResumeHistory);

// Delete historical resume
router.delete("/:id", requireAuth, deleteResume);

export default router;
