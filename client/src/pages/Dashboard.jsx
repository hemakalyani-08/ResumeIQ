import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAnalysis } from "../context/AnalysisContext";
import { api } from "../services/api";
import { CardSkeleton, ListSkeleton, ChartSkeleton } from "../components/common/SkeletonLoader";
import { 
  FiUploadCloud, 
  FiFileText, 
  FiTarget, 
  FiMessageSquare, 
  FiTrendingUp, 
  FiAward, 
  FiCalendar, 
  FiTrash2, 
  FiChevronRight 
} from "react-icons/fi";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip
} from "recharts";

export default function Dashboard() {
  const { currentUser } = useAuth();
  const { analyses, currentAnalysis, setCurrentAnalysis, deleteAnalysis, loading } = useAnalysis();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-8 animate-fade-in">
        {/* Welcome shimmer */}
        <div className="glass-panel p-8 rounded-3xl border border-dark-850 animate-pulse space-y-3">
          <div className="h-6 bg-dark-800 rounded w-1/4"></div>
          <div className="h-4 bg-dark-800 rounded w-1/2"></div>
        </div>
        
        {/* KPI shimmer */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="glass-panel p-5 rounded-2xl border border-dark-850 animate-pulse space-y-3">
              <div className="h-3 bg-dark-800 rounded w-1/2"></div>
              <div className="h-6 bg-dark-800 rounded w-1/3"></div>
            </div>
          ))}
        </div>

        {/* Panels shimmer */}
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <CardSkeleton />
          </div>
          <div>
            <ChartSkeleton />
          </div>
        </div>
      </div>
    );
  }

  const [jobMatchCount, setJobMatchCount] = useState(0);

  useEffect(() => {
    const fetchJobMatchCount = async () => {
      try {
        const matches = await api.get("/api/analyses/job-matches");
        setJobMatchCount(matches.length);
      } catch (err) {
        console.error("Failed to load matches count:", err.message);
      }
    };
    if (currentUser) {
      fetchJobMatchCount();
    }
  }, [currentUser]);

  // Dynamic Analytics calculations
  const totalResumes = analyses.length;
  
  const avgAtsScore = totalResumes > 0
    ? Math.round(analyses.reduce((sum, item) => sum + item.atsScore, 0) / totalResumes)
    : 0;

  // Calculate common missing skills by aggregating missingKeywords
  const missingSkillsMap = {};
  analyses.forEach(a => {
    const list = a.missingKeywords || [];
    list.forEach(skill => {
      missingSkillsMap[skill] = (missingSkillsMap[skill] || 0) + 1;
    });
  });
  const sortedMissingSkills = Object.entries(missingSkillsMap)
    .sort((a, b) => b[1] - a[1])
    .map(entry => entry[0]);
  const topMissingSkills = sortedMissingSkills.slice(0, 2).join(", ") || "None";

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good morning";
    if (hr < 17) return "Good afternoon";
    return "Good evening";
  };

  const getFirstName = () => {
    if (currentUser?.displayName) {
      return currentUser.displayName.split(" ")[0];
    }
    return "Candidate";
  };

  // Recharts radar chart data for current resume breakdown
  const categoryData = currentAnalysis ? [
    { subject: "Scanability", A: 85, fullMark: 100 },
    { subject: "Formatting", A: 90, fullMark: 100 },
    { subject: "Action Verbs", A: 65, fullMark: 100 },
    { subject: "Grammar", A: 95, fullMark: 100 },
    { subject: "Keywords", A: currentAnalysis.atsScore - 10, fullMark: 100 },
  ] : [];

  // Recharts bar chart showing ATS scores of all uploads in history
  const historyData = [...analyses].reverse().map((a, idx) => ({
    name: `Resume #${idx + 1}`,
    score: a.atsScore
  }));

  const handleSelectResume = (report) => {
    setCurrentAnalysis(report);
    navigate("/report");
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    deleteAnalysis(id);
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative p-6 sm:p-8 rounded-3xl overflow-hidden glass-panel border border-dark-850 glow-brand flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-brand-500/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-bold text-dark-100 tracking-tight">
            {getGreeting()}, <span className="text-gradient font-extrabold">{getFirstName()}</span>!
          </h2>
          <p className="text-sm text-dark-400 max-w-xl leading-relaxed">
            Welcome to your career command center. Upload your resume or review the AI-suggested learning guides to start refining your credentials.
          </p>
        </div>
        {currentAnalysis && (
          <Link
            to="/upload"
            className="px-5 py-3 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-brand-600/20 transition-all shrink-0 flex items-center gap-2 group"
          >
            <FiUploadCloud className="w-4.5 h-4.5" />
            Upload New Resume
            <FiChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        )}
      </div>

      {currentAnalysis ? (
        <>
          {/* Metrics Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="glass-panel p-5 rounded-2xl border border-dark-850 shadow-sm relative overflow-hidden">
              <div className="text-xs font-semibold text-dark-500 uppercase tracking-widest">Average ATS Score</div>
              <div className="text-3xl font-extrabold text-brand-300 mt-2">{avgAtsScore}%</div>
              <div className="text-[11px] text-dark-450 mt-1 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Active Scans History
              </div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-dark-850 shadow-sm">
              <div className="text-xs font-semibold text-dark-500 uppercase tracking-widest">Resumes Analyzed</div>
              <div className="text-3xl font-extrabold text-brand-300 mt-2">{totalResumes}</div>
              <div className="text-[11px] text-dark-450 mt-1">Uploaded PDF files</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-dark-850 shadow-sm">
              <div className="text-xs font-semibold text-dark-500 uppercase tracking-widest">Common Gaps</div>
              <div className="text-xs font-bold text-orange-400 mt-3.5 truncate" title={topMissingSkills}>
                {topMissingSkills}
              </div>
              <div className="text-[11px] text-dark-450 mt-2">Frequent missing skills</div>
            </div>

            <div className="glass-panel p-5 rounded-2xl border border-dark-850 shadow-sm">
              <div className="text-xs font-semibold text-dark-500 uppercase tracking-widest">Job Match Audits</div>
              <div className="text-3xl font-extrabold text-emerald-400 mt-2">{jobMatchCount}</div>
              <div className="text-[11px] text-dark-450 mt-1">Target comparisons</div>
            </div>
          </div>

          {/* Graphs / Detail Sections */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Summary & Areas to Optimize */}
            <div className="lg:col-span-2 space-y-6">
              <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4">
                <h3 className="text-md font-bold text-dark-100 flex items-center gap-2">
                  <FiFileText className="text-brand-400" />
                  Executive Summary
                </h3>
                <p className="text-sm text-dark-400 leading-relaxed font-normal">
                  {currentAnalysis.summary}
                </p>
                <div className="pt-2">
                  <Link
                    to="/report"
                    className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors inline-flex items-center gap-1"
                  >
                    Read Full Detailed Report
                    <FiChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Quick Navigation Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Link to="/job-match" className="glass-panel p-4 rounded-xl border border-dark-850 text-center hover:border-brand-500/20 transition-all group">
                  <FiTarget className="w-5 h-5 mx-auto mb-2 text-brand-300 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-dark-200">Job Match</span>
                </Link>
                <Link to="/improvement" className="glass-panel p-4 rounded-xl border border-dark-850 text-center hover:border-brand-500/20 transition-all group">
                  <FiTrendingUp className="w-5 h-5 mx-auto mb-2 text-emerald-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-dark-200">Optimizations</span>
                </Link>
                <Link to="/interview" className="glass-panel p-4 rounded-xl border border-dark-850 text-center hover:border-brand-500/20 transition-all group">
                  <FiMessageSquare className="w-5 h-5 mx-auto mb-2 text-pink-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-dark-200">Practice Q&A</span>
                </Link>
                <Link to="/career-guide" className="glass-panel p-4 rounded-xl border border-dark-850 text-center hover:border-brand-500/20 transition-all group">
                  <FiAward className="w-5 h-5 mx-auto mb-2 text-purple-400 group-hover:scale-110 transition-transform" />
                  <span className="text-xs font-bold text-dark-200">Career Guide</span>
                </Link>
              </div>
            </div>

            {/* Radar Category Breakdown */}
            <div className="glass-panel p-6 rounded-2xl border border-dark-850 flex flex-col">
              <h3 className="text-md font-bold text-dark-100 mb-4">Profile Breakdown</h3>
              <div className="flex-1 min-h-[220px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart cx="50%" cy="50%" radius="80%" data={categoryData}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis dataKey="subject" stroke="#94a3b8" fontSize={10} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" tick={false} />
                    <Radar name="Resume Score" dataKey="A" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Historical Progress & Recent uploads */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Table of previous resumes */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-dark-850 space-y-4">
              <h3 className="text-md font-bold text-dark-100">Upload History</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-dark-850 text-dark-500 font-semibold text-xs">
                      <th className="pb-3">File Name</th>
                      <th className="pb-3">Analyzed Date</th>
                      <th className="pb-3">ATS Score</th>
                      <th className="pb-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyses.map((a) => (
                      <tr
                        key={a.analysisId}
                        onClick={() => handleSelectResume(a)}
                        className="border-b border-dark-900 last:border-0 hover:bg-dark-900/40 cursor-pointer transition-colors group"
                      >
                        <td className="py-4 font-medium text-dark-200 group-hover:text-brand-300 transition-colors">
                          {a.fileName}
                        </td>
                        <td className="py-4 text-dark-400 text-xs">
                          <span className="flex items-center gap-1.5">
                            <FiCalendar className="w-3.5 h-3.5 text-dark-550" />
                            {new Date(a.createdAt).toLocaleDateString(undefined, {
                              month: "short",
                              day: "numeric",
                              year: "numeric"
                            })}
                          </span>
                        </td>
                        <td className="py-4 font-bold text-brand-400">
                          {a.atsScore}%
                        </td>
                        <td className="py-4 text-right">
                          <button
                            onClick={(e) => handleDelete(e, a.analysisId)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-dark-500 hover:text-red-400 transition-all border border-transparent hover:border-red-500/15"
                            title="Delete resume history"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Score History Line/Bar Chart */}
            <div className="glass-panel p-6 rounded-2xl border border-dark-850 flex flex-col justify-between">
              <div>
                <h3 className="text-md font-bold text-dark-100">Score Progression</h3>
                <p className="text-xs text-dark-500 mt-1">Track your growth metrics over time</p>
              </div>
              <div className="h-[180px] mt-6">
                {historyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={historyData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <XAxis dataKey="name" stroke="#64748b" fontSize={9} tickLine={false} />
                      <YAxis domain={[0, 100]} stroke="#64748b" fontSize={9} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px" }}
                        labelClassName="text-dark-300 text-xs"
                      />
                      <Bar dataKey="score" fill="url(#barGradient)" radius={[4, 4, 0, 0]} barSize={25} />
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#5F9F7A" stopOpacity={0.85} />
                          <stop offset="100%" stopColor="#5F9F7A" stopOpacity={0.15} />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-xs text-dark-550">No score history</div>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-dark-850 max-w-2xl mx-auto space-y-8 animate-fade-in">
          {/* Welcome Banner */}
          <div className="text-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-brand-50/80 border border-brand-200 flex items-center justify-center mx-auto text-brand-500 shadow-sm">
              <FiUploadCloud className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-dark-100">Welcome to ResumeIQ!</h3>
            <p className="text-sm text-dark-400 max-w-md mx-auto leading-relaxed">
              Let's launch your profile optimization checklist. Upload your resume to unlock real-time compliance audits and career guides.
            </p>
          </div>

          {/* Onboarding steps journey mapping */}
          <div className="grid sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-dark-800 bg-dark-900/10 space-y-2 text-left">
              <span className="text-[10px] font-bold text-brand-450 uppercase tracking-widest block">Step 1</span>
              <h4 className="text-xs font-bold text-dark-150">Upload Resume</h4>
              <p className="text-[11px] text-dark-455 leading-relaxed">Submit your PDF resume to parse technical credentials.</p>
            </div>
            <div className="p-4 rounded-xl border border-dark-800 bg-dark-900/10 space-y-2 text-left">
              <span className="text-[10px] font-bold text-brand-450 uppercase tracking-widest block">Step 2</span>
              <h4 className="text-xs font-bold text-dark-150">AI Audit Report</h4>
              <p className="text-[11px] text-dark-455 leading-relaxed">Gemini maps ATS scores, missing keywords, and layout gaps.</p>
            </div>
            <div className="p-4 rounded-xl border border-dark-800 bg-dark-900/10 space-y-2 text-left">
              <span className="text-[10px] font-bold text-brand-450 uppercase tracking-widest block">Step 3</span>
              <h4 className="text-xs font-bold text-dark-150">Interview Prep</h4>
              <p className="text-[11px] text-dark-455 leading-relaxed">Practice mock questions custom tailored to your stack.</p>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link
              to="/upload"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-md shadow-brand-500/10 transition-all group"
            >
              <FiUploadCloud className="w-4.5 h-4.5" />
              Upload Resume
              <FiChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
