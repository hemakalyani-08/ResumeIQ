import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  auth, 
  googleProvider,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  signInAnonymously
} from "../services/firebase";
import LogoIcon from "../components/common/LogoIcon";

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Email and Password Signup
  function signup(email, password, displayName) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        if (displayName) {
          return updateProfile(userCredential.user, { displayName })
            .then(() => userCredential.user);
        }
        return userCredential.user;
      });
  }

  // Email and Password Login
  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Google Login
  function loginWithGoogle() {
    return signInWithPopup(auth, googleProvider);
  }

  // Logout
  function logout() {
    return signOut(auth);
  }

  // Reset Password
  function resetPassword(email) {
    return sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    let active = true;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!active) return;
      if (user) {
        setCurrentUser(user);
        setLoading(false);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (e) {
          console.warn("Failed to sign in anonymously, falling back to mock user:", e);
          if (active) {
            setCurrentUser({
              uid: "mock-user-123",
              email: "local-developer@resumenova.ai",
              displayName: "Nova Developer"
            });
            setLoading(false);
          }
        }
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {loading ? (
        <div className="min-h-screen bg-dark-950 flex flex-col items-center justify-center">
          <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-brand-500/10"></div>
            <div className="absolute inset-0 rounded-full border-t-4 border-l-4 border-brand-400 animate-spin"></div>
            <LogoIcon className="w-6 h-6 text-brand-400" />
          </div>
          <div className="text-xl font-semibold text-gradient animate-pulse-subtle">
            ResumeIQ
          </div>
          <div className="text-xs text-dark-500 mt-1 tracking-wider">
            SECURELY LOADING SESSION
          </div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}
