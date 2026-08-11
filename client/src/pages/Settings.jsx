import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAnalysis } from "../context/AnalysisContext";
import { api } from "../services/api";
import { updatePassword, updateProfile } from "firebase/auth";
import { 
  FiSettings, 
  FiUser, 
  FiMail, 
  FiTrash2, 
  FiAlertTriangle, 
  FiCheck, 
  FiKey, 
  FiBell, 
  FiCpu, 
  FiLogOut, 
  FiCalendar 
} from "react-icons/fi";

export default function Settings() {
  const { currentUser, logout } = useAuth();
  const { clearHistory } = useAnalysis();
  const navigate = useNavigate();

  // Local Form States
  const [displayName, setDisplayName] = useState(currentUser?.displayName || "");
  const [headline, setHeadline] = useState("");
  
  // Password States
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  // Preferences States
  const [emailReports, setEmailReports] = useState(true);
  const [roadmapTips, setRoadmapTips] = useState(false);
  const [targetIndustry, setTargetIndustry] = useState("Software Development");
  const [speedMode, setSpeedMode] = useState("standard");

  // UX Feedback States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  // Fetch Preferences on Mount
  useEffect(() => {
    const fetchPrefs = async () => {
      try {
        const prefs = await api.get("/api/analyses/preferences");
        setHeadline(prefs.headline || "");
        if (prefs.notifications) {
          setEmailReports(!!prefs.notifications.emailReports);
          setRoadmapTips(!!prefs.notifications.roadmapTips);
        }
        if (prefs.aiPref) {
          setTargetIndustry(prefs.aiPref.targetIndustry || "Software Development");
          setSpeedMode(prefs.aiPref.speedMode || "standard");
        }
      } catch (err) {
        console.error("Failed to load user preferences:", err.message);
      }
    };

    fetchPrefs();
  }, []);

  // Update Profile & Preferences
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      // 1. Update Firebase Display Name
      if (currentUser && displayName !== currentUser.displayName) {
        await updateProfile(currentUser, { displayName });
      }

      // 2. Save user preferences to Firestore via backend
      await api.post("/api/analyses/preferences", {
        headline,
        notifications: { emailReports, roadmapTips },
        aiPref: { targetIndustry, speedMode }
      });

      setSuccessMsg("Profile and preferences updated successfully!");
    } catch (err) {
      setError(err.message || "Failed to update profile settings.");
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!newPassword) {
      setError("Please enter a new password.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccessMsg("");

    try {
      if (currentUser) {
        await updatePassword(currentUser, newPassword);
        setSuccessMsg("Password updated successfully!");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      setError(err.message || "Failed to change password. Try logging out and back in first.");
    } finally {
      setLoading(false);
    }
  };

  // Clear Scanning History
  const handleClearHistory = () => {
    clearHistory();
    setConfirmClear(false);
    setSuccessMsg("Historical scanning records successfully cleared.");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  // Logout Trigger
  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      setError("Failed to log out.");
    }
  };

  const isPasswordUser = currentUser?.providerData?.[0]?.providerId === "password";

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-dark-100 tracking-tight">Account Settings</h2>
          <p className="text-sm text-dark-400 mt-1">Manage your developer profile preferences and local resume database configurations.</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-red-400 text-sm">
          <FiAlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-emerald-400 text-sm">
          <FiCheck className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid md:grid-cols-12 gap-6">
        {/* Left Side: Forms (8 columns) */}
        <div className="md:col-span-8 space-y-6">
          {/* Form 1: Profile & Preferences */}
          <form onSubmit={handleUpdateProfile} className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-5 shadow-sm">
            <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
              <FiUser className="text-brand-400" />
              Update Profile Details
            </h3>

            <div className="grid sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Full Name</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-dark-800 bg-dark-900/40 text-dark-100 focus:outline-none focus:border-brand-500"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Professional Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Full Stack Engineer"
                  className="w-full px-4 py-3 rounded-xl border border-dark-800 bg-dark-900/40 text-dark-100 focus:outline-none focus:border-brand-500"
                />
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest flex items-center gap-1">
                <FiBell className="w-3.5 h-3.5" />
                Notification Preferences
              </span>
              <div className="space-y-3.5">
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-dark-250">Email Evaluation Reports</h4>
                    <p className="text-[10px] text-dark-500 font-medium">Send detailed ATS scan details directly to email inbox.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailReports}
                    onChange={(e) => setEmailReports(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-dark-900 border-dark-800"
                  />
                </div>
                <div className="flex justify-between items-center">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-bold text-dark-250">Weekly Roadmap Tips</h4>
                    <p className="text-[10px] text-dark-500 font-medium">Receive certified guide updates to bridge skill gaps.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={roadmapTips}
                    onChange={(e) => setRoadmapTips(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-500 focus:ring-brand-500 bg-dark-900 border-dark-800"
                  />
                </div>
              </div>
            </div>

            {/* AI Preferences */}
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest flex items-center gap-1">
                <FiCpu className="w-3.5 h-3.5" />
                AI Analysis Preferences
              </span>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-dark-500 uppercase tracking-wider block">Target Industry Sector</label>
                  <select
                    value={targetIndustry}
                    onChange={(e) => setTargetIndustry(e.target.value)}
                    className="w-full px-4.5 py-3 rounded-xl border border-dark-800 bg-dark-900/60 text-dark-100 focus:outline-none focus:border-brand-500 text-xs"
                  >
                    <option value="Software Development">Software Development</option>
                    <option value="Marketing & Product">Marketing & Product</option>
                    <option value="Business Operations">Business Operations</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-dark-500 uppercase tracking-wider block">Scan Optimization Mode</label>
                  <select
                    value={speedMode}
                    onChange={(e) => setSpeedMode(e.target.value)}
                    className="w-full px-4.5 py-3 rounded-xl border border-dark-800 bg-dark-900/60 text-dark-100 focus:outline-none focus:border-brand-500 text-xs"
                  >
                    <option value="standard">Standard Detailed Analysis</option>
                    <option value="express">Rapid Scoring Checks</option>
                  </select>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs transition-all shadow-md flex items-center justify-center gap-1"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : "Save Profile & Preferences"}
            </button>
          </form>

          {/* Form 2: Password Change (For Password Users Only) */}
          {isPasswordUser && (
            <form onSubmit={handleChangePassword} className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-5 shadow-sm">
              <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
                <FiKey className="text-purple-400" />
                Change Account Password
              </h3>

              <div className="grid sm:grid-cols-2 gap-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-4 py-3 rounded-xl border border-dark-800 bg-dark-900/40 text-dark-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-4 py-3 rounded-xl border border-dark-800 bg-dark-900/40 text-dark-100 focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-all shadow-md"
              >
                Change Password
              </button>
            </form>
          )}

          {/* Danger Zone */}
          <div className="glass-panel p-6 rounded-2xl border border-red-500/10 bg-red-500/[0.005] space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-red-450 uppercase tracking-wider flex items-center gap-2">
              <FiTrash2 className="text-red-400 shrink-0" />
              Danger Zone
            </h3>
            <p className="text-xs text-dark-450 leading-relaxed font-normal">
              Clearing your history is permanent and will wipe all historical ATS audit scores, match profiles, and curriculum guides.
            </p>

            {!confirmClear ? (
              <button
                onClick={() => setConfirmClear(true)}
                className="px-4 py-2.5 rounded-lg border border-red-500/20 hover:bg-red-500/10 text-red-400 text-xs font-semibold transition-all"
              >
                Clear Scanning History
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 space-y-4">
                <div className="flex gap-2.5 items-start text-xs text-red-450 leading-relaxed">
                  <FiAlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block mb-0.5">Are you absolutely sure?</span>
                    This transaction cannot be undone. All resume report nodes will be deleted from your active session.
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleClearHistory}
                    className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition-all"
                  >
                    Yes, Clear Everything
                  </button>
                  <button
                    onClick={() => setConfirmClear(false)}
                    className="px-4 py-2 bg-dark-900 border border-dark-800 hover:bg-dark-850 hover:border-dark-750 text-dark-200 rounded-lg text-xs font-semibold transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Account metadata (4 columns) */}
        <div className="md:col-span-4 space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest">Profile Details</h4>
            
            <div className="space-y-3.5 text-xs text-dark-450 leading-relaxed font-normal">
              <div>
                <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest block mb-1">Email Address</span>
                <span className="text-dark-200 font-semibold flex items-center gap-1.5 truncate">
                  <FiMail className="w-3.5 h-3.5 text-dark-500 shrink-0" />
                  {currentUser?.email}
                </span>
              </div>
              <div className="pt-2 border-t border-dark-900">
                <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest block mb-1">Account Created</span>
                <span className="text-dark-250 font-semibold flex items-center gap-1.5">
                  <FiCalendar className="w-3.5 h-3.5 text-dark-500 shrink-0" />
                  {currentUser?.metadata?.creationTime ? new Date(currentUser.metadata.creationTime).toLocaleDateString() : "Unknown"}
                </span>
              </div>
              <div className="pt-2 border-t border-dark-900">
                <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest block mb-1">Last Sign In</span>
                <span className="text-dark-250 font-semibold flex items-center gap-1.5">
                  <FiClock className="w-3.5 h-3.5 text-dark-500 shrink-0" />
                  {currentUser?.metadata?.lastSignInTime ? new Date(currentUser.metadata.lastSignInTime).toLocaleString([], { hour: '2-digit', minute: '2-digit' }) : "Unknown"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
