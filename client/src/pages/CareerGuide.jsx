import React from "react";
import { Link } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";
import { 
  FiAward, 
  FiBriefcase, 
  FiArrowRight, 
  FiInfo, 
  FiGrid, 
  FiMap, 
  FiMonitor, 
  FiSliders,
  FiBookOpen
} from "react-icons/fi";

export default function CareerGuide() {
  const { currentAnalysis } = useAnalysis();

  if (!currentAnalysis) {
    return (
      <div className="glass-panel p-16 rounded-3xl text-center space-y-6 border border-dark-850 max-w-xl mx-auto my-12 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center mx-auto text-brand-400">
          <FiAward className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-dark-100">No Active Career Report</h3>
        <p className="text-sm text-dark-400">Scan your resume PDF first to receive AI-powered career path recommendations.</p>
        <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all">Go to Upload</Link>
      </div>
    );
  }

  // Safe checks for new schema additions with fallback defaults
  const career = currentAnalysis.careerGuidance || {};
  const itRoles = career.itRoles || ["Full Stack Engineer", "Frontend Specialist", "API Architect"];
  const nonItRoles = career.nonItRoles || ["Technical Product Manager", "Developer Advocate", "Scrum Master"];
  const entryLevelOps = career.entryLevelOps || ["Junior Frontend Developer", "Support Engineer Associate"];
  const fresherAdvice = career.fresherAdvice || "Focus on building open-source projects, writing documentation, and demonstrating solid understanding of Git version control systems to stands out to engineering managers.";

  // Normalize roadmap into a flat array of steps
  let roadmapSteps = [];
  if (currentAnalysis.roadmap) {
    if (Array.isArray(currentAnalysis.roadmap)) {
      roadmapSteps = currentAnalysis.roadmap;
    } else {
      const levels = ["beginner", "intermediate", "advanced"];
      levels.forEach(level => {
        const steps = currentAnalysis.roadmap[level] || [];
        steps.forEach(s => {
          roadmapSteps.push({
            timeframe: level.charAt(0).toUpperCase() + level.slice(1),
            step: s.skill,
            desc: s.desc
          });
        });
      });
    }
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">AI Career Guide</h2>
        <p className="text-sm text-dark-400 mt-1">Receive personalized role alignments, skill requirements, and milestones tailored to your profile.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Recommended Roles & Skill Requirements */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card 1: Recommended Roles */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-6 shadow-sm">
            <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
              <FiBriefcase className="text-brand-450" />
              Recommended Roles
            </h3>
            
            <div className="space-y-5">
              {/* IT Roles */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest block">IT Career Paths</span>
                <div className="grid sm:grid-cols-3 gap-3">
                  {itRoles.map((role, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-dark-800 bg-dark-900/40 font-semibold text-xs text-dark-250 flex items-center gap-2">
                      <FiMonitor className="text-brand-400 shrink-0" />
                      {role}
                    </div>
                  ))}
                </div>
              </div>

              {/* Non-IT Roles */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest block">Non-IT Options / Tech Adjacent</span>
                <div className="grid sm:grid-cols-3 gap-3">
                  {nonItRoles.map((role, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-dark-800 bg-dark-900/40 font-semibold text-xs text-dark-250 flex items-center gap-2">
                      <FiSliders className="text-purple-400 shrink-0" />
                      {role}
                    </div>
                  ))}
                </div>
              </div>

              {/* Entry Level */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest block">Entry-Level & Internship opportunities</span>
                <div className="flex flex-wrap gap-2">
                  {entryLevelOps.map((op, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded-lg bg-brand-500/10 border border-brand-500/25 text-xs font-semibold text-brand-350">
                      {op}
                    </span>
                  ))}
                </div>
              </div>

              {/* Fresher Guidance */}
              <div className="p-4 rounded-xl border border-dark-800 bg-dark-950/40 space-y-1.5">
                <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest block">Career Starter & Fresher Guidance</span>
                <p className="text-xs text-dark-400 leading-relaxed font-normal">
                  {fresherAdvice}
                </p>
              </div>
            </div>
          </div>

          {/* Card 2: Skill Requirements */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
              <FiGrid className="text-orange-400" />
              Skill Requirements
            </h3>
            <p className="text-xs text-dark-450 font-normal">
              Compare matched skills vs identified gaps. Acquire missing credentials to qualify for target roles.
            </p>

            <div className="grid md:grid-cols-2 gap-4 pt-2">
              {/* Matched */}
              <div className="p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/[0.005] space-y-2">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block">Matched Credentials</span>
                <div className="flex flex-wrap gap-1.5">
                  {(currentAnalysis.skillGap || []).filter(s => s.status === "Matched").slice(0, 8).map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-semibold text-emerald-400">
                      {s.skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing */}
              <div className="p-4 rounded-xl border border-orange-500/10 bg-orange-500/[0.005] space-y-2">
                <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest block">Missing Prerequisites</span>
                <div className="flex flex-wrap gap-1.5">
                  {(currentAnalysis.skillGap || []).filter(s => s.status === "Gap").slice(0, 8).map((s, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded bg-orange-500/10 border border-orange-500/20 text-[10px] font-semibold text-orange-400">
                      {s.skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Card 3: Career Roadmap Card */}
        <div className="space-y-6">
          {/* Career Roadmap Preview */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-5 shadow-sm flex flex-col justify-between h-[450px]">
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
                <FiMap className="text-purple-400" />
                Career Roadmap
              </h3>
              <p className="text-xs text-dark-450 leading-relaxed font-normal">
                Preview your step-by-step learning progression path to close identified technical skill gaps.
              </p>

              {/* Steps timeline */}
              <div className="space-y-3.5 pt-2">
                {roadmapSteps.slice(0, 3).map((step, idx) => (
                  <div key={idx} className="flex gap-3 relative pl-4 first:pt-0">
                    {/* Timeline line */}
                    {idx < 2 && (
                      <span className="absolute left-1.5 top-3 bottom-0 w-[1px] bg-dark-800" />
                    )}
                    <span className="w-3 h-3 rounded-full bg-brand-500/20 border border-brand-500 flex items-center justify-center shrink-0 mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-dark-500 block uppercase tracking-widest">{step.timeframe}</span>
                      <h4 className="text-xs font-bold text-dark-200">{step.step}</h4>
                      <p className="text-[10px] text-dark-450 line-clamp-1 leading-relaxed font-normal">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-dark-900">
              <Link
                to="/roadmap"
                className="w-full py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 group"
              >
                Open Full Interactive Roadmap
                <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
          </div>

          {/* Guidelines */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm flex items-start gap-4">
            <FiInfo className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-dark-200">Continuous Growth Advice</h4>
              <p className="text-[11px] text-dark-450 leading-relaxed font-normal">
                AI recommendations are refreshed every time you re-scan your resume PDF, adapting to newly added achievements and certifications.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
