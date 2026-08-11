import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { api } from "../services/api";
import { 
  FiGithub, 
  FiTarget, 
  FiTrendingUp, 
  FiClock, 
  FiChevronRight, 
  FiCheckCircle, 
  FiInfo,
  FiUser,
  FiBookOpen,
  FiAlertCircle
} from "react-icons/fi";

export default function GithubAnalysis() {
  const [githubUrl, setGithubUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);

  // Load history on mount
  const fetchHistory = async () => {
    try {
      const data = await api.get("/api/analyses/github");
      setHistory(data);
    } catch (err) {
      console.error("Failed to load GitHub history:", err.message);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [report]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!githubUrl.trim()) {
      return setErrorMsg("Please enter your GitHub profile URL.");
    }

    setAnalyzing(true);
    setErrorMsg("");

    try {
      const data = await api.post("/api/analyses/github", { githubUrl: githubUrl.trim() });
      setReport(data);
    } catch (err) {
      setErrorMsg(err.message || "Failed to analyze profile. Please verify URL exists.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">GitHub Profile Audit</h2>
        <p className="text-sm text-dark-400 mt-1">Audit repository documentation, language stacks, and contribution consistency using AI.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Setup or Active Report */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* URL Input Form */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-850 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="githubUrl" className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">
                  GitHub Profile Link
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <FiGithub className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500 w-4 h-4" />
                    <input
                      id="githubUrl"
                      type="url"
                      placeholder="https://github.com/yourusername"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-dark-800 bg-dark-950/20 text-dark-100 placeholder-dark-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={analyzing}
                    className="px-6 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5 shrink-0"
                  >
                    {analyzing ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Audit Profile
                        <FiChevronRight />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-red-400 text-xs leading-normal animate-fade-in">
                  <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </form>
          </div>

          {/* AI AUDIT REPORT DISPLAY */}
          {report && (
            <div className="space-y-6">
              {/* Profile Meta and Score */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-850 space-y-6 bg-white">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-dark-850">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-500">
                      <FiGithub className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-dark-100">{report.profileName || report.username}</h3>
                      <p className="text-[10px] text-dark-500 font-semibold uppercase tracking-wider">
                        {report.reposCount} Repositories • {report.followersCount} Followers
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Developer Score</span>
                    <span className="px-3 py-1.5 rounded-xl bg-brand-50 border border-brand-200 text-brand-500 font-extrabold text-sm">
                      {report.auditReport?.githubScore}/100
                    </span>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 pt-2">
                  {/* Strengths */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                      <FiCheckCircle />
                      Project Strengths
                    </h4>
                    <ul className="space-y-2 text-xs text-dark-400 leading-relaxed font-normal">
                      {report.auditReport?.projectStrengths?.map((str, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-emerald-500 font-bold shrink-0 mt-0.5">✓</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Improvements */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                      <FiTrendingUp />
                      Gaps & Improvements
                    </h4>
                    <ul className="space-y-2 text-xs text-dark-400 leading-relaxed font-normal">
                      {report.auditReport?.improvementSuggestions?.map((imp, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-amber-500 font-bold shrink-0 mt-0.5">•</span>
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Resume Integrations & STAR Descriptions */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-850 space-y-6 bg-white">
                <h3 className="text-xs font-bold text-dark-200 uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-dark-850">
                  <FiBookOpen className="text-brand-500" />
                  Resume Integration Strategies
                </h3>

                <div className="space-y-5 divide-y divide-dark-900">
                  {/* STAR bulle points */}
                  <div className="space-y-3.5">
                    <h4 className="text-xs font-bold text-dark-150 uppercase tracking-wider">Quantified STAR Bullet Suggestions</h4>
                    <div className="space-y-3">
                      {report.auditReport?.resumeIntegration?.improvedDescriptions?.map((desc, idx) => (
                        <div key={idx} className="p-4 rounded-xl border border-dark-850 bg-dark-950/10 space-y-1">
                          <strong className="text-xs font-bold text-brand-350">{desc.project}</strong>
                          <p className="text-xs text-dark-450 leading-relaxed font-normal italic">"{desc.description}"</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Skills gaps */}
                  <div className="pt-5 space-y-3">
                    <h4 className="text-xs font-bold text-dark-150 uppercase tracking-wider">Identified Skills to Add</h4>
                    <div className="flex flex-wrap gap-2">
                      {report.auditReport?.resumeIntegration?.missingTechnicalSkills?.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand-50 border border-brand-200 text-brand-500 rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Audit history (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-dark-850 space-y-4 shadow-sm max-h-[460px] overflow-y-auto bg-white">
            <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-1.5">
              <FiClock className="text-dark-550" />
              Prior Audits History
            </h4>

            {history.length === 0 ? (
              <div className="text-center py-6 text-xs text-dark-500 font-medium font-semibold">
                No profiles audited yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {history.map((item, idx) => (
                  <button
                    key={item.analysisId || idx}
                    onClick={() => setReport(item)}
                    className="w-full p-3.5 rounded-xl border border-dark-850 bg-dark-950/10 hover:border-brand-500/20 text-left space-y-1.5 transition-all"
                  >
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-brand-350">
                      <span>@{item.username}</span>
                      <span className="text-dark-500 font-medium font-semibold">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-dark-450 font-normal">
                      <span>Score Rating: <strong className="text-brand-350 font-bold">{item.auditReport?.githubScore}/100</strong></span>
                      <span className="px-1.5 py-0.5 rounded bg-dark-800 text-dark-300 font-bold text-[8px] border border-dark-750 uppercase tracking-wider">{item.reposCount} Repos</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm flex items-start gap-4 bg-brand-500/[0.01]">
            <FiInfo className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-dark-200">How we score</h4>
              <p className="text-[11px] text-dark-450 leading-relaxed font-normal">
                Our system looks at your project folders, the coding languages you use, how many stars they have, and if you have written a README file describing your projects to give you a score.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
