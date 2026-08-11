import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FiUser, FiMail, FiLock, FiAlertCircle, FiArrowRight, FiShield } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import LogoIcon from "../components/common/LogoIcon";

export default function Register() {
  const { signup, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const getErrorMessage = (err) => {
    switch (err.code) {
      case "auth/email-already-in-use":
        return "An account with this email address already exists.";
      case "auth/invalid-email":
        return "Invalid email address format.";
      case "auth/operation-not-allowed":
        return "Email/password signup is not enabled.";
      case "auth/weak-password":
        return "The password is too weak. Choose at least 6 characters.";
      default:
        return err.message || "An error occurred during account creation.";
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) {
      return setError("All fields are required.");
    }
    if (password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords do not match.");
    }

    try {
      setError("");
      setIsSubmitting(true);
      await signup(email, password, name);
      navigate("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignup = async () => {
    try {
      setError("");
      setIsSubmitting(true);
      await loginWithGoogle();
      navigate("/dashboard");
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

        {/* Info Grid */}
        <div className="max-w-md my-auto space-y-8 z-10">
          <h2 className="text-3xl font-extrabold text-dark-100 tracking-tight leading-tight">
            Build a Resume that Outruns the Bots.
          </h2>
          <p className="text-dark-400">
            Create an account to upload your PDF, generate interactive development roadmaps, and optimize key achievements with industry metrics.
          </p>

          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-sm text-dark-350">Completely free parsing and ATS auditing tools</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-sm text-dark-350">Secure profiles containing saved historical reports</p>
            </div>
            <div className="flex gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                ✓
              </div>
              <p className="text-sm text-dark-350">Dynamic practice interview question generation</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 text-dark-500 text-xs z-10">
          <FiShield className="w-4 h-4 text-brand-400" />
          <span>Secured with SSL / TLS session encryption</span>
        </div>
      </div>

      {/* Right panel: Register Form */}
      <div className="flex-grow flex flex-col justify-center px-6 sm:px-12 lg:px-20 py-12 relative">
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
              Create Your Account
            </h1>
            <p className="text-sm text-dark-450 mt-2 text-center lg:text-left">
              Join thousands of job seekers improving their matching chances.
            </p>
          </div>

          {/* Alert messages */}
          {error && (
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-3 text-red-400 text-sm">
              <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleRegister}>
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-dark-800 bg-dark-900/60 text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
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
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-dark-800 bg-dark-900/60 text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  id="password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-dark-800 bg-dark-900/60 text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-semibold text-dark-300 uppercase tracking-wider mb-1.5">
                Confirm Password
              </label>
              <div className="relative">
                <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-500" />
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-dark-800 bg-dark-900/60 text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group mt-2"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
              ) : (
                <>
                  Register
                  <FiArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </>
              )}
            </button>
          </form>

          {/* Social Sign Up Option */}
          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-dark-900"></div>
            <span className="flex-shrink mx-4 text-dark-500 text-xs uppercase tracking-widest font-semibold">Or register with</span>
            <div className="flex-grow border-t border-dark-900"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignup}
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl border border-dark-800 hover:bg-dark-900 text-dark-200 font-semibold text-sm transition-all flex items-center justify-center gap-3 hover:text-dark-100 disabled:opacity-50"
          >
            <FcGoogle className="w-5 h-5" />
            Sign Up with Google
          </button>

          {/* Login switch option */}
          <div className="text-center">
            <p className="text-xs text-dark-500 font-medium">
              Already have an account?{" "}
              <Link to="/login" className="font-semibold text-brand-400 hover:text-brand-300 transition-all">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
