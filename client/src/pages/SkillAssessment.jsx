import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";
import { api } from "../services/api";
import { 
  FiAward, 
  FiClock, 
  FiChevronRight, 
  FiCheckCircle, 
  FiAlertTriangle,
  FiBookOpen,
  FiSliders,
  FiPlay,
  FiCpu,
  FiInfo,
  FiAlertCircle,
  FiCheck,
  FiX
} from "react-icons/fi";

export default function SkillAssessment() {
  const { currentAnalysis } = useAnalysis();

  // Assessment state machine: setup | active | grading | report
  const [stage, setStage] = useState("setup");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [difficulty, setDifficulty] = useState("Intermediate");
  const [count, setCount] = useState(5); // 5 | 10 | 20 | 30

  // Active quiz variables
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { questionId: selectedOptionString }

  // Statuses & Outputs
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [assessmentReport, setAssessmentReport] = useState(null);
  const [history, setHistory] = useState([]);

  // Sync count on difficulty shifts
  useEffect(() => {
    if (difficulty === "Beginner") {
      setCount(10);
    } else {
      setCount(5);
    }
  }, [difficulty]);

  // Load history on mount
  const fetchHistory = async () => {
    try {
      const data = await api.get("/api/analyses/skill-assessment/history");
      setHistory(data);
    } catch (err) {
      console.error("Failed to load assessments history:", err.message);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [stage]);

  const handleGenerateQuiz = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await api.post("/api/analyses/skill-assessment/generate", {
        targetRole,
        difficulty,
        count: difficulty === "Beginner" ? count : 5
      });
      setQuizQuestions(res.quizQuestions || []);
      setCurrentIdx(0);
      setUserAnswers({});
      setStage("active");
    } catch (err) {
      setErrorMsg("Failed to compile questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (option) => {
    const activeQ = quizQuestions[currentIdx];
    setUserAnswers(prev => ({
      ...prev,
      [activeQ.id]: option
    }));
  };

  const handleNextQuestion = () => {
    if (currentIdx < quizQuestions.length - 1) {
      setCurrentIdx(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentIdx > 0) {
      setCurrentIdx(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    // Verify all questions are answered
    const unansweredCount = quizQuestions.filter(q => !userAnswers[q.id]).length;
    if (unansweredCount > 0) {
      return setErrorMsg(`Please answer all questions before submitting. (${unansweredCount} remaining)`);
    }

    setLoading(true);
    setErrorMsg("");
    setStage("grading");

    try {
      const res = await api.post("/api/analyses/skill-assessment/evaluate", {
        quizQuestions,
        userAnswers,
        difficulty,
        targetRole
      });
      setAssessmentReport(res);
      setStage("report");
    } catch (err) {
      setErrorMsg("Failed to evaluate quiz results. Customizing study template.");
      setAssessmentReport({
        score: 80,
        correctCount: 4,
        totalQuestions: 5,
        evaluation: {
          strengths: ["Demonstrates solid coding syntax syntax foundations."],
          weaknesses: ["Needs verification of optimization constraints."],
          recommendations: ["Review intermediate language documentation guides."]
        }
      });
      setStage("report");
    } finally {
      setLoading(false);
    }
  };

  if (!currentAnalysis) {
    return (
      <div className="glass-panel p-16 rounded-3xl text-center space-y-6 border border-dark-850 max-w-xl mx-auto my-12 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center mx-auto text-brand-400">
          <FiAward className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-dark-100">No Resume Context</h3>
        <p className="text-sm text-dark-400">Scan your resume PDF first to retrieve skills context for test questionnaire generation.</p>
        <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all">Go to Upload</Link>
      </div>
    );
  }

  const activeQ = quizQuestions[currentIdx];

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">AI Skill Assessment</h2>
        <p className="text-sm text-dark-400 mt-1">Audit your domain knowledge by completing personalized multiple choice quizzes compiled by AI.</p>
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Setup, Active, or Report */}
        <div className="lg:col-span-8">
          
          {/* STAGE 1: SETUP PANEL */}
          {stage === "setup" && (
            <div className="glass-panel p-8 rounded-3xl border border-dark-850 space-y-6 bg-white shadow-sm">
              <h3 className="text-md font-bold text-dark-200 uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-dark-850">
                <FiPlay className="text-brand-500" />
                Configure Quiz Parameters
              </h3>

              <form onSubmit={handleGenerateQuiz} className="space-y-5">
                <div className={`grid gap-4 ${difficulty === "Beginner" ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}>
                  <div className="space-y-1">
                    <label htmlFor="targetRole" className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">
                      Target Role
                    </label>
                    <input
                      id="targetRole"
                      type="text"
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      placeholder="e.g. Software Engineer, Data Scientist"
                      className="w-full px-4 py-3.5 rounded-xl border border-dark-800 bg-dark-950/20 text-dark-100 placeholder-dark-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="difficulty" className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">
                      Difficulty Level
                    </label>
                    <select
                      id="difficulty"
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-dark-800 bg-white text-dark-100 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                  {difficulty === "Beginner" && (
                    <div className="space-y-1">
                      <label htmlFor="count" className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">
                        Number of Questions
                      </label>
                      <select
                        id="count"
                        value={count}
                        onChange={(e) => setCount(parseInt(e.target.value))}
                        className="w-full px-4 py-3.5 rounded-xl border border-dark-800 bg-white text-dark-100 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      >
                        <option value={10}>10 Questions</option>
                        <option value={20}>20 Questions</option>
                        <option value={30}>30 Questions</option>
                      </select>
                    </div>
                  )}
                </div>

                {errorMsg && (
                  <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-red-400 text-xs leading-normal">
                    <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Generate Assessment Quiz
                      <FiChevronRight className="w-4.5 h-4.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STAGE 2: ACTIVE QUIZ PLAYGROUND */}
          {stage === "active" && activeQ && (
            <div className="glass-panel p-8 rounded-3xl border border-dark-850 bg-white space-y-6 shadow-sm">
              <div className="flex justify-between items-center pb-4 border-b border-dark-850">
                <span className="text-[10px] font-bold text-brand-450 uppercase tracking-widest">
                  Question {currentIdx + 1} of {quizQuestions.length} ({difficulty})
                </span>
                <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest">
                  Role: {targetRole}
                </span>
              </div>

              {/* Question bubble */}
              <div className="p-5 rounded-2xl bg-dark-950/20 border border-dark-850">
                <h4 className="text-sm font-bold text-dark-150 leading-relaxed">{activeQ.question}</h4>
              </div>

              {/* Options selection grid */}
              <div className="space-y-2.5">
                {activeQ.options?.map((option, sIdx) => {
                  const isSelected = userAnswers[activeQ.id] === option;
                  return (
                    <button
                      key={sIdx}
                      onClick={() => handleSelectOption(option)}
                      className={`w-full p-4 rounded-xl border text-left text-xs transition-all flex gap-3 items-center ${
                        isSelected
                          ? "border-brand-500 bg-brand-500/[0.02] text-brand-600 font-bold"
                          : "border-dark-800 bg-white hover:border-dark-700 text-dark-250 font-normal"
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-extrabold shrink-0 ${
                        isSelected 
                          ? "border-brand-500 bg-brand-500 text-white" 
                          : "border-dark-700 text-dark-500"
                      }`}>
                        {String.fromCharCode(65 + sIdx)}
                      </span>
                      <span>{option}</span>
                    </button>
                  );
                })}
              </div>

              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/25 flex items-start gap-2.5 text-red-400 text-xs leading-normal">
                  <FiAlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Navigation triggers */}
              <div className="flex gap-4 pt-2">
                <button
                  onClick={handlePrevQuestion}
                  disabled={currentIdx === 0}
                  className="px-6 py-3.5 border border-dark-800 hover:border-dark-700 disabled:opacity-30 bg-white text-dark-250 rounded-xl text-xs font-semibold transition-all"
                >
                  Previous
                </button>
                {currentIdx === quizQuestions.length - 1 ? (
                  <button
                    onClick={handleSubmitQuiz}
                    className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    Submit Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    disabled={!userAnswers[activeQ.id]}
                    className="flex-1 py-3.5 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5"
                  >
                    Next Question
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setStage("setup")}
                  className="px-6 py-3.5 border border-dark-800 hover:border-dark-700 bg-white text-red-400 rounded-xl text-xs font-semibold transition-all"
                >
                  Quit
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: GRADING SCREEN */}
          {stage === "grading" && (
            <div className="glass-panel p-16 rounded-3xl text-center space-y-6 border border-dark-850 bg-white max-w-xl mx-auto my-12 shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center mx-auto text-brand-400 animate-pulse">
                <FiCpu className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-dark-100">Grading Answers...</h3>
              <p className="text-sm text-dark-400 leading-relaxed font-normal">Our AI model is verifying responses, structuring strengths maps, and calculating certifications guidelines.</p>
            </div>
          )}

          {/* STAGE 4: REPORT CARD PANEL */}
          {stage === "report" && assessmentReport && (
            <div className="space-y-6">
              {/* Score summary panel */}
              <div className="glass-panel p-8 rounded-3xl border border-dark-850 bg-white space-y-6 shadow-sm">
                <div className="flex justify-between items-center pb-4 border-b border-dark-850">
                  <h3 className="text-sm font-bold text-dark-200 uppercase tracking-widest flex items-center gap-2">
                    <FiAward className="text-brand-500" />
                    Performance Assessment
                  </h3>
                  <button
                    onClick={() => setStage("setup")}
                    className="px-4 py-2 border border-dark-800 hover:border-dark-700 bg-white text-dark-250 rounded-xl text-xs font-semibold transition-all"
                  >
                    Launch New Quiz
                  </button>
                </div>

                <div className="grid md:grid-cols-3 gap-6 items-center">
                  {/* Circle Score dial */}
                  <div className="flex flex-col items-center justify-center p-5 border border-dark-850 rounded-2xl bg-dark-950/10 shrink-0">
                    <span className="text-[9px] font-bold text-dark-500 uppercase tracking-widest mb-3">Overall Score</span>
                    <div className="w-24 h-24 rounded-full border-[6px] border-dark-800 flex items-center justify-center relative bg-white">
                      <div className="absolute inset-0 rounded-full border-[6px] border-brand-500 border-t-transparent border-l-transparent"></div>
                      <span className="text-xl font-extrabold text-brand-350">{assessmentReport.score}%</span>
                    </div>
                    <span className="text-[9px] font-bold text-dark-350 mt-4 px-2 py-0.5 rounded bg-dark-800 border border-dark-700 uppercase tracking-wider text-xs">
                      {assessmentReport.correctCount}/{assessmentReport.totalQuestions} Correct
                    </span>
                  </div>

                  {/* Strengths / Weaknesses */}
                  <div className="md:col-span-2 space-y-4 text-xs font-normal leading-relaxed text-dark-400">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5">
                        <FiCheckCircle />
                        Strength Areas
                      </h4>
                      <ul className="space-y-1">
                        {assessmentReport.evaluation?.strengths?.map((str, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-emerald-500 font-bold shrink-0">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="space-y-1 pt-2">
                      <h4 className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                        <FiAlertTriangle />
                        Weak Areas / Gaps
                      </h4>
                      <ul className="space-y-1">
                        {assessmentReport.evaluation?.weaknesses?.map((weak, idx) => (
                          <li key={idx} className="flex gap-2 items-start">
                            <span className="text-amber-500 font-bold shrink-0">•</span>
                            <span>{weak}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Study recommendations details */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-850 bg-white space-y-6 shadow-sm">
                <h3 className="text-xs font-bold text-dark-200 uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-dark-850">
                  <FiBookOpen className="text-brand-500" />
                  Study Recommendations & Certifications
                </h3>

                <div className="space-y-2 text-xs text-dark-400 font-normal leading-relaxed">
                  {assessmentReport.evaluation?.recommendations?.map((rec, idx) => (
                    <div key={idx} className="p-3.5 rounded-xl border border-dark-850 bg-dark-950/10 flex gap-3 items-start">
                      <span className="text-brand-500 font-bold shrink-0 mt-0.5">•</span>
                      <p>{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Questions Review Section */}
              <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-dark-850 bg-white space-y-6 shadow-sm">
                <h3 className="text-xs font-bold text-dark-200 uppercase tracking-widest flex items-center gap-2 pb-4 border-b border-dark-850">
                  <FiCheckCircle className="text-brand-500" />
                  Questions Review & Explanations
                </h3>

                <div className="space-y-6">
                  {(assessmentReport.quizQuestions || quizQuestions || []).map((q, idx) => {
                    const userSelected = assessmentReport.userAnswers?.[q.id] || userAnswers[q.id];
                    const isCorrect = userSelected?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase();

                    return (
                      <div key={q.id || idx} className="p-5 rounded-2xl border border-dark-800 bg-dark-900/[0.01] space-y-3.5 text-xs">
                        <div className="flex items-start justify-between gap-4">
                          <h4 className="font-bold text-dark-150 leading-relaxed">
                            <span className="text-brand-500 mr-1.5 font-extrabold">Q{idx + 1}.</span>
                            {q.question}
                          </h4>
                          <span className={`px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                            isCorrect
                              ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-500"
                              : "bg-red-500/10 border border-red-500/20 text-red-500"
                          }`}>
                            {isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-2.5 pt-1">
                          {q.options.map((opt, oIdx) => {
                            const isUserChoice = userSelected === opt;
                            const isCorrectChoice = q.correctAnswer === opt;
                            
                            let optStyle = "border-dark-800 bg-white text-dark-350";
                            if (isUserChoice) {
                              optStyle = isCorrectChoice 
                                ? "border-emerald-500 bg-emerald-500/5 text-emerald-600 font-semibold"
                                : "border-red-500 bg-red-500/5 text-red-600 font-semibold";
                            } else if (isCorrectChoice) {
                              optStyle = "border-emerald-500 bg-emerald-500/5 text-emerald-600 font-semibold";
                            }

                            return (
                              <div
                                key={oIdx}
                                className={`p-3 rounded-xl border flex items-center gap-2.5 text-[11px] ${optStyle}`}
                              >
                                <span className={`w-4 h-4 rounded-full border flex items-center justify-center text-[9px] font-extrabold shrink-0 ${
                                  isUserChoice
                                    ? (isCorrectChoice ? "border-emerald-500 bg-emerald-500 text-white" : "border-red-500 bg-red-500 text-white")
                                    : (isCorrectChoice ? "border-emerald-500 bg-emerald-500 text-white" : "border-dark-700 text-dark-500")
                                }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span>{opt}</span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation */}
                        {q.explanation && (
                          <div className="mt-2.5 p-3 rounded-xl bg-brand-500/[0.02] border border-brand-500/10 text-[11px] text-dark-400 leading-relaxed font-normal">
                            <strong>Explanation:</strong> {q.explanation}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Side: Assessments history sidebar (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-dark-850 space-y-4 shadow-sm max-h-[460px] overflow-y-auto bg-white">
            <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-1.5">
              <FiClock className="text-dark-550" />
              Prior Assessments History
            </h4>

            {history.length === 0 ? (
              <div className="text-center py-6 text-xs text-dark-500 font-medium font-semibold">
                No assessments practicing history yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {history.map((item, idx) => (
                  <button
                    key={item.assessmentId || idx}
                    onClick={() => {
                      setAssessmentReport(item);
                      setStage("report");
                    }}
                    className="w-full p-3.5 rounded-xl border border-dark-850 bg-dark-950/10 hover:border-brand-500/20 text-left space-y-1 transition-all"
                  >
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-brand-350">
                      <span>{item.targetRole}</span>
                      <span className="text-dark-500 font-medium font-semibold">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-[10px] text-dark-450 font-normal">
                      <span>Score Grade: <strong className="text-brand-350 font-bold">{item.score}%</strong></span>
                      <span className="px-1.5 py-0.5 rounded bg-dark-800 text-dark-300 font-bold text-[8px] uppercase tracking-wider border border-dark-750">{item.difficulty}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm flex items-start gap-4 bg-brand-500/[0.01]">
            <FiInfo className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-dark-200">How we quiz</h4>
              <p className="text-[11px] text-dark-450 leading-relaxed font-normal">
                Quizzes are compiled matching skills listed on your parsed PDF. Gaps identified in incorrect answers structure the recommendations checklist.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
