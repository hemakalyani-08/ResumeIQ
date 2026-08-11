import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { useAnalysis } from "../context/AnalysisContext";
import { 
  FiTarget, 
  FiCheck, 
  FiX, 
  FiAlertTriangle, 
  FiBookOpen, 
  FiTrendingUp, 
  FiInfo, 
  FiArrowRight, 
  FiRotateCw,
  FiBriefcase,
  FiFileText,
  FiClock
} from "react-icons/fi";

export default function JobMatch() {
  const { currentAnalysis } = useAnalysis();
  
  const [resumes, setResumes] = useState([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [matchReport, setMatchReport] = useState(null);
  const [history, setHistory] = useState([]);

  // Fetch resumes and previous job match histories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resumesData = await api.get("/api/resumes");
        setResumes(resumesData);
        if (resumesData.length > 0) {
          // Default to latest resume or active analysis
          if (currentAnalysis) {
            setSelectedResumeId(currentAnalysis.resumeId);
          } else {
            setSelectedResumeId(resumesData[0].resumeId);
          }
        }

        const matchHistory = await api.get("/api/analyses/job-matches");
        setHistory(matchHistory);
        if (matchHistory.length > 0 && !matchReport) {
          // Pre-populate with latest run
          setMatchReport(matchHistory[0]);
        }
      } catch (err) {
        console.error("Failed to load job match dependencies:", err.message);
      }
    };

    fetchData();
  }, [currentAnalysis]);

  // Run Job Match Analysis
  const handleCalculateMatch = async (e) => {
    e.preventDefault();
    if (!selectedResumeId) {
      setError("Please select a resume to analyze.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Please enter a target job description.");
      return;
    }

    setLoading(true);
    setError("");
    setMatchReport(null);

    try {
      const report = await api.post("/api/analyses/job-match", {
        resumeId: selectedResumeId,
        jobDescription
      });

      setMatchReport(report);
      // Prepend to history list
      setHistory(prev => [report, ...prev]);
    } catch (err) {
      setError(err.message || "Failed to analyze job description match.");
    } finally {
      setLoading(false);
    }
  };

  // Select historical record
  const handleSelectHistory = (report) => {
    setMatchReport(report);
    setSelectedResumeId(report.resumeId);
    setJobDescription(report.jobDescription);
    setError("");
  };

  // Reset to form input mode
  const handleReset = () => {
    setMatchReport(null);
    setJobDescription("");
    setError("");
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">Job Match Analyzer</h2>
        <p className="text-sm text-dark-400 mt-1">Audit how well your parsed profile aligns with a specific target job role.</p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-red-400 text-sm">
          <FiAlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Analysis workspace & results (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          {!matchReport ? (
            /* Input Mode */
            <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-6 shadow-sm">
              <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
                <FiTarget className="text-brand-450" />
                Target Comparison Parameters
              </h3>

              <form onSubmit={handleCalculateMatch} className="space-y-5">
                {/* Resume Selector */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-dark-450 uppercase tracking-wider block">1. Select Scanned Resume</label>
                  {resumes.length === 0 ? (
                    <div className="p-4 rounded-xl border border-dashed border-dark-800 text-center space-y-3">
                      <p className="text-xs text-dark-500 font-medium">No resumes scanned yet. Please upload a PDF file first.</p>
                      <Link to="/upload" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold transition-all">
                        Upload PDF
                      </Link>
                    </div>
                  ) : (
                    <select
                      value={selectedResumeId}
                      onChange={(e) => setSelectedResumeId(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-dark-800 bg-dark-900/60 text-dark-100 focus:outline-none focus:border-brand-500 text-xs"
                    >
                      {resumes.map((res) => (
                        <option key={res.resumeId} value={res.resumeId}>
                          {res.fileName} ({new Date(res.uploadedAt).toLocaleDateString()})
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Job Description Textarea */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-dark-450 uppercase tracking-wider block">2. Paste Target Job Description</label>
                  <textarea
                    rows={10}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste the target job description requirements, qualifications, and stack specifications here..."
                    className="w-full p-4 rounded-xl border border-dark-800 bg-dark-900/60 text-dark-100 placeholder-dark-550 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-xs resize-none h-[220px]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || resumes.length === 0}
                  className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FiTarget className="w-4 h-4" />
                      Calculate Job Match Report
                    </>
                  )}
                </button>
              </form>
            </div>
          ) : (
            /* Results Mode */
            <div className="space-y-6 animate-fade-in">
              {/* Header metrics card */}
              <div className="glass-panel p-6 rounded-2xl border border-dark-850 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div className="flex gap-4 items-center">
                  <div className="w-20 h-20 rounded-full border-4 border-brand-500/20 flex items-center justify-center text-2xl font-extrabold text-brand-350 bg-brand-500/5 shadow-inner">
                    {matchReport.atsScore}%
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-dark-100">Job Compatibility Score</h3>
                    <p className="text-xs text-dark-550 mt-1 font-semibold flex items-center gap-1.5 uppercase tracking-wider">
                      Target File: <span className="text-brand-400 normal-case">{matchReport.fileName}</span>
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 border border-dark-800 hover:border-dark-700 bg-dark-900/40 text-dark-200 hover:text-dark-100 rounded-xl text-xs font-semibold transition-all shadow-inner"
                >
                  Analyze New Job Description
                </button>
              </div>

              {/* Role Suitability Narrative */}
              <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-3.5 shadow-sm">
                <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Role Suitability Summary</h3>
                <p className="text-xs text-dark-350 leading-relaxed font-normal">
                  {matchReport.roleSuitability}
                </p>
              </div>

              {/* Grid: Strong Matches & Missing Requirements */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Strong Matches */}
                <div className="glass-panel p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.005] space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-emerald-450 uppercase tracking-wider flex items-center gap-2">
                    <FiCheck className="text-emerald-400 shrink-0" />
                    Strong Matches
                  </h3>
                  <ul className="space-y-3">
                    {matchReport.strongMatches.map((str, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-dark-350 leading-relaxed">
                        <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 font-bold">✓</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Missing Requirements */}
                <div className="glass-panel p-6 rounded-2xl border border-orange-500/10 bg-orange-500/[0.005] space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-orange-450 uppercase tracking-wider flex items-center gap-2">
                    <FiX className="text-orange-400 shrink-0" />
                    Missing Requirements
                  </h3>
                  <ul className="space-y-3">
                    {matchReport.missingRequirements.map((mis, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-dark-350 leading-relaxed">
                        <span className="w-4 h-4 rounded-full bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0 mt-0.5 font-bold">!</span>
                        <span>{mis}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Grid: Recommended Improvements & Skills to Learn */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Recommended Improvements */}
                <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-dark-250 uppercase tracking-wider flex items-center gap-2">
                    <FiTrendingUp className="text-brand-450 shrink-0" />
                    Recommended Improvements
                  </h3>
                  <ul className="space-y-3">
                    {matchReport.recommendedImprovements.map((imp, idx) => (
                      <li key={idx} className="flex gap-2.5 items-start text-xs text-dark-350 leading-relaxed">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-450 shrink-0 mt-1.5" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Skills to Learn */}
                <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold text-dark-250 uppercase tracking-wider flex items-center gap-2">
                    <FiBookOpen className="text-purple-450 shrink-0" />
                    Skills to Learn
                  </h3>
                  <p className="text-xs text-dark-500 font-normal">
                    We suggest acquiring these technical competencies to increase your matching percentage score.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {matchReport.skillsToLearn.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3.5 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-dark-850 flex items-start gap-4 shadow-sm">
                <FiInfo className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-dark-200">How is this match compiled?</h4>
                  <p className="text-[11px] text-dark-450 leading-relaxed font-normal">
                    The scoring metrics evaluate your skills density against the target keywords, combined with Gemini semantic checks evaluating role suitability and experience levels.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Previous Job Analyses History list (4 columns) */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-dark-850 space-y-4 shadow-sm max-h-[580px] overflow-y-auto">
          <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-1.5">
            <FiClock className="text-dark-550" />
            Previous Job Analyses
          </h4>

          {history.length === 0 ? (
            <div className="text-center py-8 text-xs text-dark-500 font-medium">
              No previous matches calculated yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {history.map((h, idx) => {
                const isActive = matchReport && matchReport.matchId === h.matchId;
                return (
                  <button
                    key={h.matchId || idx}
                    onClick={() => handleSelectHistory(h)}
                    className={`w-full p-3 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                      isActive
                        ? "bg-brand-600/15 border-brand-500/30 text-brand-300"
                        : "bg-dark-900/30 border-dark-850 text-dark-400 hover:text-dark-200"
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs font-bold w-full">
                      <span className="truncate pr-2">{h.fileName}</span>
                      <span className="text-[10px] text-brand-350 font-bold shrink-0">{h.atsScore}%</span>
                    </div>
                    <span className="text-[10px] text-dark-500 font-medium">
                      {new Date(h.createdAt).toLocaleDateString()} at {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
