import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";
import { api } from "../services/api";
import { 
  FiAward, 
  FiCheckCircle, 
  FiAlertTriangle, 
  FiMapPin, 
  FiGithub, 
  FiLinkedin, 
  FiMessageSquare, 
  FiCpu, 
  FiChevronRight, 
  FiTarget,
  FiBookOpen
} from "react-icons/fi";

export default function CareerAssistant() {
  const { currentAnalysis } = useAnalysis();

  const [githubScore, setGithubScore] = useState(0);
  const [linkedinScore, setLinkedinScore] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch prior scores for unified index calculation
  useEffect(() => {
    const fetchPriorReports = async () => {
      try {
        const [githubHistory, linkedinHistory] = await Promise.all([
          api.get("/api/analyses/github"),
          api.get("/api/analyses/linkedin")
        ]);

        if (githubHistory.length > 0) {
          setGithubScore(githubHistory[0].auditReport?.githubScore || 70);
        } else {
          setGithubScore(0); // indicates not run yet
        }

        if (linkedinHistory.length > 0) {
          setLinkedinScore(85); // base score if run
        } else {
          setLinkedinScore(0); // indicates not run yet
        }
      } catch (err) {
        console.error("Failed to load prior reports for readiness compilation:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPriorReports();
  }, []);

  if (!currentAnalysis) {
    return (
      <div className="glass-panel p-16 rounded-3xl text-center space-y-6 border border-dark-850 max-w-xl mx-auto my-12 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center mx-auto text-brand-400">
          <FiCpu className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-dark-100">No Career Profile Data</h3>
        <p className="text-sm text-dark-400">Upload and scan your resume PDF first to build your career assistant dashboard.</p>
        <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all">Go to Upload</Link>
      </div>
    );
  }

  // Calculate Unified Career Readiness Score
  const atsScore = currentAnalysis.atsScore || 0;
  const activeGithub = githubScore > 0 ? githubScore : 65; // fallback baseline if not audited
  const activeLinkedin = linkedinScore > 0 ? 80 : 60; // fallback baseline if not audited
  
  const careerReadinessIndex = Math.round(
    (atsScore * 0.5) + 
    (activeGithub * 0.25) + 
    (activeLinkedin * 0.25)
  );

  // Extract skills lists
  const currentSkills = currentAnalysis.skills || [];
  const missingSkills = currentAnalysis.improvements?.missingSkills || ["System design", "TypeScript"];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header welcome */}
      <div>
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">AI Career Assistant</h2>
        <p className="text-sm text-dark-400 mt-1">Your personal AI career mentor consolidating resume scans, coding quality, and LinkedIn reach metrics.</p>
      </div>

      {loading ? (
        <div className="h-48 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Main left column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Unified Metrics Card */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-850 bg-white space-y-6 shadow-sm">
              <h3 className="text-xs font-bold text-dark-200 uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-dark-850">
                <FiAward className="text-brand-500" />
                Career Readiness Index
              </h3>

              <div className="grid sm:grid-cols-3 gap-6 items-center">
                {/* Readiness Dial */}
                <div className="flex flex-col items-center justify-center p-4 border border-dark-850 rounded-2xl bg-dark-950/10">
                  <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest mb-3">Overall Index</span>
                  <div className="w-24 h-24 rounded-full border-[6px] border-dark-800 flex items-center justify-center relative bg-white">
                    <div className="absolute inset-0 rounded-full border-[6px] border-brand-500 border-t-transparent border-l-transparent"></div>
                    <span className="text-xl font-extrabold text-brand-350">{careerReadinessIndex}%</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400 mt-4 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/10 uppercase tracking-wider">
                    Ready to Apply
                  </span>
                </div>

                {/* KPI Breakdown details */}
                <div className="sm:col-span-2 space-y-3">
                  <h4 className="text-xs font-bold text-dark-150 uppercase tracking-wider">Metric Breakdown</h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-dark-950/10 border border-dark-850">
                      <span className="text-dark-250">ATS Resume Score</span>
                      <strong className="text-brand-350">{atsScore}%</strong>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-dark-950/10 border border-dark-850">
                      <span className="text-dark-250">GitHub Code Score</span>
                      <strong className={githubScore > 0 ? "text-brand-350" : "text-amber-500"}>
                        {githubScore > 0 ? `${githubScore}%` : "Not Audited Yet"}
                      </strong>
                    </div>
                    <div className="flex justify-between items-center p-2.5 rounded-lg bg-dark-950/10 border border-dark-850">
                      <span className="text-dark-250">LinkedIn SEO Rating</span>
                      <strong className={linkedinScore > 0 ? "text-brand-350" : "text-amber-500"}>
                        {linkedinScore > 0 ? `${linkedinScore}%` : "Not Audited Yet"}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Skills Alignment */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-850 bg-white space-y-6 shadow-sm">
              <h3 className="text-xs font-bold text-dark-200 uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-dark-850">
                <FiTarget className="text-brand-500" />
                Skills Inventory Alignment
              </h3>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Current skills */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FiCheckCircle />
                    Active Resume Skills
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {currentSkills.slice(0, 8).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                    <FiAlertTriangle />
                    Missing Stack Gaps
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {missingSkills.slice(0, 8).map((skill, idx) => (
                      <span key={idx} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/10 text-amber-500 rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Journey Milestones */}
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-850 bg-white space-y-6 shadow-sm">
              <h3 className="text-xs font-bold text-dark-200 uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-dark-850">
                <FiBookOpen className="text-brand-500" />
                Career Growth Path
              </h3>

              <div className="space-y-3">
                {[
                  { title: "Optimize Resume Bullet Points", status: atsScore >= 80 ? "complete" : "pending", link: "/report", desc: "Rewrite experience sections using STAR methods to reach an 80%+ ATS scanner score." },
                  { title: "Perform GitHub Repository Audit", status: githubScore > 0 ? "complete" : "pending", link: "/github-analysis", desc: "Scan repository documentation to extract STAR description logs for project additions." },
                  { title: "Upgrade LinkedIn Headlines", status: linkedinScore > 0 ? "complete" : "pending", link: "/linkedin-analysis", desc: "SEO optimize bio headline keyword density to rank high on recruiter filters." },
                  { title: "Practice Mock Interview Simulators", status: "pending", link: "/mock-interview", desc: "Practice spoken responses with speech synthesis voice interview tools." }
                ].map((step, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-dark-850 bg-dark-950/10 flex justify-between items-start gap-4 transition-all hover:border-brand-500/20">
                    <div className="flex gap-3.5 items-start">
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-extrabold shrink-0 mt-0.5 ${
                        step.status === "complete"
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-dark-700 bg-white text-dark-500"
                      }`}>
                        {step.status === "complete" ? "✓" : idx + 1}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-dark-150 mb-0.5">{step.title}</h4>
                        <p className="text-[11px] text-dark-450 leading-relaxed font-normal">{step.desc}</p>
                      </div>
                    </div>
                    <Link
                      to={step.link}
                      className="p-1 rounded-lg hover:bg-brand-50 hover:text-brand-500 text-dark-500 transition-all border border-transparent hover:border-brand-200 shrink-0"
                    >
                      <FiChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Side Column (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Quick Mentor Chat widget */}
            <div className="glass-panel p-5 rounded-2xl border border-dark-850 bg-white space-y-4 shadow-sm">
              <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-1.5">
                <FiMessageSquare className="text-brand-500" />
                Resume AI Assistant
              </h4>
              <p className="text-[11px] text-dark-450 leading-relaxed font-normal">
                Ask your mentor coach about skills additions, interview answers structure, or career growth templates.
              </p>
              <Link
                to="/chatbot"
                className="w-full py-2.5 border border-brand-200 hover:border-brand-350 bg-brand-50 hover:bg-brand-100/50 text-brand-600 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1"
              >
                Chat with Career Coach
                <FiChevronRight />
              </Link>
            </div>

            {/* Active profile stats summary */}
            <div className="glass-panel p-5 rounded-2xl border border-dark-850 bg-white space-y-3.5 shadow-sm text-xs">
              <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-1.5 pb-2 border-b border-dark-850">
                Profile Overview
              </h4>
              <div className="flex justify-between items-center text-dark-250">
                <span>Active Target Role</span>
                <strong className="text-dark-150 font-bold truncate max-w-[60%]">
                  {currentAnalysis.careerGuidance?.targetRoles?.[0] || "Software Developer"}
                </strong>
              </div>
              <div className="flex justify-between items-center text-dark-250">
                <span>Total Gaps Marked</span>
                <strong className="text-brand-350 font-bold">
                  {missingSkills.length} missing
                </strong>
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
