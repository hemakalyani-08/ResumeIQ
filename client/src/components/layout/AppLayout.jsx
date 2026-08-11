import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FiLayout, 
  FiUploadCloud, 
  FiFileText, 
  FiCheckSquare, 
  FiTarget, 
  FiTrendingUp, 
  FiAward, 
  FiMessageSquare, 
  FiMap, 
  FiSettings, 
  FiLogOut, 
  FiMenu, 
  FiX, 
  FiUser,
  FiMessageCircle,
  FiMic,
  FiGithub,
  FiLinkedin,
  FiBriefcase,
  FiCpu
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import LogoIcon from "../common/LogoIcon";

export default function AppLayout({ children }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigationItems = [
    { name: "Dashboard", path: "/dashboard", icon: FiLayout },
    { name: "AI Career Coach", path: "/career-assistant", icon: FiCpu },
    { name: "Resume Upload", path: "/upload", icon: FiUploadCloud },
    { name: "Resume Report", path: "/report", icon: FiFileText },
    { name: "ATS Analysis", path: "/ats-analysis", icon: FiCheckSquare },
    { name: "Job Match", path: "/job-match", icon: FiTarget },
    { name: "Career Guide", path: "/career-guide", icon: FiAward },
    { name: "Interview Practice", path: "/interview", icon: FiMessageSquare },
    { name: "AI Mock Interview", path: "/mock-interview", icon: FiMic },
    { name: "GitHub Audit", path: "/github-analysis", icon: FiGithub },
    { name: "LinkedIn Audit", path: "/linkedin-analysis", icon: FiLinkedin },
    { name: "Job Recommendations", path: "/job-recommendations", icon: FiBriefcase },
    { name: "Skill Assessment", path: "/skill-assessment", icon: FiAward },
    { name: "Learning Roadmap", path: "/roadmap", icon: FiMap },
    { name: "Resume Chatbot", path: "/chatbot", icon: FiMessageCircle },
    { name: "Settings", path: "/settings", icon: FiSettings },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const getInitials = (user) => {
    if (user?.displayName) {
      const parts = user.displayName.split(" ");
      return parts.map(p => p[0]).join("").toUpperCase().slice(0, 2);
    }
    if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return "RN";
  };

  const currentRouteName = navigationItems.find(item => item.path === location.pathname)?.name || "ResumeIQ";

  return (
    <div className="flex min-h-screen bg-dark-950 text-dark-50">
      {/* Sidebar for Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#E3EEE7] border-r border-dark-850 shrink-0 sticky top-0 h-screen z-20">
        <div className="p-6 border-b border-dark-850 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/10 group-hover:scale-105 transition-transform">
              <LogoIcon className="w-5 h-5" />
            </div>
            <span className="font-bold text-lg tracking-tight text-gradient">ResumeIQ</span>
          </Link>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-brand-100 text-brand-700 border border-brand-100"
                    : "text-dark-400 hover:text-dark-100 hover:bg-brand-100/30 border border-transparent"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-brand-700" : "text-dark-400"}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Info Footer */}
        <div className="p-4 border-t border-dark-850 bg-dark-950/40">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-dark-950/60 border border-dark-850">
            {currentUser?.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt="Profile"
                className="w-10 h-10 rounded-full border border-dark-700"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500/20 to-brand-200/20 border border-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-300">
                {getInitials(currentUser)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-dark-100 truncate">
                {currentUser?.displayName || "Guest User"}
              </p>
              <p className="text-[10px] text-dark-550 truncate">
                {currentUser?.email || "guest-session"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="flex flex-col flex-1 min-w-0">
        <header className="lg:hidden flex items-center justify-between px-6 py-4 glass-panel border-b border-dark-800 sticky top-0 z-30">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-700 flex items-center justify-center shadow-lg">
              <LogoIcon className="w-4 h-4" />
            </div>
            <span className="font-bold text-md tracking-tight text-gradient">ResumeIQ</span>
          </Link>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="p-2 rounded-lg bg-dark-900 border border-dark-800 text-dark-300 hover:text-dark-100 focus:outline-none"
          >
            {mobileOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setMobileOpen(false)}
                className="lg:hidden fixed inset-0 bg-dark-950/80 backdrop-blur-sm z-40"
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="lg:hidden fixed top-0 bottom-0 left-0 w-72 bg-[#E3EEE7] border-r border-dark-800 flex flex-col z-50 p-6"
              >
                <div className="flex items-center justify-between pb-6 border-b border-dark-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-700 flex items-center justify-center">
                      <LogoIcon className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-lg text-gradient">ResumeIQ</span>
                  </div>
                  <button
                    onClick={() => setMobileOpen(false)}
                    className="p-1 rounded-lg hover:bg-dark-900 text-dark-400"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 py-6 space-y-1 overflow-y-auto">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        to={item.path}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-brand-100 text-brand-700 border border-brand-100"
                            : "text-dark-400 hover:text-dark-100 hover:bg-brand-100/30 border border-transparent"
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? "text-brand-700" : "text-dark-400"}`} />
                        {item.name}
                      </Link>
                    );
                  })}
                </nav>

                <div className="pt-6 border-t border-dark-800">
                  <div className="flex items-center gap-3 p-2 rounded-lg bg-dark-900/40">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-sm font-bold text-brand-300">
                      {getInitials(currentUser)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-dark-100 truncate">
                        {currentUser?.displayName || "Guest User"}
                      </p>
                      <p className="text-[10px] text-dark-550 truncate">
                        {currentUser?.email || "guest-session"}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.aside>
            </>
          )}
        </AnimatePresence>

        {/* Content Topbar (Optional stats / greeting) & Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Main Topbar for Desktop Info */}
          <div className="hidden lg:flex items-center justify-between px-8 py-5 border-b border-dark-850 bg-white/80 sticky top-0 backdrop-blur-md z-10">
            <h1 className="text-lg font-semibold text-dark-100">{currentRouteName}</h1>
          </div>

          <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl w-full mx-auto">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
