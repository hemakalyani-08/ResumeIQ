import { db } from "../config/firebase-admin.js";
import { generateResumeAnalysis, generateSegmentImprovement, generateJobMatchInsights, generateChatbotResponse, generateMockInterviewAnalysis, generateJobRecommendations, generateSkillQuiz, generateQuizPerformanceReport } from "../services/geminiService.js";
import { calculateAtsScore } from "../services/atsScoringService.js";
import { validateGithubUrl, extractUsername, fetchGithubProfile, auditGithubProfile } from "../services/githubService.js";
import { auditLinkedinProfile } from "../services/linkedinService.js";

export const requestAnalysis = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    const userId = req.user.uid;

    if (!resumeId) {
      return res.status(400).json({ error: "resumeId is required in request body." });
    }

    // Verify resume document exists and belongs to the user
    let fileName = "resume.pdf";
    let resumeText = "";
    if (db) {
      const resumeDoc = await db.collection("resumes").doc(resumeId).get();
      if (!resumeDoc.exists) {
        return res.status(404).json({ error: "Associated resume record not found." });
      }
      if (resumeDoc.data().userId !== userId) {
        return res.status(403).json({ error: "Access denied. Associated resume belongs to a different account." });
      }
      const resumeData = resumeDoc.data();
      fileName = resumeData.fileName;
      resumeText = resumeData.parsedText || "";
    } else {
      resumeText = "Software Engineer Resume\nSkills: React.js, Tailwind CSS, JavaScript\nEducation: BS Computer Science\nExperience: Frontend Developer for 3 years.";
    }

    // Call Gemini AI analysis service
    const aiReport = await generateResumeAnalysis(resumeText, jobDescription);

    const analysisReport = {
      ...aiReport,
      userId,
      resumeId,
      fileName,
      createdAt: new Date().toISOString()
    };

    // Save report to database if connected, else mock document ID
    if (db) {
      const analysisRef = await db.collection("analyses").add(analysisReport);
      analysisReport.analysisId = analysisRef.id;
    } else {
      analysisReport.analysisId = "mock-analysis-" + Date.now();
    }

    return res.status(201).json(analysisReport);
  } catch (error) {
    console.error("Request analysis controller error:", error.message);
    return res.status(500).json({ error: "Failed to perform resume analysis." });
  }
};

export const getAnalysisHistory = async (req, res) => {
  try {
    const userId = req.user.uid;

    if (!db) {
      return res.status(200).json([]);
    }

    let snapshot;
    try {
      snapshot = await db.collection("analyses")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();
    } catch (e) {
      console.warn("Falling back to in-memory sorting due to index query error:", e.message);
      try {
        snapshot = await db.collection("analyses")
          .where("userId", "==", userId)
          .get();
      } catch (innerError) {
        console.error("Firestore retrieval failed completely:", innerError.message);
        return res.status(200).json([]);
      }
    }

    const history = [];
    if (snapshot && typeof snapshot.forEach === "function") {
      snapshot.forEach(doc => {
        history.push({ analysisId: doc.id, ...doc.data() });
      });
    }

    history.sort((a, b) => {
      const dateA = a.createdAt || "";
      const dateB = b.createdAt || "";
      return dateB.localeCompare(dateA);
    });

    return res.status(200).json(history);
  } catch (error) {
    console.error("Analysis history controller error:", error.message);
    return res.status(200).json([]);
  }
};
export const deleteAnalysis = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.uid;

    if (!db) {
      return res.status(200).json({ success: true, message: "Analysis deleted (mock)." });
    }

    const analysisRef = db.collection("analyses").doc(id);
    const doc = await analysisRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "Analysis document not found." });
    }

    if (doc.data().userId !== userId) {
      return res.status(403).json({ error: "Permission denied." });
    }

    await analysisRef.delete();
    return res.status(200).json({ success: true, message: "Analysis record deleted successfully." });
  } catch (error) {
    console.error("Delete analysis controller error:", error.message);
    return res.status(500).json({ error: "Failed to delete analysis record." });
  }
};

export const runAtsScoreCalculation = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    const userId = req.user.uid;

    if (!resumeId) {
      return res.status(400).json({ error: "resumeId is required in request body." });
    }

    let extractedData = null;
    let rawText = "";
    if (db) {
      const resumeDoc = await db.collection("resumes").doc(resumeId).get();
      if (!resumeDoc.exists) {
        return res.status(404).json({ error: "Associated resume record not found." });
      }
      if (resumeDoc.data().userId !== userId) {
        return res.status(403).json({ error: "Access denied." });
      }
      extractedData = resumeDoc.data().extractedData;
      rawText = resumeDoc.data().parsedText || "";
    } else {
      extractedData = {
        skills: ["React.js", "JavaScript", "HTML", "CSS"],
        experience: ["Worked on dashboard modules"],
        education: ["BS in Computer Science"]
      };
      rawText = "Software Engineer Resume\nSkills: React.js, Tailwind CSS, JavaScript\nEducation: BS Computer Science\nExperience: Frontend Developer for 3 years.";
    }

    const scoreData = calculateAtsScore(extractedData, jobDescription, rawText);

    // Save score results in database if connected
    const docData = {
      ...scoreData,
      userId,
      resumeId,
      createdAt: new Date().toISOString()
    };

    if (db) {
      const ref = await db.collection("ats_scores").add(docData);
      docData.scoreId = ref.id;
    } else {
      docData.scoreId = "mock-score-" + Date.now();
    }

    const output = {
      atsScore: scoreData.atsScore,
      matchingSkills: scoreData.matchingSkills,
      missingSkills: scoreData.missingSkills,
      keywordSuggestions: scoreData.keywordSuggestions,
      improvementAreas: scoreData.improvementAreas,
      
      "ATS Score": `${scoreData.atsScore}%`,
      "Matching Skills": scoreData.matchingSkills,
      "Missing Skills": scoreData.missingSkills,
      "Keyword Suggestions": scoreData.keywordSuggestions,
      "Improvement Areas": scoreData.improvementAreas,
      scoreId: docData.scoreId
    };

    return res.status(200).json(output);
  } catch (error) {
    console.error("Run ATS score controller error:", error.message);
    return res.status(500).json({ error: "Failed to calculate ATS score." });
  }
};

export const improveSegment = async (req, res) => {
  try {
    const { text, type, instruction } = req.body;
    const userId = req.user.uid;

    if (!text) {
      return res.status(400).json({ error: "text parameter is required in request body." });
    }

    const improvement = await generateSegmentImprovement(text, type || "general", instruction || "");

    const improvementRecord = {
      ...improvement,
      userId,
      type: type || "general",
      instruction: instruction || "general-optimization",
      createdAt: new Date().toISOString()
    };

    if (db) {
      const ref = await db.collection("improvements").add(improvementRecord);
      improvementRecord.improvementId = ref.id;
    } else {
      improvementRecord.improvementId = "mock-imp-" + Date.now();
    }

    return res.status(200).json(improvementRecord);
  } catch (error) {
    console.error("Segment improvement controller error:", error.message);
    return res.status(500).json({ error: "Failed to optimize text segment." });
  }
};

export const runJobMatchAnalysis = async (req, res) => {
  try {
    const { resumeId, jobDescription } = req.body;
    const userId = req.user.uid;

    if (!resumeId || !jobDescription) {
      return res.status(400).json({ error: "resumeId and jobDescription are required parameters." });
    }

    let extractedData = null;
    let rawText = "";
    let fileName = "resume.pdf";

    if (db) {
      const resumeDoc = await db.collection("resumes").doc(resumeId).get();
      if (!resumeDoc.exists) {
        return res.status(404).json({ error: "Associated resume record not found." });
      }
      if (resumeDoc.data().userId !== userId) {
        return res.status(403).json({ error: "Access denied." });
      }
      const resumeData = resumeDoc.data();
      extractedData = resumeData.extractedData || { skills: [], experience: [], education: [] };
      rawText = resumeData.parsedText || "";
      fileName = resumeData.fileName;
    } else {
      extractedData = {
        skills: ["React.js", "JavaScript", "HTML", "CSS"],
        experience: ["Worked on dashboard modules"],
        education: ["BS in Computer Science"]
      };
      rawText = "Software Engineer Resume\nSkills: React.js, Tailwind CSS, JavaScript\nEducation: BS Computer Science\nExperience: Frontend Developer for 3 years.";
    }

    // 1. Calculate deterministic ATS Score using local scoring service
    const atsScoreData = calculateAtsScore(extractedData, jobDescription, rawText);

    // 2. Fetch qualitative AI insights using Gemini
    const insights = await generateJobMatchInsights(rawText, jobDescription);

    // 3. Combine details
    const matchReport = {
      userId,
      resumeId,
      fileName,
      jobDescription,
      atsScore: atsScoreData.atsScore,
      matchingSkills: atsScoreData.matchingSkills,
      missingSkills: atsScoreData.missingSkills,
      keywordSuggestions: atsScoreData.keywordSuggestions,
      ...insights,
      createdAt: new Date().toISOString()
    };

    // 4. Save analysis record to firestore
    if (db) {
      const ref = await db.collection("job_matches").add(matchReport);
      matchReport.matchId = ref.id;
    } else {
      matchReport.matchId = "mock-match-" + Date.now();
    }

    return res.status(200).json(matchReport);
  } catch (error) {
    console.error("Run job match analysis controller error:", error.message);
    return res.status(500).json({ error: "Failed to perform job match analysis." });
  }
};

export const getJobMatchesHistory = async (req, res) => {
  try {
    const userId = req.user.uid;

    if (!db) {
      return res.status(200).json([]);
    }

    let snapshot;
    try {
      snapshot = await db.collection("job_matches")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();
    } catch (e) {
      console.warn("Falling back to in-memory sorting due to index query error:", e.message);
      snapshot = await db.collection("job_matches")
        .where("userId", "==", userId)
        .get();
    }

    const history = [];
    snapshot.forEach(doc => {
      history.push({ matchId: doc.id, ...doc.data() });
    });

    history.sort((a, b) => {
      const dateA = a.createdAt || "";
      const dateB = b.createdAt || "";
      return dateB.localeCompare(dateA);
    });

    return res.status(200).json(history);
  } catch (error) {
    console.error("Job matches history controller error:", error.message);
    return res.status(500).json({ error: "Failed to retrieve job match history." });
  }
};

export const savePracticeSession = async (req, res) => {
  try {
    const { resumeId, question, category, userAnswer, feedback } = req.body;
    const userId = req.user.uid;

    if (!question || !userAnswer) {
      return res.status(400).json({ error: "question and userAnswer are required parameters." });
    }

    const practiceRecord = {
      userId,
      resumeId: resumeId || "",
      question,
      category: category || "general",
      userAnswer,
      feedback: feedback || "Completed practice attempt.",
      createdAt: new Date().toISOString()
    };

    if (db) {
      const ref = await db.collection("practice_attempts").add(practiceRecord);
      practiceRecord.attemptId = ref.id;
    } else {
      practiceRecord.attemptId = "mock-attempt-" + Date.now();
    }

    return res.status(201).json(practiceRecord);
  } catch (error) {
    console.error("Save practice session controller error:", error.message);
    return res.status(500).json({ error: "Failed to save practice session." });
  }
};

export const getPracticeHistory = async (req, res) => {
  try {
    const userId = req.user.uid;

    if (!db) {
      return res.status(200).json([]);
    }

    let snapshot;
    try {
      snapshot = await db.collection("practice_attempts")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();
    } catch (e) {
      console.warn("Falling back to in-memory sorting due to index query error:", e.message);
      snapshot = await db.collection("practice_attempts")
        .where("userId", "==", userId)
        .get();
    }

    const history = [];
    snapshot.forEach(doc => {
      history.push({ attemptId: doc.id, ...doc.data() });
    });

    history.sort((a, b) => {
      const dateA = a.createdAt || "";
      const dateB = b.createdAt || "";
      return dateB.localeCompare(dateA);
    });

    return res.status(200).json(history);
  } catch (error) {
    console.error("Get practice history controller error:", error.message);
    return res.status(500).json({ error: "Failed to retrieve practice history." });
  }
};

export const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.uid;

    if (!db) {
      return res.status(200).json({
        headline: "Software Engineer",
        notifications: { emailReports: true, roadmapTips: false },
        aiPref: { targetIndustry: "Software Development", speedMode: "standard" }
      });
    }

    const doc = await db.collection("preferences").doc(userId).get();
    if (!doc.exists) {
      return res.status(200).json({
        headline: "Software Engineer",
        notifications: { emailReports: true, roadmapTips: false },
        aiPref: { targetIndustry: "Software Development", speedMode: "standard" }
      });
    }

    return res.status(200).json(doc.data());
  } catch (error) {
    console.error("Get user preferences error:", error.message);
    return res.status(500).json({ error: "Failed to load preferences." });
  }
};

export const saveUserPreferences = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { headline, notifications, aiPref } = req.body;

    if (db) {
      await db.collection("preferences").doc(userId).set({
        headline: headline || "",
        notifications: notifications || {},
        aiPref: aiPref || {},
        updatedAt: new Date().toISOString()
      }, { merge: true });
    }

    return res.status(200).json({ success: true, message: "Preferences updated successfully." });
  } catch (error) {
    console.error("Save user preferences error:", error.message);
    return res.status(500).json({ error: "Failed to save preferences." });
  }
};

export const handleChatbotMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.uid;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "message parameter is required and must be a string." });
    }

    let resumeText = "";
    let chatHistory = [];

    if (db) {
      // 1. Fetch latest parsed resume text context
      const resumeSnapshot = await db.collection("resumes")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (!resumeSnapshot.empty) {
        resumeText = resumeSnapshot.docs[0].data().text || "";
      }

      // 2. Fetch historic chat messages context (chronological limit to 15)
      const chatSnapshot = await db.collection("chatbot_conversations")
        .where("userId", "==", userId)
        .orderBy("createdAt", "asc")
        .limit(15)
        .get();

      chatSnapshot.forEach(doc => {
        chatHistory.push(doc.data());
      });
    }

    // 3. Request AI Career reply from Gemini
    const reply = await generateChatbotResponse(message, resumeText, chatHistory);

    const userMsgRecord = {
      userId,
      sender: "user",
      text: message,
      createdAt: new Date().toISOString()
    };

    const botMsgRecord = {
      userId,
      sender: "bot",
      text: reply,
      createdAt: new Date().toISOString()
    };

    if (db) {
      const userRef = await db.collection("chatbot_conversations").add(userMsgRecord);
      userMsgRecord.msgId = userRef.id;

      const botRef = await db.collection("chatbot_conversations").add(botMsgRecord);
      botMsgRecord.msgId = botRef.id;
    } else {
      userMsgRecord.msgId = "mock-user-msg-" + Date.now();
      botMsgRecord.msgId = "mock-bot-msg-" + (Date.now() + 1);
    }

    return res.status(200).json({ userMessage: userMsgRecord, botResponse: botMsgRecord });
  } catch (error) {
    console.error("Chatbot message controller failed:", error.message);
    return res.status(500).json({ error: "Failed to process chat message." });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const history = [];

    if (db) {
      let snapshot;
      try {
        snapshot = await db.collection("chatbot_conversations")
          .where("userId", "==", userId)
          .orderBy("createdAt", "asc")
          .get();
      } catch (e) {
        console.warn("Chatbot history fallback index sorting:", e.message);
        snapshot = await db.collection("chatbot_conversations")
          .where("userId", "==", userId)
          .get();
      }

      snapshot.forEach(doc => {
        history.push({ msgId: doc.id, ...doc.data() });
      });

      // If we fell back, sort in memory
      if (snapshot.metadata?.fromCache) {
        history.sort((a, b) => (a.createdAt || "").localeCompare(b.createdAt || ""));
      }
    }

    return res.status(200).json(history);
  } catch (error) {
    console.error("Chatbot history fetch failed:", error.message);
    return res.status(500).json({ error: "Failed to retrieve conversation history." });
  }
};

export const clearChatHistory = async (req, res) => {
  try {
    const userId = req.user.uid;

    if (db) {
      const snapshot = await db.collection("chatbot_conversations")
        .where("userId", "==", userId)
        .get();

      const batch = db.batch();
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();
    }

    return res.status(200).json({ success: true, message: "Chatbot history cleared successfully." });
  } catch (error) {
    console.error("Clear chatbot history failed:", error.message);
    return res.status(500).json({ error: "Failed to clear conversation history." });
  }
};

export const evaluateMockInterview = async (req, res) => {
  try {
    const { question, userAnswer, category } = req.body;
    const userId = req.user.uid;

    if (!question || !userAnswer) {
      return res.status(400).json({ error: "question and userAnswer are required parameters." });
    }

    // Call AI to evaluate answer quality and communication
    const evaluation = await generateMockInterviewAnalysis(question, userAnswer, category);

    const record = {
      userId,
      question,
      userAnswer,
      category: category || "general",
      evaluation,
      createdAt: new Date().toISOString()
    };

    if (db) {
      const docRef = await db.collection("mock_interviews").add(record);
      record.interviewId = docRef.id;
    } else {
      record.interviewId = "mock-interview-" + Date.now();
    }

    return res.status(200).json(record);
  } catch (error) {
    console.error("Evaluate mock interview controller error:", error.message);
    return res.status(500).json({ error: "Failed to evaluate interview response." });
  }
};

export const getMockInterviewHistory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const history = [];

    if (db) {
      let snapshot;
      try {
        snapshot = await db.collection("mock_interviews")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .get();
      } catch (e) {
        console.warn("Mock interview history fallback index sorting:", e.message);
        snapshot = await db.collection("mock_interviews")
          .where("userId", "==", userId)
          .get();
      }

      snapshot.forEach(doc => {
        history.push({ interviewId: doc.id, ...doc.data() });
      });

      // Fallback sort
      if (snapshot.metadata?.fromCache) {
        history.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      }
    }

    return res.status(200).json(history);
  } catch (error) {
    console.error("Mock interview history fetch failed:", error.message);
    return res.status(500).json({ error: "Failed to retrieve interview history." });
  }
};

export const runGithubAnalysis = async (req, res) => {
  try {
    const { githubUrl } = req.body;
    const userId = req.user.uid;

    if (!githubUrl) {
      return res.status(400).json({ error: "githubUrl is required in request body." });
    }

    if (!validateGithubUrl(githubUrl)) {
      return res.status(400).json({ error: "Invalid GitHub profile URL format. Correct format is https://github.com/username." });
    }

    const username = extractUsername(githubUrl);
    
    // 1. Fetch repositories and user bio details
    const profileData = await fetchGithubProfile(username);

    // 2. Perform Gemini audit
    const auditReport = await auditGithubProfile(profileData);

    const record = {
      userId,
      githubUrl,
      username,
      profileName: profileData.name,
      followersCount: profileData.followers,
      reposCount: profileData.publicRepos,
      auditReport,
      createdAt: new Date().toISOString()
    };

    if (db) {
      const docRef = await db.collection("github_analyses").add(record);
      record.analysisId = docRef.id;
    } else {
      record.analysisId = "mock-github-analysis-" + Date.now();
    }

    return res.status(200).json(record);
  } catch (error) {
    console.error("GitHub analysis controller error:", error.message);
    return res.status(500).json({ error: "Failed to complete GitHub profile analysis." });
  }
};

export const getGithubAnalysisHistory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const history = [];

    if (db) {
      let snapshot;
      try {
        snapshot = await db.collection("github_analyses")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .get();
      } catch (e) {
        console.warn("GitHub history fallback index sorting:", e.message);
        snapshot = await db.collection("github_analyses")
          .where("userId", "==", userId)
          .get();
      }

      snapshot.forEach(doc => {
        history.push({ analysisId: doc.id, ...doc.data() });
      });

      // Fallback sort
      if (snapshot.metadata?.fromCache) {
        history.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      }
    }

    return res.status(200).json(history);
  } catch (error) {
    console.error("GitHub history fetch failed:", error.message);
    return res.status(500).json({ error: "Failed to retrieve GitHub analysis history." });
  }
};

export const runLinkedinAnalysis = async (req, res) => {
  try {
    const { headline, about, skills, experiences } = req.body;
    const userId = req.user.uid;

    if (!headline && !about && !skills) {
      return res.status(400).json({ error: "At least one profile parameter (headline, about, or skills) is required." });
    }

    const profileData = { headline, about, skills, experiences };

    // Request AI Audit recommendations from LinkedIn coach
    const auditReport = await auditLinkedinProfile(profileData);

    const record = {
      userId,
      headlineSummary: headline ? (headline.length > 50 ? headline.substring(0, 50) + "..." : headline) : "Blank Headline",
      auditReport,
      createdAt: new Date().toISOString()
    };

    if (db) {
      const docRef = await db.collection("linkedin_analyses").add(record);
      record.analysisId = docRef.id;
    } else {
      record.analysisId = "mock-linkedin-analysis-" + Date.now();
    }

    return res.status(200).json(record);
  } catch (error) {
    console.error("LinkedIn analysis controller failed:", error.message);
    return res.status(500).json({ error: "Failed to complete LinkedIn profile analysis." });
  }
};

export const getLinkedinAnalysisHistory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const history = [];

    if (db) {
      let snapshot;
      try {
        snapshot = await db.collection("linkedin_analyses")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .get();
      } catch (e) {
        console.warn("LinkedIn history fallback index sorting:", e.message);
        snapshot = await db.collection("linkedin_analyses")
          .where("userId", "==", userId)
          .get();
      }

      snapshot.forEach(doc => {
        history.push({ analysisId: doc.id, ...doc.data() });
      });

      // Fallback sort
      if (snapshot.metadata?.fromCache) {
        history.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      }
    }

    return res.status(200).json(history);
  } catch (error) {
    console.error("LinkedIn history fetch failed:", error.message);
    return res.status(500).json({ error: "Failed to retrieve LinkedIn analysis history." });
  }
};

export const requestJobRecommendations = async (req, res) => {
  try {
    const { careerInterests } = req.body;
    const userId = req.user.uid;

    let resumeText = "";
    
    if (db) {
      // 1. Fetch latest parsed resume text
      const resumeSnapshot = await db.collection("resumes")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (!resumeSnapshot.empty) {
        resumeText = resumeSnapshot.docs[0].data().text || "";
      }
    }

    // 2. Request AI Recommendations from Gemini
    const recommendations = await generateJobRecommendations(resumeText, careerInterests);

    const record = {
      userId,
      careerInterests: careerInterests || "Open to suggestions",
      recommendations,
      createdAt: new Date().toISOString()
    };

    if (db) {
      const docRef = await db.collection("job_recommendations").add(record);
      record.recommendationId = docRef.id;
    } else {
      record.recommendationId = "mock-recommendation-" + Date.now();
    }

    return res.status(200).json(record);
  } catch (error) {
    console.error("Job recommendations controller failed:", error.message);
    return res.status(500).json({ error: "Failed to compile job recommendations." });
  }
};

export const getJobRecommendationsHistory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const history = [];

    if (db) {
      let snapshot;
      try {
        snapshot = await db.collection("job_recommendations")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .get();
      } catch (e) {
        console.warn("Recommendations history fallback index sorting:", e.message);
        snapshot = await db.collection("job_recommendations")
          .where("userId", "==", userId)
          .get();
      }

      snapshot.forEach(doc => {
        history.push({ recommendationId: doc.id, ...doc.data() });
      });

      // Fallback sort
      if (snapshot.metadata?.fromCache) {
        history.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      }
    }

    return res.status(200).json(history);
  } catch (error) {
    console.error("Job recommendations history fetch failed:", error.message);
    return res.status(500).json({ error: "Failed to retrieve job recommendations history." });
  }
};

export const requestSkillQuiz = async (req, res) => {
  try {
    const { targetRole, difficulty, count } = req.body;
    const userId = req.user.uid;

    let skills = [];
    if (db) {
      // Fetch latest resume to extract parsed skills as context
      const resumeSnapshot = await db.collection("resumes")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (!resumeSnapshot.empty) {
        const resumeData = resumeSnapshot.docs[0].data();
        skills = resumeData.skills || [];
      }
    }

    // Generate quiz questions
    const quizQuestions = await generateSkillQuiz(skills, targetRole || "Software Engineer", difficulty || "Intermediate", count || 5);
    return res.status(200).json({ quizQuestions });
  } catch (error) {
    console.error("Request skill quiz error:", error.message);
    return res.status(500).json({ error: "Failed to compile assessment questions." });
  }
};

export const evaluateSkillAssessment = async (req, res) => {
  try {
    const { quizQuestions, userAnswers, difficulty, targetRole } = req.body;
    const userId = req.user.uid;

    if (!quizQuestions || !userAnswers) {
      return res.status(400).json({ error: "quizQuestions and userAnswers parameters are required." });
    }

    // Calculate score locally
    let correctCount = 0;
    quizQuestions.forEach((q) => {
      const userAnswer = userAnswers[q.id];
      if (userAnswer && userAnswer.trim().toLowerCase() === q.correctAnswer.trim().toLowerCase()) {
        correctCount += 1;
      }
    });

    const scorePercentage = Math.round((correctCount / quizQuestions.length) * 100);

    // Call Gemini to structure recommendations and analyze strengths/weaknesses
    const report = await generateQuizPerformanceReport(quizQuestions, userAnswers, difficulty || "Intermediate", targetRole || "Software Engineer");

    const record = {
      userId,
      targetRole: targetRole || "Software Engineer",
      difficulty: difficulty || "Intermediate",
      score: scorePercentage,
      totalQuestions: quizQuestions.length,
      correctCount,
      evaluation: report,
      userAnswers,
      quizQuestions,
      createdAt: new Date().toISOString()
    };

    if (db) {
      const docRef = await db.collection("skill_assessments").add(record);
      record.assessmentId = docRef.id;
    } else {
      record.assessmentId = "mock-assessment-" + Date.now();
    }

    return res.status(200).json(record);
  } catch (error) {
    console.error("Evaluate skill assessment error:", error.message);
    return res.status(500).json({ error: "Failed to grade assessment answers." });
  }
};

export const getSkillAssessmentHistory = async (req, res) => {
  try {
    const userId = req.user.uid;
    const history = [];

    if (db) {
      let snapshot;
      try {
        snapshot = await db.collection("skill_assessments")
          .where("userId", "==", userId)
          .orderBy("createdAt", "desc")
          .get();
      } catch (e) {
        console.warn("Skill assessments history fallback index sorting:", e.message);
        snapshot = await db.collection("skill_assessments")
          .where("userId", "==", userId)
          .get();
      }

      snapshot.forEach(doc => {
        history.push({ assessmentId: doc.id, ...doc.data() });
      });

      // Fallback sort
      if (snapshot.metadata?.fromCache) {
        history.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
      }
    }

    return res.status(200).json(history);
  } catch (error) {
    console.error("Skill assessments history fetch failed:", error.message);
    return res.status(500).json({ error: "Failed to retrieve skill assessments history." });
  }
};

