import express from "express";
import { 
  requestAnalysis, 
  getAnalysisHistory, 
  deleteAnalysis, 
  runAtsScoreCalculation, 
  improveSegment,
  runJobMatchAnalysis,
  getJobMatchesHistory,
  savePracticeSession,
  getPracticeHistory,
  getUserPreferences,
  saveUserPreferences,
  handleChatbotMessage,
  getChatHistory,
  clearChatHistory,
  evaluateMockInterview,
  getMockInterviewHistory,
  runGithubAnalysis,
  getGithubAnalysisHistory,
  runLinkedinAnalysis,
  getLinkedinAnalysisHistory,
  requestJobRecommendations,
  getJobRecommendationsHistory,
  requestSkillQuiz,
  evaluateSkillAssessment,
  getSkillAssessmentHistory
} from "../controllers/analysisController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = express.Router();

// Trigger a new AI analysis report for a resume
router.post("/", requireAuth, requestAnalysis);

// Calculate direct ATS Score match report
router.post("/score", requireAuth, runAtsScoreCalculation);

// Optimize resume text segment using Gemini
router.post("/improve", requireAuth, improveSegment);

// Compare user's resume with a target job description
router.post("/job-match", requireAuth, runJobMatchAnalysis);

// Save user practice question attempt
router.post("/practice", requireAuth, savePracticeSession);

// Fetch historic practice attempts of user
router.get("/practice", requireAuth, getPracticeHistory);

// Chatbot routes
router.post("/chatbot", requireAuth, handleChatbotMessage);
router.get("/chatbot", requireAuth, getChatHistory);
router.delete("/chatbot", requireAuth, clearChatHistory);

// Mock Interview simulation routes
router.post("/mock-interview", requireAuth, evaluateMockInterview);
router.get("/mock-interview", requireAuth, getMockInterviewHistory);

// GitHub Profile Analysis routes
router.post("/github", requireAuth, runGithubAnalysis);
router.get("/github", requireAuth, getGithubAnalysisHistory);

// LinkedIn Profile Analysis routes
router.post("/linkedin", requireAuth, runLinkedinAnalysis);
router.get("/linkedin", requireAuth, getLinkedinAnalysisHistory);

// Job Recommendations routes
router.post("/job-recommendations", requireAuth, requestJobRecommendations);
router.get("/job-recommendations", requireAuth, getJobRecommendationsHistory);

// Skill Assessment routes
router.post("/skill-assessment/generate", requireAuth, requestSkillQuiz);
router.post("/skill-assessment/evaluate", requireAuth, evaluateSkillAssessment);
router.get("/skill-assessment/history", requireAuth, getSkillAssessmentHistory);

// Fetch historic job match reports of user
router.get("/job-matches", requireAuth, getJobMatchesHistory);

// Fetch user profile and preferences settings
router.get("/preferences", requireAuth, getUserPreferences);

// Save user profile and preferences settings
router.post("/preferences", requireAuth, saveUserPreferences);

// Fetch historic analysis reports of user
router.get("/history", requireAuth, getAnalysisHistory);

// Delete an analysis record
router.delete("/:id", requireAuth, deleteAnalysis);

export default router;
