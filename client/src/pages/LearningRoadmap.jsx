import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";
import { 
  FiMap, 
  FiBookOpen, 
  FiCompass, 
  FiAward, 
  FiBook, 
  FiLayers,
  FiChevronRight
} from "react-icons/fi";

export default function LearningRoadmap() {
  const { currentAnalysis } = useAnalysis();
  const [activeTab, setActiveTab] = useState("beginner"); // beginner | intermediate | advanced

  if (!currentAnalysis) {
    return (
      <div className="glass-panel p-16 rounded-3xl text-center space-y-6 border border-dark-850 max-w-xl mx-auto my-12 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center mx-auto text-brand-400">
          <FiMap className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-dark-100">No Learning Roadmap</h3>
        <p className="text-sm text-dark-400">Scan your resume to generate a step-by-step custom curriculum based on your skill gaps.</p>
        <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all">Go to Upload</Link>
      </div>
    );
  }

  // Parse roadmap database blocks with graceful backward compatibility for old array models
  let parsedRoadmap = { beginner: [], intermediate: [], advanced: [] };
  const rawRoadmap = currentAnalysis.roadmap;

  if (rawRoadmap) {
    if (Array.isArray(rawRoadmap)) {
      // Re-map old database array formats into beginner tier
      parsedRoadmap.beginner = rawRoadmap.map((item, idx) => ({
        order: idx + 1,
        skill: item.step || "Technical Skill",
        desc: item.desc || "Learn core application principles and integration parameters.",
        resources: item.resources ? [item.resources] : ["Official developer guides"],
        certifications: ["Foundational Credential Verification"]
      }));
    } else {
      parsedRoadmap = {
        beginner: rawRoadmap.beginner || [],
        intermediate: rawRoadmap.intermediate || [],
        advanced: rawRoadmap.advanced || []
      };
    }
  }

  const activeSteps = parsedRoadmap[activeTab] || [];
  // Sort by order to ensure estimated learning order is maintained
  const sortedSteps = [...activeSteps].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">Personalized Roadmap</h2>
        <p className="text-sm text-dark-400 mt-1">Engage with a step-by-step curriculum custom tailored to bridge your current technical skill gaps.</p>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-dark-900 gap-1.5 pb-px">
        {[
          { id: "beginner", label: "Beginner Level", desc: "Foundations & Syntax" },
          { id: "intermediate", label: "Intermediate Level", desc: "Integrations & APIs" },
          { id: "advanced", label: "Advanced Level", desc: "Deployments & Scale" }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-initial text-left px-5 py-3 border-b-2 font-semibold transition-all transition-colors duration-200 outline-none flex flex-col gap-0.5 ${
                isActive
                  ? "border-brand-500 text-brand-350 bg-brand-500/[0.02]"
                  : "border-transparent text-dark-450 hover:text-dark-250 hover:bg-dark-900/10"
              }`}
            >
              <span className="text-xs">{tab.label}</span>
              <span className="text-[9px] text-dark-500 font-medium tracking-wide uppercase">{tab.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Timeline style roadmap (8 columns) */}
        <div className="lg:col-span-8 space-y-6 relative pl-6 sm:pl-8">
          {/* Vertical Timeline Bar */}
          <div className="absolute left-[11px] sm:left-[15px] top-6 bottom-6 w-0.5 bg-dark-900 border-l border-dashed border-dark-800"></div>

          {sortedSteps.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl border border-dark-850 text-center text-xs text-dark-500 font-medium z-10 relative">
              No milestones generated for this capability level.
            </div>
          ) : (
            sortedSteps.map((step, idx) => (
              <div key={idx} className="relative space-y-3">
                {/* Timeline Bullet Ring */}
                <div className="absolute left-[-21px] sm:left-[-25px] top-1.5 w-6 h-6 rounded-full bg-dark-950 border-4 border-brand-500/80 flex items-center justify-center shadow-lg shadow-brand-500/10 z-10">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-200"></span>
                </div>

                {/* Node Card */}
                <div className="glass-panel p-5 rounded-2xl border border-dark-850 hover:border-brand-500/20 transition-all shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div className="space-y-0.5">
                      <span className="text-[10px] font-bold text-brand-450 uppercase tracking-widest">
                        Learning Order: Step #{step.order || idx + 1}
                      </span>
                      <h3 className="text-sm font-bold text-dark-150 leading-snug">{step.skill}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-dark-400 leading-relaxed font-normal">{step.desc}</p>

                  <div className="grid sm:grid-cols-2 gap-4 pt-1">
                    {/* Recommended Resources */}
                    {step.resources && step.resources.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest flex items-center gap-1">
                          <FiBook className="w-3 h-3 text-brand-450" />
                          Recommended Resources
                        </span>
                        <div className="flex flex-col gap-1">
                          {step.resources.map((res, i) => (
                            <span key={i} className="text-[10.5px] text-dark-350 leading-relaxed font-medium">
                              • {res}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Certification Suggestions */}
                    {step.certifications && step.certifications.length > 0 && (
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest flex items-center gap-1">
                          <FiAward className="w-3 h-3 text-purple-400" />
                          Certification Suggestions
                        </span>
                        <div className="flex flex-col gap-1">
                          {step.certifications.map((cert, i) => (
                            <span key={i} className="text-[10.5px] text-dark-350 leading-relaxed font-medium">
                              • {cert}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: General Tips (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
              <FiCompass className="text-brand-450" />
              Timeline Guidelines
            </h3>
            <div className="space-y-3.5 text-xs text-dark-450 leading-relaxed font-normal">
              <p>
                <strong>Order of Operations:</strong> Follow the steps chronologically within each capability tier. Build small repository files for each step before advancing.
              </p>
              <p>
                <strong>Practical Projects:</strong> Do not just absorb guides. Write code, launch local instances, and link repositories directly inside your projects list to double your ATS metrics.
              </p>
            </div>
          </div>

          <div className="glass-panel p-5 rounded-2xl border border-dark-850 flex items-start gap-4 shadow-sm">
            <FiLayers className="w-5 h-5 text-brand-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-dark-250">Target Certifications</h4>
              <p className="text-[11px] text-dark-500 leading-relaxed font-normal">
                Earning foundational or developer credentials acts as an immediate compliance verify for recruiter searches.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
