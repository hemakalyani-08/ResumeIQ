import { db } from "../config/firebase-admin.js";
import { extractTextFromPdf } from "../services/pdfService.js";
import { parseResumeText } from "../services/resumeParserService.js";

export const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded. Please upload a PDF resume." });
    }

    // Extract text content using pdf-parse service
    const textContent = await extractTextFromPdf(req.file.buffer);

    // Extract structured data from text
    const extractedData = parseResumeText(textContent);

    const resumeMetadata = {
      userId: req.user.uid,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      parsedText: textContent,
      extractedData: extractedData,
      createdAt: new Date().toISOString()
    };

    // Save to firestore if database is connected, else mock document ID
    if (db) {
      const resumeRef = await db.collection("resumes").add(resumeMetadata);
      resumeMetadata.resumeId = resumeRef.id;
    } else {
      resumeMetadata.resumeId = "mock-resume-" + Date.now();
    }

    return res.status(201).json(resumeMetadata);
  } catch (error) {
    console.error("Upload controller error:", error.message);
    return res.status(500).json({ error: error.message || "Failed to process and store resume." });
  }
};

export const getResumeHistory = async (req, res) => {
  try {
    const userId = req.user.uid;

    if (!db) {
      return res.status(200).json([]);
    }

    const snapshot = await db.collection("resumes")
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get();

    const history = [];
    snapshot.forEach(doc => {
      history.push({ resumeId: doc.id, ...doc.data() });
    });

    return res.status(200).json(history);
  } catch (error) {
    console.error("Resume history controller error:", error.message);
    return res.status(500).json({ error: "Failed to retrieve resume history." });
  }
};

export const deleteResume = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    if (!db) {
      return res.status(200).json({ success: true, message: "Resume deleted (local demo)." });
    }

    const resumeRef = db.collection("resumes").doc(id);
    const doc = await resumeRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Resume document not found." });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).json({ error: "Permission denied." });
    }

    await resumeRef.delete();
    return res.status(200).json({ success: true, message: "Resume deleted successfully." });
  } catch (error) {
    console.error("Delete resume controller error:", error.message);
    return res.status(500).json({ error: "Failed to delete resume record." });
  }
};
