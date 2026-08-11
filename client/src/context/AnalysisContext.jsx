import React, { createContext, useContext, useState, useEffect } from "react";
import { auth, onAuthStateChanged } from "../services/firebase";
import { api } from "../services/api";
import LogoIcon from "../components/common/LogoIcon";

const AnalysisContext = createContext();

export function useAnalysis() {
  return useContext(AnalysisContext);
}

export function AnalysisProvider({ children }) {
  const [analyses, setAnalyses] = useState([]);
  const [currentAnalysis, setCurrentAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [progressText, setProgressText] = useState("");
  const [loading, setLoading] = useState(true);

  // Automatically load analysis history when user signs in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        try {
          const history = await api.get("/api/analyses/history");
          setAnalyses(history);
          if (history.length > 0) {
            setCurrentAnalysis(history[0]);
          } else {
            setCurrentAnalysis(null);
          }
        } catch (error) {
          console.error("Failed to load historical analyses:", error.message);
        } finally {
          setLoading(false);
        }
      } else {
        setAnalyses([]);
        setCurrentAnalysis(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // Function to upload resume, parse, and request analysis report
  const analyzeResume = async (file, jobDescription) => {
    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setProgressText("Uploading PDF resume to server...");

    try {
      // 1. Upload file to backend
      const resume = await api.upload("/api/resumes/upload", file);
      
      setAnalysisProgress(50);
      setProgressText("PDF text extracted. Generating ATS evaluation...");

      // 2. Request analysis based on uploaded resume ID and optional JD
      const report = await api.post("/api/analyses", {
        resumeId: resume.resumeId,
        jobDescription
      });

      setAnalysisProgress(100);
      setProgressText("Analysis completed!");

      // Update local state history
      setAnalyses(prev => [report, ...prev]);
      setCurrentAnalysis(report);
      setIsAnalyzing(false);
      return report;
    } catch (error) {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
      setProgressText("");
      console.error("Analysis request failed:", error.message);
      throw error;
    }
  };

  const deleteAnalysis = async (id) => {
    try {
      await api.delete(`/api/analyses/${id}`);
      setAnalyses(prev => prev.filter(a => a.analysisId !== id));
      if (currentAnalysis?.analysisId === id) {
        const remaining = analyses.filter(a => a.analysisId !== id);
        setCurrentAnalysis(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (error) {
      console.error("Failed to delete analysis:", error.message);
    }
  };

  const clearHistory = async () => {
    try {
      // Clear records on client. In a complete production setup, we could call a batch delete API.
      // For now, delete each one in sequence or clear local cache.
      for (const a of analyses) {
        await api.delete(`/api/analyses/${a.analysisId}`).catch(err => console.error(err));
      }
      setAnalyses([]);
      setCurrentAnalysis(null);
    } catch (error) {
      console.error("Failed to clear history:", error.message);
    }
  };

  const value = {
    analyses,
    currentAnalysis,
    setCurrentAnalysis,
    isAnalyzing,
    analysisProgress,
    progressText,
    loading,
    analyzeResume,
    deleteAnalysis,
    clearHistory
  };
    return (
    <AnalysisContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-brand-500/10"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-l-4 border-brand-400 animate-spin"></div>
            <LogoIcon className="w-6 h-6 text-brand-400" />
          </div>
          <div className="text-xl font-semibold text-gradient animate-pulse-subtle">
            ResumeIQ
          </div>
          <div className="text-xs text-dark-500 mt-1 tracking-wider">
            LOADING YOUR ANALYSIS
          </div>
        </div>
      ) : (
        children
      )}
    </AnalysisContext.Provider>
  );
}

