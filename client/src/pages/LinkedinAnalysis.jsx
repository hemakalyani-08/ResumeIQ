import React, { useState, useEffect } from "react";
import { api } from "../services/api";
import { 
  FiLinkedin, 
  FiClock, 
  FiChevronRight, 
  FiCheck,
  FiCopy,
  FiCpu,
  FiBookOpen,
  FiTrendingUp,
  FiInfo,
  FiAlertCircle
} from "react-icons/fi";

export default function LinkedinAnalysis() {
  const [headline, setHeadline] = useState("");
  const [about, setAbout] = useState("");
  const [skills, setSkills] = useState("");
  const [experiences, setExperiences] = useState("");

  const [analyzing, setAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);

  // Copy helper
  const [copiedHeadline, setCopiedHeadline] = useState(false);
  const [copiedAbout, setCopiedAbout] = useState(false);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === "headline") {
      setCopiedHeadline(true);
      setTimeout(() => setCopiedHeadline(false), 2000);
    } else {
      setCopiedAbout(true);
      setTimeout(() => setCopiedAbout(false), 2000);
    }
  };

  // Load history on mount
  const fetchHistory = async () => {
    try {
      const data = await api.get("/api/analyses/linkedin");
      setHistory(data);
    } catch (err) {
      console.error("Failed to load LinkedIn history:", err.message);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [report]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!headline.trim() && !about.trim() && !skills.trim()) {
      return setErrorMsg("Please fill in at least one profile parameter to analyze.");
    }

    setAnalyzing(true);
    setErrorMsg("");

    try {
      const data = await api.post("/api/analyses/linkedin", {
        headline: headline.trim(),
        about: about.trim(),
        skills: skills.trim(),
        experiences: experiences.trim()
      });
      setReport(data);
    } catch (err) {
      setErrorMsg("Failed to audit profile. Try again.");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">LinkedIn Profile Coach</h2>
        <p className="text-sm text-dark-400 mt-1">Check your profile text to help you get noticed by recruiters.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Main Panel */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Profile Form */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-850 bg-white space-y-6">
            <h3 className="text-xs font-bold text-dark-200 uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-dark-850">
              <FiLinkedin className="text-blue-500" />
              Fill in Your LinkedIn Details
            </h3>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1">
                <label htmlFor="headline" className="text-[10px] font-bold text-dark-500 uppercase tracking-widest flex justify-between gap-2 flex-wrap">
                  <span>Your LinkedIn Headline</span>
                  <span className="text-[9px] text-dark-500 font-normal lowercase italic">A short sentence at the top of your profile that tells people what you do.</span>
                </label>
                <input
                  id="headline"
                  type="text"
                  placeholder="e.g. Software Engineering Student at ResumeNova University"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-dark-800 bg-dark-950/20 text-dark-100 placeholder-dark-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label htmlFor="skills" className="text-[10px] font-bold text-dark-500 uppercase tracking-widest flex justify-between">
                    <span>Your Key Skills</span>
                  </label>
                  <input
                    id="skills"
                    type="text"
                    placeholder="e.g. React, JavaScript, HTML, CSS"
                    value={skills}
                    onChange={(e) => setSkills(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-dark-800 bg-dark-950/20 text-dark-100 placeholder-dark-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                  <p className="text-[9px] text-dark-500 font-normal italic">List languages or tools, separated by commas.</p>
                </div>
                <div className="space-y-1">
                  <label htmlFor="experiences" className="text-[10px] font-bold text-dark-500 uppercase tracking-widest flex justify-between">
                    <span>Your Work Experience</span>
                  </label>
                  <input
                    id="experiences"
                    type="text"
                    placeholder="e.g. Internship at Acme Corp, project developer"
                    value={experiences}
                    onChange={(e) => setExperiences(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-dark-800 bg-dark-950/20 text-dark-100 placeholder-dark-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  />
                  <p className="text-[9px] text-dark-500 font-normal italic">Write down your internships or jobs.</p>
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="about" className="text-[10px] font-bold text-dark-500 uppercase tracking-widest flex justify-between gap-2 flex-wrap">
                  <span>Your LinkedIn 'About' Summary</span>
                  <span className="text-[9px] text-dark-500 font-normal lowercase italic">The main text box on your profile where you introduce yourself.</span>
                </label>
                <textarea
                  id="about"
                  rows={4}
                  placeholder="Paste your active LinkedIn summary bio here..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-dark-800 bg-white text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-xs resize-y"
                />
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-red-400 text-xs leading-normal">
                  <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={analyzing}
                className="w-full py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                {analyzing ? (
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Audit LinkedIn Copy
                    <FiChevronRight />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* REPORT VIEW */}
          {report && (
            <div className="space-y-6">
              {/* Proposal outputs */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-850 bg-white space-y-6">
                
                {/* Optimized Headline */}
                <div className="space-y-2.5 pb-5 border-b border-dark-850">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-brand-450 uppercase tracking-widest">Recommended Headline</h4>
                    <button
                      onClick={() => copyToClipboard(report.auditReport?.optimizedHeadline, "headline")}
                      className="px-2.5 py-1 rounded border border-dark-800 bg-white hover:border-brand-500/25 text-dark-300 hover:text-brand-350 text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      {copiedHeadline ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                      {copiedHeadline ? "Copied!" : "Copy Copy"}
                    </button>
                  </div>
                  <div className="p-4 rounded-xl border border-dark-800 bg-dark-950/10 text-xs font-bold text-dark-150 leading-relaxed">
                    {report.auditReport?.optimizedHeadline}
                  </div>
                </div>

                {/* Optimized About Summary */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-brand-450 uppercase tracking-widest">Recommended About Summary</h4>
                    <button
                      onClick={() => copyToClipboard(report.auditReport?.optimizedAbout, "about")}
                      className="px-2.5 py-1 rounded border border-dark-800 bg-white hover:border-brand-500/25 text-dark-300 hover:text-brand-350 text-[10px] font-bold flex items-center gap-1 transition-all"
                    >
                      {copiedAbout ? <FiCheck className="text-emerald-500" /> : <FiCopy />}
                      {copiedAbout ? "Copied!" : "Copy Copy"}
                    </button>
                  </div>
                  <div className="p-4 rounded-xl border border-dark-800 bg-dark-950/10 text-xs text-dark-150 leading-relaxed font-normal whitespace-pre-line italic">
                    "{report.auditReport?.optimizedAbout}"
                  </div>
                </div>
              </div>

              {/* Skills and algorithms tips */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-850 bg-white space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Skills suggestions */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-dark-150 uppercase tracking-widest flex items-center gap-1.5">
                      <FiBookOpen className="text-brand-400" />
                      Keywords & Skills Gaps
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {report.auditReport?.skillsSuggestions?.map((skill, idx) => (
                        <span key={idx} className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider bg-brand-50 border border-brand-200 text-brand-500 rounded-lg">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recruiter visibility */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-dark-150 uppercase tracking-widest flex items-center gap-1.5">
                      <FiTrendingUp className="text-emerald-500" />
                      Visibility Strategies
                    </h4>
                    <ul className="space-y-2 text-xs text-dark-400 leading-relaxed font-normal">
                      {report.auditReport?.visibilityTips?.map((tip, idx) => (
                        <li key={idx} className="flex gap-2 items-start">
                          <span className="text-brand-500 font-bold shrink-0 mt-0.5">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
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
                No profiles audited yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {history.map((item, idx) => (
                  <button
                    key={item.analysisId || idx}
                    onClick={() => setReport(item)}
                    className="w-full p-3.5 rounded-xl border border-dark-850 bg-dark-950/10 hover:border-brand-500/20 text-left space-y-1 transition-all"
                  >
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-brand-350">
                      <span className="truncate max-w-[70%]">{item.headlineSummary}</span>
                      <span className="text-dark-500 font-medium font-semibold shrink-0">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm flex items-start gap-4 bg-brand-500/[0.01]">
            <FiInfo className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-dark-200">Recruiter Search</h4>
              <p className="text-[11px] text-dark-450 leading-relaxed font-normal">
                Recruiters search for keywords to find candidates. Putting your main programming languages directly in your headline helps your profile show up first when they search.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
