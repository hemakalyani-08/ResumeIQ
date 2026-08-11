import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { 
  FiCheckSquare, 
  FiTarget, 
  FiTrendingUp, 
  FiAward, 
  FiMessageSquare, 
  FiMap, 
  FiArrowRight, 
  FiZap 
} from "react-icons/fi";
import LogoIcon from "../components/common/LogoIcon";

export default function Landing() {
  const { currentUser } = useAuth();

  const features = [
    {
      title: "ATS Scoring Engine",
      description: "Analyze scanability, formatting, layout, and keyword density to determine your overall ATS match score.",
      icon: FiCheckSquare,
      color: "from-brand-100/30 to-brand-300/20 text-brand-300"
    },
    {
      title: "Job-Description Matching",
      description: "Compare your resume directly against targeted job descriptions to extract critical missing skills.",
      icon: FiTarget,
      color: "from-brand-300/20 to-brand-700/20 text-brand-300"
    },
    {
      title: "Smart Bullet Optimizer",
      description: "Instantly rewrite weak bullet points with high-impact, quantified action statements that impress recruiters.",
      icon: FiTrendingUp,
      color: "from-emerald-500/20 to-teal-500/20 text-emerald-400"
    },
    {
      title: "Interview Practice Simulator",
      description: "Generate tailored interview questions with ideal answers based on your background and target jobs.",
      icon: FiMessageSquare,
      color: "from-pink-500/20 to-rose-500/20 text-pink-400"
    },
    {
      title: "Personalized Roadmap",
      description: "Receive step-by-step career learning paths complete with recommended certifications to bridge your skill gaps.",
      icon: FiMap,
      color: "from-amber-500/20 to-orange-500/20 text-amber-400"
    },
    {
      title: "AI Career Guidance",
      description: "Discover matching role recommendations and high-priority certifications suited to your experience level.",
      icon: FiAward,
      color: "from-brand-700/20 to-brand-100/30 text-brand-300"
    }
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-dark-50 flex flex-col relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-brand-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-300/10 blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 py-5 flex items-center justify-between border-b border-dark-900/50 sticky top-0 bg-dark-950/80 backdrop-blur-md z-30">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/20">
            <LogoIcon className="w-5 h-5" />
          </div>
          <span className="font-bold text-lg tracking-tight text-gradient">ResumeIQ</span>
        </div>
        <div>
          {currentUser ? (
            <Link
              to="/dashboard"
              className="px-5 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/20 flex items-center gap-2 group"
            >
              Go to Dashboard
              <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-dark-300 hover:text-dark-100 transition-colors">
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-5 py-2 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-md shadow-brand-600/20"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center max-w-5xl mx-auto px-6 py-20 relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-300 text-xs font-semibold mb-8 animate-fade-in shadow-inner">
          <FiZap className="w-3.5 h-3.5" />
          Next-Generation AI Resume Scanner
        </div>

        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-dark-50 mb-6 leading-tight max-w-4xl">
          Optimize Your Resume. <br />
          <span className="text-gradient">Land Your Dream Job.</span>
        </h1>

        <p className="text-md md:text-lg text-dark-400 max-w-2xl mb-10 leading-relaxed font-normal">
          Beat applicant tracking systems (ATS) using AI. Upload your resume, run automated gap analyses, compare with job listings, and practice role-specific interview queries.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            to={currentUser ? "/dashboard" : "/register"}
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-md font-semibold bg-brand-600 hover:bg-brand-500 text-white transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-3 group"
          >
            Start Analyzing Free
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="w-full sm:w-auto px-8 py-4 rounded-xl text-md font-semibold bg-dark-900 hover:bg-dark-800 border border-dark-800 text-dark-200 transition-all flex items-center justify-center"
          >
            Explore Features
          </a>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="features" className="max-w-7xl w-full mx-auto px-6 py-24 border-t border-dark-900/50 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">
            Everything you need to bypass recruitment hurdles
          </h2>
          <p className="text-dark-400 max-w-xl mx-auto">
            ResumeIQ analyzes every line of your document, comparing it to actual data profiles of successful hires.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="glass-panel p-6 rounded-2xl border border-dark-800 hover:border-brand-500/25 transition-all duration-300 group shadow-md"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feat.color} flex items-center justify-center mb-5 font-bold shadow-inner`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-dark-100 mb-2 group-hover:text-brand-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-dark-450 leading-relaxed font-normal">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-dark-900/50 py-8 text-center text-xs text-dark-550 max-w-7xl w-full mx-auto px-6">
        <p>&copy; {new Date().getFullYear()} ResumeIQ. Built for developers and professionals.</p>
      </footer>
    </div>
  );
}
