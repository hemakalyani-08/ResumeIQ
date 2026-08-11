import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";
import { api } from "../services/api";
import { 
  FiBriefcase, 
  FiClock, 
  FiChevronRight, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiMap,
  FiSliders,
  FiCpu,
  FiInfo,
  FiAlertCircle
} from "react-icons/fi";

export default function JobRecommendations() {
  const { currentAnalysis } = useAnalysis();

  const [careerInterests, setCareerInterests] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  
  // Category tabs: it | dataScience | banking | nonIt | fresher
  const [activeTab, setActiveTab] = useState("it");

  const categories = [
    { id: "it", label: "IT Jobs" },
    { id: "dataScience", label: "Data Science" },
    { id: "banking", label: "Banking Roles" },
    { id: "nonIt", label: "Non-IT Jobs" },
    { id: "fresher", label: "Fresher Jobs" }
  ];

  // Load history on mount
  const fetchHistory = async () => {
    try {
      const data = await api.get("/api/analyses/job-recommendations");
      setHistory(data);
    } catch (err) {
      console.error("Failed to load recommendations history:", err.message);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [report]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setErrorMsg("");

    try {
      const data = await api.post("/api/analyses/job-recommendations", {
        careerInterests: careerInterests.trim()
      });
      setReport(data);
    } catch (err) {
      setErrorMsg("Failed to generate recommendations. Try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  if (!currentAnalysis) {
    return (
      <div className="glass-panel p-16 rounded-3xl text-center space-y-6 border border-dark-850 max-w-xl mx-auto my-12 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center mx-auto text-brand-400">
          <FiBriefcase className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-dark-100">No Resume Context</h3>
        <p className="text-sm text-dark-400">Scan your resume PDF first to build personalized job recommendations suited to your background.</p>
        <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all">Go to Upload</Link>
      </div>
    );
  }

  // Get active roles to render
  const activeRoles = report?.recommendations?.[activeTab] || [];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">AI Job Matching</h2>
        <p className="text-sm text-dark-400 mt-1">Discover customized job recommendations across tech, banking, and fresher roles matching your resume context.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Main Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Industry preferences selector */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-850 bg-white">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label htmlFor="careerInterests" className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">
                  Customize Industry & Target Roles Interests (Optional)
                </label>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <FiSliders className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500 w-4 h-4" />
                    <input
                      id="careerInterests"
                      type="text"
                      placeholder="e.g. Remote Backend Web developer, cloud computing, finance internships..."
                      value={careerInterests}
                      onChange={(e) => setCareerInterests(e.target.value)}
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
                        Compile Jobs
                        <FiChevronRight />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-red-400 text-xs leading-normal">
                  <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}
            </form>
          </div>

          {/* Categories Tab navigation (Only shows if report exists) */}
          {report && (
            <div className="space-y-6">
              <div className="flex border-b border-dark-850 overflow-x-auto no-scrollbar">
                {categories.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-5 py-3 border-b-2 font-bold text-xs transition-all whitespace-nowrap ${
                      activeTab === tab.id
                        ? "border-brand-600 text-brand-600"
                        : "border-transparent text-dark-450 hover:text-dark-250"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Active Category Jobs Grid */}
              <div className="space-y-6">
                {activeRoles.length === 0 ? (
                  <div className="glass-panel p-8 rounded-2xl border border-dark-850 text-center text-xs text-dark-500 font-semibold bg-white">
                    No matching roles calculated for this category.
                  </div>
                ) : (
                  activeRoles.map((role, idx) => (
                    <div key={idx} className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-850 bg-white space-y-6 animate-fade-in shadow-sm">
                      {/* Title and score bar */}
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-dark-850">
                        <div>
                          <span className="text-[9px] font-bold text-brand-450 uppercase tracking-wider block mb-1">Recommended Role</span>
                          <h3 className="text-base font-bold text-dark-150">{role.jobTitle}</h3>
                        </div>
                        
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest whitespace-nowrap">Profile Match</span>
                          <div className="flex items-center gap-2 w-full sm:w-28">
                            <div className="flex-1 h-2 rounded-full bg-dark-900 overflow-hidden">
                              <div 
                                className="h-full bg-brand-500 rounded-full" 
                                style={{ width: `${role.matchPercentage}%` }}
                              />
                            </div>
                            <span className="text-xs font-extrabold text-brand-350 shrink-0">{role.matchPercentage}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Required vs Missing Skills */}
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                            <FiCheckCircle />
                            Required Skills Matched
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {role.requiredSkills?.map((skill, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 border border-emerald-500/10 text-emerald-400 rounded-lg">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                            <FiAlertTriangle />
                            Missing Key Gaps
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {role.missingSkills?.map((skill, sIdx) => (
                              <span key={sIdx} className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 border border-amber-500/10 text-amber-500 rounded-lg">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Actionable roadmap */}
                      <div className="pt-4 border-t border-dark-850 space-y-3">
                        <h4 className="text-xs font-bold text-dark-150 uppercase tracking-widest flex items-center gap-1.5">
                          <FiMap className="text-brand-500" />
                          Preparation Timeline Roadmap
                        </h4>
                        <div className="space-y-2">
                          {role.roadmap?.map((step, sIdx) => (
                            <div key={sIdx} className="p-3.5 rounded-xl border border-dark-850 bg-dark-950/10 flex gap-3 items-start">
                              <span className="w-5 h-5 rounded-full bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-500 text-[10px] font-extrabold shrink-0 mt-0.5">
                                {sIdx + 1}
                              </span>
                              <p className="text-xs text-dark-400 leading-normal font-normal">{step}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right Side: History (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-dark-850 space-y-4 shadow-sm max-h-[460px] overflow-y-auto bg-white">
            <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-1.5">
              <FiClock className="text-dark-550" />
              Prior Audits History
            </h4>

            {history.length === 0 ? (
              <div className="text-center py-6 text-xs text-dark-500 font-medium font-semibold">
                No matching reports generated yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {history.map((item, idx) => (
                  <button
                    key={item.recommendationId || idx}
                    onClick={() => setReport(item)}
                    className="w-full p-3.5 rounded-xl border border-dark-850 bg-dark-950/10 hover:border-brand-500/20 text-left space-y-1 transition-all"
                  >
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-brand-350">
                      <span className="truncate max-w-[70%]">{item.careerInterests}</span>
                      <span className="text-dark-500 font-medium font-semibold shrink-0">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm flex items-start gap-4 bg-brand-500/[0.01]">
            <FiCpu className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-dark-200">Matching Logic</h4>
              <p className="text-[11px] text-dark-450 leading-relaxed font-normal">
                Our model maps keywords from your projects, degree certificates, and tools to identify relevant openings across IT and non-IT sectors.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
