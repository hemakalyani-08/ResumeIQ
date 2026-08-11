import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiMail, FiLock, FiAlertCircle, FiArrowRight, FiShield } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import LogoIcon from "../components/common/LogoIcon";

export default function Login() {
  const { login, loginWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [resetMode, setResetMode] = useState(false);

  // Helper to format Firebase error codes into human-readable messages
  const getErrorMessage = (err) => {
    switch (err.code) {
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/user-disabled":
        return "This user account has been disabled.";
      case "auth/user-not-found":
        return "No account exists with this email address.";
      case "auth/wrong-password":
        return "Incorrect password. Please try again.";
      case "auth/invalid-credential":
        return "Incorrect email or password.";
      case "auth/too-many-requests":
        return "Too many unsuccessful attempts. Access is temporarily locked.";
      default:
        return err.message || "An authentication error occurred.";
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return setError("Please enter both email and password.");
    }
    try {
      setError("");
      setMessage("");
      setIsSubmitting(true);
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError("");
      setMessage("");
      setIsSubmitting(true);
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (!email) {
      return setError("Please enter your email address to reset your password.");
    }
    try {
      setError("");
      setMessage("");
      setIsSubmitting(true);
      await resetPassword(email);
      setMessage("A password reset email has been sent to your inbox.");
      setResetMode(false);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 text-dark-50 flex flex-col lg:flex-row">
      {/* Left panel: Info Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-brand-900/40 via-dark-900 to-dark-950 p-16 flex-col justify-between relative overflow-hidden border-r border-dark-850">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[100px] pointer-events-none" />
        
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 z-10">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-700 flex items-center justify-center shadow-lg shadow-brand-500/10">
            <LogoIcon className="w-5.5 h-5.5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-gradient">ResumeIQ</span>
        </Link>

        {/* Feature Highlights */}
        <div className="max-w-md my-auto space-y-8 z-10">
          <h2 className="text-3xl font-extrabold text-dark-100 tracking-tight leading-tight">
            Step Into a Faster Recruiting Track.
          </h2>
          <p className="text-dark-400">
            Log in to manage your uploaded resumes, check ATS scoring updates, optimize missing skill gaps, and explore role roadmaps dynamically.
          </p>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-sm text-dark-350">Secure session state management via Firebase</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-sm text-dark-350">Single Sign-On (SSO) with your Google Account</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-sm text-dark-350">Automated JWT auth token verification</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-dark-500 text-xs z-10">
          <FiShield className="w-4 h-4 text-brand-400" />
          <span>AES-256 encrypted authentication protocol</span>
        </div>
      </div>

      {/* Right panel: Login Form */}
      <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 relative">
        <div className="max-w-md w-full mx-auto space-y-8 animate-fade-in">
          {/* Header */}
          <div>
            <div className="lg:hidden flex justify-center mb-8">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-brand-700 flex items-center justify-center shadow-lg">
                  <LogoIcon className="w-4.5 h-4.5" />
                </div>
                <span className="font-bold text-lg text-gradient">ResumeIQ</span>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-100 tracking-tight text-center lg:text-left">
              {resetMode ? "Reset Your Password" : "Welcome Back"}
            </h1>
            <p className="text-sm text-dark-450 mt-2 text-center lg:text-left">
              {resetMode 
                ? "Enter your email address and we'll send you a link to reset your password." 
                : "Enter your credentials to access your resume portfolio."}
            </p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-red-400 text-sm">
              <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {message && (
            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 flex items-start gap-3 text-emerald-400 text-sm">
              <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{message}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={resetMode ? handlePasswordReset : handleEmailLogin}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-dark-800 bg-dark-900/60 text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                  required
                />
              </div>
            </div>

            {!resetMode && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-xs font-semibold text-dark-300 uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetMode(true);
                      setError("");
                      setMessage("");
                    }}
                    className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                  <input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-dark-800 bg-dark-900/60 text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : resetMode ? (
                "Send Reset Link"
              ) : (
                <>
                  Sign In
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign In Option */}
          {!resetMode && (
            <>
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-dark-900"></div>
                <span className="flex-shrink mx-4 text-dark-500 text-xs uppercase tracking-widest font-semibold">Or continue with</span>
                <div className="flex-grow border-t border-dark-900"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isSubmitting}
                className="w-full py-3 rounded-xl border border-dark-800 hover:bg-dark-900 text-dark-200 font-semibold text-sm transition-all flex items-center justify-center gap-3 hover:text-dark-100 disabled:opacity-50"
              >
                <FcGoogle className="w-5 h-5" />
                Continue with Google
              </button>
            </>
          )}

          {/* Back/Switch option */}
          <div className="text-center">
            {resetMode ? (
              <button
                type="button"
                onClick={() => {
                  setResetMode(false);
                  setError("");
                  setMessage("");
                }}
                className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors focus:outline-none"
              >
                Back to Sign In
              </button>
            ) : (
              <p className="text-xs text-dark-500 font-medium">
                Don't have an account?{" "}
                <Link to="/register" className="font-semibold text-brand-400 hover:text-brand-300 transition-all">
                  Create an account
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
