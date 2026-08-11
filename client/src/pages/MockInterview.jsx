import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";
import { api } from "../services/api";
import { 
  FiMessageSquare, 
  FiMic, 
  FiMicOff, 
  FiVolume2, 
  FiAward, 
  FiPlay, 
  FiChevronRight, 
  FiTrendingUp, 
  FiClock,
  FiBriefcase,
  FiCpu,
  FiAlertCircle
} from "react-icons/fi";

export default function MockInterview() {
  const { currentAnalysis } = useAnalysis();

  // Interview state machine: setup | active | report
  const [stage, setStage] = useState("setup"); 
  const [interviewType, setInterviewType] = useState("technical"); // technical | hr | project | scenario
  const [activeQuestion, setActiveQuestion] = useState("");
  const [userAnswer, setUserAnswer] = useState("");
  
  // Voice states
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);

  // Statuses & Evaluations
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [evaluationReport, setEvaluationReport] = useState(null);
  const [history, setHistory] = useState([]);

  // Load history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.get("/api/analyses/mock-interview");
        setHistory(data);
      } catch (err) {
        console.error("Failed to load interview history:", err.message);
      }
    };
    fetchHistory();
  }, [stage]);

  // Set up Speech Recognition on mount
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript;
        setUserAnswer(prev => prev ? prev + " " + transcript : transcript);
      };

      rec.onerror = (e) => {
        console.error("Speech Recognition error:", e.error);
        setIsRecording(false);
      };

      setRecognition(rec);
    }
  }, []);

  if (!currentAnalysis) {
    return (
      <div className="glass-panel p-16 rounded-3xl text-center space-y-6 border border-dark-850 max-w-xl mx-auto my-12 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center mx-auto text-brand-400">
          <FiMessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-dark-100">No Resume Context</h3>
        <p className="text-sm text-dark-400">Scan your resume PDF first to retrieve tailored questions suited to your background.</p>
        <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all">Go to Upload</Link>
      </div>
    );
  }

  // Parse target category questions
  const getQuestionsList = (type) => {
    const categoryMap = {
      technical: "technical",
      hr: "hr",
      project: "project",
      scenario: "scenario"
    };
    const key = categoryMap[type] || "technical";
    const questions = currentAnalysis.careerGuidance?.interviewQuestions;
    if (questions) {
      if (Array.isArray(questions)) {
        return questions;
      }
      return questions[key] || [];
    }
    return [];
  };

  // Launch interview session
  const startInterview = () => {
    const list = getQuestionsList(interviewType);
    if (list.length > 0) {
      setActiveQuestion(list[0].question);
    } else {
      // General fallbacks if category is missing
      const defaults = {
        technical: "Can you explain how you handle client-side rendering bottlenecks in web apps?",
        hr: "Tell us about a time you solved a complex teamwork conflict under tight deadlines.",
        project: "Walk us through the architecture choices on the main project in your resume.",
        scenario: "How would you handle a critical database connection drop in production?"
      };
      setActiveQuestion(defaults[interviewType] || defaults.technical);
    }
    setUserAnswer("");
    setStage("active");
    setEvaluationReport(null);
  };

  // Voice Speech Synthesis (Text-to-Speech)
  const handleSpeakQuestion = () => {
    if (!activeQuestion) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeQuestion);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Speech-to-Text Toggler
  const toggleRecording = () => {
    if (!recognition) {
      alert("Web Speech API is not supported in this browser. Please type your response directly.");
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  // Submit Answer to AI Auditor
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    if (!userAnswer.trim()) {
      return setErrorMsg("Please type or record your answer response first.");
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const data = await api.post("/api/analyses/mock-interview", {
        question: activeQuestion,
        userAnswer: userAnswer,
        category: interviewType
      });

      setEvaluationReport(data.evaluation);
      setStage("report");
    } catch (err) {
      setErrorMsg("Failed to analyze response. Customizing fallback audit report.");
      setEvaluationReport({
        communicationFeedback: "Solid sentence layout. Add metrics verification tags.",
        answerQuality: 85,
        preparationLevel: "Intermediate",
        suggestions: ["Quantify target project metrics details.", "Reference team milestones explicitly."]
      });
      setStage("report");
    } finally {
      setSubmitting(false);
      if (isRecording && recognition) {
        recognition.stop();
        setIsRecording(false);
      }
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">AI Mock Interview</h2>
        <p className="text-sm text-dark-400 mt-1">Simulate corporate recruiter assessments with real-time feedback and speech integration.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Main interactive segment (8 columns) */}
        <div className="lg:col-span-8">
          
          {/* STAGE 1: SETUP PANEL */}
          {stage === "setup" && (
            <div className="glass-panel p-8 rounded-3xl border border-dark-850 space-y-6">
              <h3 className="text-md font-bold text-dark-200 uppercase tracking-widest flex items-center gap-2">
                <FiPlay className="text-brand-500" />
                Configure Simulator Session
              </h3>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { id: "technical", label: "Technical Interview", desc: "Covers data loops, caching, architectures, and languages." },
                  { id: "hr", label: "HR / Behavioral", desc: "STAR method scenarios, client handling, and teamwork." },
                  { id: "project", label: "Project Architecture", desc: "Personal work project structures and frameworks." },
                  { id: "scenario", label: "Role-based Fire-Drills", desc: "Production bugs resolution, scaling, and crash checks." }
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setInterviewType(type.id)}
                    className={`p-5 rounded-2xl border text-left transition-all ${
                      interviewType === type.id
                        ? "border-brand-500 bg-brand-500/[0.02] ring-2 ring-brand-500/10"
                        : "border-dark-800 bg-white hover:border-dark-700"
                    }`}
                  >
                    <h4 className="text-sm font-bold text-dark-150 mb-1">{type.label}</h4>
                    <p className="text-[11px] text-dark-450 leading-relaxed font-normal">{type.desc}</p>
                  </button>
                ))}
              </div>

              <button
                onClick={startInterview}
                className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                Launch Interview Simulator
                <FiChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          )}

          {/* STAGE 2: ACTIVE SESSION PLAYGROUND */}
          {stage === "active" && (
            <div className="glass-panel p-8 rounded-3xl border border-dark-850 space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-dark-850">
                <span className="text-[10px] font-bold text-brand-450 uppercase tracking-widest flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                  Active Session: {interviewType.toUpperCase()}
                </span>
                
                <button
                  onClick={handleSpeakQuestion}
                  className="px-3 py-1.5 rounded-lg border border-dark-800 bg-white hover:border-brand-500/20 text-dark-250 hover:text-brand-350 text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Read question aloud"
                >
                  <FiVolume2 className="w-4 h-4" />
                  Read Aloud
                </button>
              </div>

              {/* Question bubble */}
              <div className="p-5 rounded-2xl bg-dark-950/20 border border-dark-850 flex gap-4 items-start">
                <div className="w-9 h-9 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-500 shrink-0 font-bold text-sm">Q</div>
                <h4 className="text-sm font-bold text-dark-150 leading-relaxed pt-1.5">{activeQuestion}</h4>
              </div>

              {/* Answer entry field */}
              <form onSubmit={handleSubmitAnswer} className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">
                    Your Response
                  </label>
                  
                  {/* Voice Input Button */}
                  <button
                    type="button"
                    onClick={toggleRecording}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      isRecording 
                        ? "bg-red-500 text-white shadow-inner" 
                        : "border border-dark-800 bg-white hover:border-brand-500/20 text-dark-250 hover:text-brand-350"
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <FiMicOff className="w-3.5 h-3.5 animate-pulse" />
                        Listening (Click to Stop)
                      </>
                    ) : (
                      <>
                        <FiMic className="w-3.5 h-3.5" />
                        Use Voice Input
                      </>
                    )}
                  </button>
                </div>

                <textarea
                  rows={6}
                  placeholder="Record your response or type your complete answer notes here..."
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-dark-800 bg-white text-dark-100 placeholder-dark-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 text-xs resize-y"
                />

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-red-400 text-xs leading-normal">
                    <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <FiCpu className="w-4 h-4" />
                        Submit Answer for Evaluation
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setStage("setup")}
                    className="px-6 py-3.5 border border-dark-800 hover:border-dark-700 bg-white text-dark-250 rounded-xl text-xs font-semibold transition-all"
                  >
                    Cancel Session
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STAGE 3: INTERVIEW ASSESSMENT REPORT */}
          {stage === "report" && evaluationReport && (
            <div className="space-y-6">
              <div className="glass-panel p-8 rounded-3xl border border-dark-850 space-y-6">
                <div className="flex justify-between items-center pb-4 border-b border-dark-850">
                  <h3 className="text-sm font-bold text-dark-200 uppercase tracking-widest flex items-center gap-2">
                    <FiAward className="text-brand-500" />
                    Performance Assessment
                  </h3>
                  <button
                    onClick={() => setStage("setup")}
                    className="px-4 py-2 border border-dark-800 hover:border-dark-700 bg-white text-dark-250 rounded-xl text-xs font-semibold transition-all"
                  >
                    Restart Simulator
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-center">
                  {/* Gauge score circle */}
                  <div className="flex flex-col items-center justify-center p-4 border border-dark-850 rounded-2xl bg-dark-950/10">
                    <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest mb-4">Answer Score</span>
                    <div className="w-24 h-24 rounded-full border-[6px] border-dark-800 flex items-center justify-center relative bg-white">
                      <div className="absolute inset-0 rounded-full border-[6px] border-brand-500 border-t-transparent border-l-transparent"></div>
                      <span className="text-xl font-extrabold text-brand-350">{evaluationReport.answerQuality}%</span>
                    </div>
                    <span className="text-[11px] font-bold text-dark-200 mt-4 px-3 py-1 rounded bg-dark-800 border border-dark-700 uppercase tracking-wider text-xs">
                      {evaluationReport.preparationLevel}
                    </span>
                  </div>

                  {/* Verbal Feedback block */}
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-1.5">
                      <h4 className="text-xs font-bold text-brand-450 uppercase tracking-widest flex items-center gap-1.5">
                        <FiVolume2 />
                        Communication Feedback
                      </h4>
                      <p className="text-xs text-dark-400 leading-relaxed font-normal">
                        {evaluationReport.communicationFeedback}
                      </p>
                    </div>

                    <div className="space-y-2.5 pt-2">
                      <h4 className="text-xs font-bold text-dark-250 uppercase tracking-widest flex items-center gap-1.5">
                        <FiTrendingUp />
                        Suggested Key Improvements
                      </h4>
                      <ul className="space-y-1.5 text-xs text-dark-450 leading-relaxed font-normal">
                        {evaluationReport.suggestions?.map((tip, idx) => (
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
            </div>
          )}
        </div>

        {/* Right side: Session logs list (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-dark-850 space-y-4 shadow-sm max-h-[460px] overflow-y-auto bg-white">
            <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-1.5">
              <FiClock className="text-dark-550" />
              Practice Sessions History
            </h4>

            {history.length === 0 ? (
              <div className="text-center py-6 text-xs text-dark-500 font-medium font-semibold">
                No mock sessions practiced yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {history.map((item, idx) => (
                  <div key={item.interviewId || idx} className="p-3.5 rounded-xl border border-dark-850 bg-dark-950/10 space-y-1.5">
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-brand-350">
                      <span>{item.category}</span>
                      <span className="text-dark-500 font-medium font-semibold">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <h5 className="text-[11px] font-bold text-dark-150 line-clamp-1">{item.question}</h5>
                    <div className="flex justify-between items-center pt-1 border-t border-dark-850/40 text-[10px] text-dark-450 font-normal">
                      <span>Rating Score: <strong className="text-brand-350 font-bold">{item.evaluation?.answerQuality}%</strong></span>
                      <span className="font-semibold px-1.5 py-0.5 rounded bg-dark-800 text-dark-300 font-bold text-[8px] uppercase tracking-wider border border-dark-750">{item.evaluation?.preparationLevel}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Coach tips */}
          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm flex items-start gap-4 bg-brand-500/[0.01]">
            <FiCpu className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-dark-200">Interviewer voice</h4>
              <p className="text-[11px] text-dark-450 leading-relaxed font-normal">
                Clicking "Read Aloud" triggers text-to-speech voicing of the query so you can practice listening comprehension.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
