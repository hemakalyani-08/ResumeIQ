import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";
import { api } from "../services/api";
import { 
  FiTrendingUp, 
  FiCpu, 
  FiCheck, 
  FiX, 
  FiRotateCw, 
  FiEye, 
  FiCornerDownRight, 
  FiAlertCircle, 
  FiEdit3, 
  FiFileText 
} from "react-icons/fi";

export default function ResumeImprovement() {
  const { currentAnalysis } = useAnalysis();

  // Local draft state to preserve edits without modifying original parsed text directly
  const [draftSummary, setDraftSummary] = useState("");
  const [draftExperience, setDraftExperience] = useState([]);
  const [draftProjects, setDraftProjects] = useState([]);
  
  const [selectedType, setSelectedType] = useState("summary"); // summary | experience | project
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeText, setActiveText] = useState("");
  const [instruction, setInstruction] = useState("quantify"); // quantify | action-verbs | professional
  
  const [optimizedText, setOptimizedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [compareMode, setCompareMode] = useState(false);

  // Initialize draft states when resume changes
  useEffect(() => {
    if (currentAnalysis) {
      setDraftSummary(currentAnalysis.summary || "");
      setDraftExperience(currentAnalysis.improvements.map(imp => imp.original) || []);
      setDraftProjects(currentAnalysis.roadmap.map(node => node.desc) || []);
      
      // Seed initial editing field
      setActiveText(currentAnalysis.summary || "");
      setSelectedType("summary");
      setSelectedIndex(0);
      setOptimizedText("");
      setSuccess("");
      setError("");
    }
  }, [currentAnalysis]);

  if (!currentAnalysis) {
    return (
      <div className="glass-panel p-16 rounded-3xl text-center space-y-6 border border-dark-850 max-w-xl mx-auto my-12 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center mx-auto text-brand-400">
          <FiTrendingUp className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-dark-100">No Active Resume</h3>
        <p className="text-sm text-dark-400">Please scan your resume PDF first to audit section qualities and trigger AI rewrites.</p>
        <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all">Go to Upload</Link>
      </div>
    );
  }

  // Handle section category selection change
  const handleSelectSegment = (type, index, textVal) => {
    setSelectedType(type);
    setSelectedIndex(index);
    setActiveText(textVal);
    setOptimizedText("");
    setSuccess("");
    setError("");
  };

  // Trigger backend AI optimization
  const handleOptimize = async (e) => {
    if (e) e.preventDefault();
    if (!activeText.trim()) return;

    setLoading(true);
    setError("");
    setSuccess("");
    setOptimizedText("");

    try {
      let promptInstruction = "";
      if (instruction === "quantify") {
        promptInstruction = "Rewrite this statement to include quantified achievements, performance percentages, or business metrics.";
      } else if (instruction === "action-verbs") {
        promptInstruction = "Begin the statement with a strong active verb (e.g. Spearheaded, Orchestrated) and remove passive filler words.";
      } else {
        promptInstruction = "Make this statement sound more executive, professional, and clear.";
      }

      const res = await api.post("/api/analyses/improve", {
        text: activeText,
        type: selectedType,
        instruction: promptInstruction
      });

      setOptimizedText(res.optimized);
    } catch (err) {
      setError(err.message || "Failed to generate optimization suggestion.");
    } finally {
      setLoading(false);
    }
  };

  // Action: Accept Suggestion
  const handleAccept = () => {
    if (!optimizedText) return;

    if (selectedType === "summary") {
      setDraftSummary(optimizedText);
      setActiveText(optimizedText);
    } else if (selectedType === "experience") {
      const updated = [...draftExperience];
      updated[selectedIndex] = optimizedText;
      setDraftExperience(updated);
      setActiveText(optimizedText);
    } else {
      const updated = [...draftProjects];
      updated[selectedIndex] = optimizedText;
      setDraftProjects(updated);
      setActiveText(optimizedText);
    }

    setSuccess("Improvement suggestion accepted and saved to active draft!");
    setOptimizedText("");
  };

  // Action: Reject Suggestion
  const handleReject = () => {
    setOptimizedText("");
    setSuccess("Suggestion discarded.");
    setTimeout(() => setSuccess(""), 2000);
  };

  // Simple diff generator visual comparison
  const renderCompareText = () => {
    const originalWords = activeText.split(" ");
    const optimizedWords = optimizedText.split(" ");

    return (
      <div className="grid md:grid-cols-2 gap-4 text-xs font-normal leading-relaxed">
        <div className="p-4 rounded-xl border border-red-500/10 bg-red-500/[0.01] space-y-1.5">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-widest block">Removed / Original</span>
          <p className="text-dark-300">
            {originalWords.map((w, idx) => {
              const exists = optimizedWords.some(ow => ow.toLowerCase().replace(/[^a-z]/g, "") === w.toLowerCase().replace(/[^a-z]/g, ""));
              return (
                <span key={idx} className={!exists ? "bg-red-500/20 text-red-200 px-0.5 rounded" : ""}>
                  {w}{" "}
                </span>
              );
            })}
          </p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.01] space-y-1.5">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Added / Optimized</span>
          <p className="text-dark-200">
            {optimizedWords.map((w, idx) => {
              const exists = originalWords.some(ow => ow.toLowerCase().replace(/[^a-z]/g, "") === w.toLowerCase().replace(/[^a-z]/g, ""));
              return (
                <span key={idx} className={!exists ? "bg-emerald-500/20 text-emerald-250 px-0.5 rounded" : ""}>
                  {w}{" "}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">AI Resume Improver</h2>
        <p className="text-sm text-dark-400 mt-1">Review weak segments and optimize summary descriptors with real-time AI suggestions.</p>
      </div>

      {/* Global alert feedback */}
      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-red-400 text-sm">
          <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-emerald-400 text-sm">
          <FiCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      {/* Section 1: Resume Review Heuristics */}
      <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm">
        <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
          <FiFileText className="text-brand-450" />
          Analysis Review & Suggestions
        </h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-dark-900/40 border border-dark-850 space-y-2">
            <h4 className="text-xs font-bold text-dark-100 flex justify-between items-center">
              <span>Professional Summary</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-brand-500/10 text-brand-350 font-bold border border-brand-500/20">Review</span>
            </h4>
            <p className="text-[11px] text-dark-450 leading-relaxed font-normal">
              Summary is brief. Try adding targeted keywords and focusing on architectural metrics.
            </p>
          </div>
          <div className="p-4 rounded-xl bg-dark-900/40 border border-dark-850 space-y-2">
            <h4 className="text-xs font-bold text-dark-100 flex justify-between items-center">
              <span>Experience Bullets</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">Weak (Metric Gap)</span>
            </h4>
            <p className="text-[11px] text-dark-450 leading-relaxed font-normal">
              Some project statements lack numbers. Quantify achievements (percentages, load limits).
            </p>
          </div>
          <div className="p-4 rounded-xl bg-dark-900/40 border border-dark-850 space-y-2">
            <h4 className="text-xs font-bold text-dark-100 flex justify-between items-center">
              <span>Verb Strength</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-450 font-bold border border-emerald-500/20">Good</span>
            </h4>
            <p className="text-[11px] text-dark-450 leading-relaxed font-normal">
              Modern engineering verbs are present, but could be reinforced with active impact terms.
            </p>
          </div>
        </div>
      </div>

      {/* Section 2: Editor split-view */}
      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Selector sidebar (3 columns) */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-dark-850 space-y-4 shadow-sm h-[480px] overflow-y-auto">
          <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest mb-2">Resume Segments</h4>
          
          <div className="space-y-4.5">
            {/* Summary */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest">Summary</span>
              <button
                onClick={() => handleSelectSegment("summary", 0, draftSummary)}
                className={`w-full p-3 rounded-xl border text-left text-xs font-medium truncate block transition-all ${
                  selectedType === "summary"
                    ? "bg-brand-600/15 border-brand-500/30 text-brand-300"
                    : "bg-dark-900/30 border-dark-850 text-dark-400 hover:text-dark-200"
                }`}
              >
                {draftSummary || "Select Professional Summary"}
              </button>
            </div>

            {/* Experience Bullets */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest">Experience Bullets</span>
              <div className="space-y-1.5">
                {draftExperience.map((bullet, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSegment("experience", idx, bullet)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-medium truncate block transition-all ${
                      selectedType === "experience" && selectedIndex === idx
                        ? "bg-brand-600/15 border-brand-500/30 text-brand-300"
                        : "bg-dark-900/30 border-dark-850 text-dark-400 hover:text-dark-200"
                    }`}
                  >
                    Bullet #{idx + 1}: {bullet}
                  </button>
                ))}
              </div>
            </div>

            {/* Projects */}
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest">Projects Descriptions</span>
              <div className="space-y-1.5">
                {draftProjects.map((proj, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelectSegment("project", idx, proj)}
                    className={`w-full p-3 rounded-xl border text-left text-xs font-medium truncate block transition-all ${
                      selectedType === "project" && selectedIndex === idx
                        ? "bg-brand-600/15 border-brand-500/30 text-brand-300"
                        : "bg-dark-900/30 border-dark-850 text-dark-400 hover:text-dark-200"
                    }`}
                  >
                    Project #{idx + 1}: {proj}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Workspace panel (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Original Text */}
            <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-bold text-dark-250 uppercase tracking-wider flex items-center gap-1.5">
                  <FiEdit3 className="text-dark-550" />
                  Original Resume Content
                </h4>
                <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest">{selectedType}</span>
              </div>

              <textarea
                rows={8}
                value={activeText}
                onChange={(e) => setActiveText(e.target.value)}
                className="w-full p-4 rounded-xl border border-dark-800 bg-dark-900/60 text-dark-100 placeholder-dark-550 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-xs resize-none h-[180px]"
              />

              {/* Optimization Parameters */}
              <div className="space-y-2">
                <span className="block text-[10px] font-bold text-dark-500 uppercase tracking-widest">AI Target Instruction</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setInstruction("quantify")}
                    className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${
                      instruction === "quantify"
                        ? "bg-brand-600/15 border-brand-500/30 text-brand-350"
                        : "bg-dark-900/35 border-dark-850 text-dark-400 hover:text-dark-200"
                    }`}
                  >
                    Quantify Metrics
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstruction("action-verbs")}
                    className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${
                      instruction === "action-verbs"
                        ? "bg-brand-600/15 border-brand-500/30 text-brand-350"
                        : "bg-dark-900/35 border-dark-850 text-dark-400 hover:text-dark-200"
                    }`}
                  >
                    Active Verbs
                  </button>
                  <button
                    type="button"
                    onClick={() => setInstruction("professional")}
                    className={`py-2 rounded-lg text-[10px] font-bold border transition-all ${
                      instruction === "professional"
                        ? "bg-brand-600/15 border-brand-500/30 text-brand-350"
                        : "bg-dark-900/35 border-dark-850 text-dark-400 hover:text-dark-200"
                    }`}
                  >
                    Executive Style
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleOptimize()}
                disabled={loading || !activeText.trim()}
                className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FiCpu className="w-4 h-4" />
                    Request AI Rewrite
                  </>
                )}
              </button>
            </div>

            {/* Right: AI Improved Text */}
            <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm flex flex-col justify-between h-full min-h-[350px]">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-dark-250 uppercase tracking-wider flex items-center gap-1.5">
                    <FiCpu className="text-brand-450" />
                    AI Improved Version
                  </h4>
                  {optimizedText && (
                    <button
                      onClick={() => setCompareMode(!compareMode)}
                      className={`px-2.5 py-1 rounded text-[10px] font-bold border flex items-center gap-1 transition-all ${
                        compareMode 
                          ? "bg-brand-500/15 border-brand-500/30 text-brand-350" 
                          : "border-dark-800 text-dark-400 hover:text-dark-200"
                      }`}
                    >
                      <FiEye className="w-3 h-3" />
                      Compare
                    </button>
                  )}
                </div>

                <div className="flex-1 min-h-[160px] flex items-center justify-center">
                  {loading ? (
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-brand-500/25 border-t-brand-450 rounded-full animate-spin" />
                      <span className="text-[10px] text-dark-500 font-semibold tracking-wider">AI OPTIMIZING...</span>
                    </div>
                  ) : optimizedText ? (
                    <div className="w-full text-xs font-normal leading-relaxed text-dark-200 bg-dark-900/20 p-4 rounded-xl border border-dark-900">
                      {optimizedText}
                    </div>
                  ) : (
                    <div className="text-center space-y-1.5">
                      <FiCpu className="w-8 h-8 mx-auto text-dark-600 animate-pulse-subtle" />
                      <p className="text-[11px] text-dark-500 font-medium">Select a segment and click optimize.</p>
                    </div>
                  )}
                </div>
              </div>

              {optimizedText && !loading && (
                <div className="grid grid-cols-3 gap-2.5 pt-4 border-t border-dark-900">
                  <button
                    onClick={handleAccept}
                    className="py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-all flex items-center justify-center gap-1 shadow-md shadow-emerald-600/10"
                  >
                    <FiCheck className="w-3.5 h-3.5" />
                    Accept
                  </button>
                  <button
                    onClick={handleReject}
                    className="py-2.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 font-bold text-[10px] transition-all flex items-center justify-center gap-1"
                  >
                    <FiX className="w-3.5 h-3.5" />
                    Reject
                  </button>
                  <button
                    onClick={() => handleOptimize()}
                    className="py-2.5 rounded-lg border border-dark-800 hover:bg-dark-900 text-dark-300 font-bold text-[10px] transition-all flex items-center justify-center gap-1"
                  >
                    <FiRotateCw className="w-3.5 h-3.5" />
                    Regenerate
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Inline Compare mode window */}
          {compareMode && optimizedText && !loading && (
            <div className="glass-panel p-6 rounded-2xl border border-brand-500/10 shadow-sm animate-fade-in space-y-3">
              <h4 className="text-xs font-bold text-dark-200 uppercase tracking-wider flex items-center gap-1.5">
                <FiEye className="text-brand-450" />
                Change Comparison
              </h4>
              {renderCompareText()}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
