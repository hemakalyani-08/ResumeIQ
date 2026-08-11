import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AnalysisProvider } from "./context/AnalysisContext";
import ProtectedRoute from "./components/common/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

// Unauthenticated Pages (None required - routing direct to dashboard/upload)

// Authenticated Pages
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import Report from "./pages/Report";
import AtsAnalysis from "./pages/AtsAnalysis";
import JobMatch from "./pages/JobMatch";
import CareerGuide from "./pages/CareerGuide";
import InterviewPractice from "./pages/InterviewPractice";
import LearningRoadmap from "./pages/LearningRoadmap";
import Chatbot from "./pages/Chatbot";
import MockInterview from "./pages/MockInterview";
import GithubAnalysis from "./pages/GithubAnalysis";
import LinkedinAnalysis from "./pages/LinkedinAnalysis";
import JobRecommendations from "./pages/JobRecommendations";
import SkillAssessment from "./pages/SkillAssessment";
import CareerAssistant from "./pages/CareerAssistant";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AnalysisProvider>
          <Routes>
            {/* Redirect root to upload directly */}
            <Route path="/" element={<Navigate to="/upload" replace />} />

            {/* Private Portal Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Dashboard />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/upload"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Upload />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/report"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Report />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ats-analysis"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <AtsAnalysis />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-match"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <JobMatch />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/career-guide"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CareerGuide />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/interview"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <InterviewPractice />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/roadmap"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LearningRoadmap />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Settings />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/mock-interview"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <MockInterview />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/github-analysis"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <GithubAnalysis />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/linkedin-analysis"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <LinkedinAnalysis />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/job-recommendations"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <JobRecommendations />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/skill-assessment"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <SkillAssessment />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/career-assistant"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <CareerAssistant />
                  </AppLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatbot"
              element={
                <ProtectedRoute>
                  <AppLayout>
                    <Chatbot />
                  </AppLayout>
                </ProtectedRoute>
              }
            />

            {/* Catch All Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnalysisProvider>
      </AuthProvider>
    </Router>
  );
}
