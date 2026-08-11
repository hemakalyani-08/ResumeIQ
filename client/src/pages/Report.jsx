import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";
import { 
  FiFileText, 
  FiAward, 
  FiAlertCircle, 
  FiArrowRight, 
  FiCheck, 
  FiChevronRight,
  FiGrid,
  FiBriefcase,
  FiMessageSquare,
  FiTrendingUp,
  FiHelpCircle,
  FiDownload,
  FiShare2
} from "react-icons/fi";

export default function Report() {
  const { currentAnalysis } = useAnalysis();
  const [activeQuestion, setActiveQuestion] = useState(null);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (!currentAnalysis) return;
    const summaryText = `Resume Evaluation Report for ${currentAnalysis.fileName}
ATS Score: ${currentAnalysis.atsScore}%
AI Summary: ${currentAnalysis.summary}

Top Strengths:
${currentAnalysis.strengths.map(s => `- ${s}`).join("\n")}

Key Improvements:
${currentAnalysis.improvements.map(i => `- Original: "${i.original}"\n  Optimized: "${i.optimized}"`).join("\n")}

Target Roles: ${currentAnalysis.careerGuidance.recommendedRoles.join(", ")}`;

    navigator.clipboard.writeText(summaryText)
      .then(() => {
        alert("Report summary copied to clipboard! You can now paste and share it on LinkedIn, email, or Slack.");
      })
      .catch((err) => {
        console.error("Failed to copy report text:", err);
      });
  };

  if (!currentAnalysis) {
    return (
      <div className="glass-panel p-16 rounded-3xl text-center space-y-6 border border-dark-850 max-w-xl mx-auto my-12 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center mx-auto text-brand-400 shadow-inner">
          <FiFileText className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-dark-100">No Active Analysis Report</h3>
          <p className="text-sm text-dark-400">
            Please upload a resume PDF first so our AI engine can calculate your score and populate the dashboard data.
          </p>
        </div>
        <Link
          to="/upload"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-md shadow-brand-600/10"
        >
          Go to Upload
          <FiArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  // Visual ATS Score SVG helper
  const radius = 60;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (currentAnalysis.atsScore / 100) * circumference;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Overview header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-dark-100 tracking-tight">AI Resume Evaluation</h2>
          <p className="text-xs text-dark-500 mt-1 flex items-center gap-1.5 font-semibold uppercase tracking-wider">
            File Name: <span className="text-brand-400 normal-case">{currentAnalysis.fileName}</span>
          </p>
        </div>
        <div className="flex gap-2.5 no-print">
          <button
            onClick={handleShare}
            className="px-4 py-2 border border-dark-850 hover:border-dark-750 bg-dark-900/40 text-dark-250 hover:text-dark-150 rounded-xl text-xs font-semibold transition-all shadow-inner flex items-center gap-1.5"
          >
            <FiShare2 className="w-3.5 h-3.5" />
            Share
          </button>
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-1.5"
          >
            <FiDownload className="w-3.5 h-3.5" />
            Export PDF
          </button>
          <Link
            to="/upload"
            className="px-4 py-2 border border-dark-850 hover:border-dark-750 bg-dark-900/40 text-dark-250 hover:text-dark-150 rounded-xl text-xs font-semibold transition-all shadow-inner"
          >
            Re-Analyze
          </Link>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: ATS Score & Category breakdowns */}
        <div className="space-y-6">
          {/* Circular ATS Meter */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-850 flex flex-col items-center text-center shadow-md">
            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-6">Overall ATS Score</h3>
            
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" role="img" aria-label={`ATS Score rating is ${currentAnalysis.atsScore}%`}>
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="#0f172a"
                  strokeWidth={strokeWidth}
                  fill="transparent"
                />
                <circle
                  cx="72"
                  cy="72"
                  r={radius}
                  stroke="url(#scoreGradient)"
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#c084fc" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-extrabold text-dark-100">{currentAnalysis.atsScore}</span>
                <span className="text-[9px] text-dark-500 font-semibold uppercase tracking-wider">Rating</span>
              </div>
            </div>

            <p className="text-xs text-dark-450 leading-relaxed max-w-[200px] mt-6">
              Checks matching words, clean layouts, and simple formatting.
            </p>
          </div>

          {/* Sub-Category Indicators */}
          <div className="glass-panel p-5 rounded-2xl border border-dark-850 space-y-4 shadow-sm">
            <h3 className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-2">Category Scores</h3>
            <div className="space-y-3.5">
              {[
                { name: "Scanability", score: 85, color: "bg-emerald-500" },
                { name: "Layout & Formatting", score: 90, color: "bg-brand-500" },
                { name: "Action Verb Impact", score: 65, color: "bg-amber-500" },
                { name: "Grammar & Spellcheck", score: 95, color: "bg-emerald-500" },
                { name: "Target Keyword Density", score: currentAnalysis.atsScore - 10, color: "bg-purple-500" }
              ].map((cat) => (
                <div key={cat.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-dark-300">{cat.name}</span>
                    <span className="text-dark-100 font-bold">{cat.score}%</span>
                  </div>
                  <div className="h-1 bg-dark-900 rounded-full overflow-hidden">
                    <div className={`h-full ${cat.color} rounded-full`} style={{ width: `${cat.score}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Right Column: AI Summary & missing skills */}
        <div className="lg:col-span-2 space-y-6">
          {/* Executive Summary */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-3.5 shadow-sm">
            <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
              <FiFileText className="text-brand-400" />
              Executive Audit Summary
            </h3>
            <p className="text-sm text-dark-450 leading-relaxed font-normal">
              {currentAnalysis.summary}
            </p>
          </div>

          {/* Missing Skills chips */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
              <FiGrid className="text-orange-400" />
              Identified Skill Gaps
            </h3>
            <p className="text-xs text-dark-450 font-normal">
              These coding skills are missing from your resume. We recommend learning them or adding them to your projects.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {currentAnalysis.missingKeywords.map((kw, idx) => (
                <span
                  key={idx}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold"
                >
                  + {kw}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Mid Row: Strengths and Weaknesses */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="glass-panel p-6 rounded-2xl border border-emerald-500/10 bg-emerald-500/[0.005] space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-emerald-450 uppercase tracking-wider flex items-center gap-2">
            <FiAward className="text-emerald-400 shrink-0" />
            Resume Strengths
          </h3>
          <ul className="space-y-3">
            {currentAnalysis.strengths.map((str, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-dark-350 leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 font-bold">✓</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Areas to Improve */}
        <div className="glass-panel p-6 rounded-2xl border border-red-500/10 bg-red-500/[0.005] space-y-4 shadow-sm">
          <h3 className="text-sm font-bold text-red-450 uppercase tracking-wider flex items-center gap-2">
            <FiAlertCircle className="text-red-400 shrink-0" />
            Areas to Improve
          </h3>
          <ul className="space-y-3">
            {currentAnalysis.weaknesses.map((weak, idx) => (
              <li key={idx} className="flex gap-2.5 items-start text-xs text-dark-350 leading-relaxed">
                <span className="w-4 h-4 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0 mt-0.5 font-bold">!</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom Grid: Career Suggestions & Interview Preparation Preview */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Career Suggestions */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
              <FiBriefcase className="text-brand-450" />
              Career Suggestions
            </h3>
            <p className="text-xs text-dark-450 leading-relaxed font-normal">
              Based on parsed credentials, our AI suggested these target job titles and industry credentials.
            </p>

            <div className="space-y-3 pt-2">
              <div>
                <span className="block text-[9px] font-bold text-dark-500 uppercase tracking-widest mb-1.5">Recommended Roles</span>
                <div className="flex flex-wrap gap-2">
                  {currentAnalysis.careerGuidance.recommendedRoles.map((role, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-dark-900 border border-dark-800 text-xs font-semibold text-dark-300">
                      {role}
                    </span>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <span className="block text-[9px] font-bold text-dark-500 uppercase tracking-widest mb-1.5">Target Certifications</span>
                <div className="flex flex-col gap-2">
                  {currentAnalysis.careerGuidance.certifications.map((cert, idx) => (
                    <div key={idx} className="px-3 py-2 rounded-xl bg-dark-900/40 border border-dark-800 text-xs font-medium text-dark-250 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand-450"></span>
                      {cert}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-dark-900">
            <Link
              to="/career-guide"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors inline-flex items-center gap-1 group"
            >
              Explore Full Career Roadmap
              <FiChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Technical Interview Question Starter */}
        <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
              <FiMessageSquare className="text-brand-400" />
              Interview Preparation preview
            </h3>
            <p className="text-xs text-dark-450 leading-relaxed font-normal">
              Tailored preparation questions generated based on parsed experience gaps. Click to reveal ideal answer outlines.
            </p>

            <div className="space-y-2 pt-2">
            {(Array.isArray(currentAnalysis.careerGuidance?.interviewQuestions) ? currentAnalysis.careerGuidance.interviewQuestions : []).slice(0, 2).map((q, idx) => {
                const isOpen = activeQuestion === idx;
                return (
                  <div key={idx} className="rounded-xl border border-dark-900 bg-dark-900/30 overflow-hidden">
                    <button
                      onClick={() => setActiveQuestion(isOpen ? null : idx)}
                      className="w-full px-4 py-2.5 text-left text-xs font-medium text-dark-200 hover:text-dark-100 flex justify-between items-center"
                    >
                      <span className="truncate pr-4">{q.question}</span>
                      <span className="text-[10px] text-brand-450 font-bold shrink-0">{isOpen ? "Hide" : "Show"}</span>
                    </button>
                    {isOpen && (
                      <div className="p-3 bg-dark-950/60 border-t border-dark-900 text-[11px] text-dark-400 leading-relaxed font-normal">
                        <strong>Outline:</strong> {q.answerOutline}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-4 border-t border-dark-900">
            <Link
              to="/interview"
              className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors inline-flex items-center gap-1 group"
            >
              Start Practice Session
              <FiChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
