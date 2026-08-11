import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Routes imports
import userRoutes from "./routes/userRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static compiled frontend files from client build
const buildPath = path.join(__dirname, "../client/dist");
app.use(express.static(buildPath));

// Health Check
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "healthy", timestamp: new Date().toISOString() });
});

// API Routes
app.use("/api/users", userRoutes);
app.use("/api/resumes", resumeRoutes);
app.use("/api/analyses", analysisRoutes);

// Fallback to React index.html for UI client-side route paths
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api")) {
    return next();
  }
  res.sendFile(path.join(buildPath, "index.html"), (err) => {
    if (err) {
      next();
    }
  });
});

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: "API route not found." });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err);

  // Handle Multer specific errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large. Maximum allowed size is 5MB." });
  }

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || "An unexpected server error occurred."
  });
});

export default app;
