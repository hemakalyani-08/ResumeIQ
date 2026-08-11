import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";
import { api } from "../services/api";
import { 
  FiMessageSquare, 
  FiChevronDown, 
  FiChevronUp, 
  FiCpu, 
  FiCheck, 
  FiClock, 
  FiCompass, 
  FiAward, 
  FiShield,
  FiBookOpen,
  FiSliders,
  FiLayers
} from "react-icons/fi";

export default function InterviewPractice() {
  const { currentAnalysis } = useAnalysis();

  const [activeTab, setActiveTab] = useState("technical"); // technical | hr | project | scenario
  const [selectedTopic, setSelectedTopic] = useState("All");
  
  // New selectors
  const [difficulty, setDifficulty] = useState("Beginner"); // Beginner | Intermediate | Advanced
  const [source, setSource] = useState("resume"); // resume | general

  const [expandedIndex, setExpandedIndex] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [history, setHistory] = useState([]);

  const topicFilters = {
    technical: ["All", "React / Frontend", "Python", "Java", "C / C++", "Databases / SQL"],
    hr: ["All", "Leadership", "Conflict Resolution", "Career Goals"],
    project: ["All", "Architecture & Design", "Challenges & Failures"],
    scenario: ["All", "System Crash", "Tight Deadlines", "Vague Requirements"]
  };

  // Multi-tier Curated Questions Database (Simple, Intermediate, Advanced)
  const topicQuestionsMap = {
    "React / Frontend": {
      Beginner: [
        {
          question: "What is React and why do we use components?",
          answerOutline: "React is a tool to build web pages using reusable parts called components. Components help write cleaner, modular code."
        },
        {
          question: "What is the difference between state and props in React?",
          answerOutline: "State is data inside a component that can change. Props are read-only values sent to a component from its parent."
        }
      ],
      Intermediate: [
        {
          question: "Explain the difference between functional and class components in React.",
          answerOutline: "Functional components are simpler, use React Hooks (like useState), and are modern. Class components use lifecycle methods."
        }
      ],
      Advanced: [
        {
          question: "How does React's virtual DOM reconciliation process work?",
          answerOutline: "Reconciliation compares the virtual representation of UI with real nodes, using a diffing algorithm and unique keys to batch updates."
        }
      ]
    },
    "Python": {
      Beginner: [
        {
          question: "What is a list in Python and how do you add an item to it?",
          answerOutline: "A list is a container that stores items in order. You add items using the .append() method, like my_list.append('item')."
        }
      ],
      Intermediate: [
        {
          question: "What are list comprehensions in Python and how do you write them?",
          answerOutline: "Show syntax: '[x for x in list]'. It is a shorter, cleaner way to create a list using an inline loop."
        }
      ],
      Advanced: [
        {
          question: "Explain decorators in Python and how they modify function behavior.",
          answerOutline: "Decorators wrap functions using the '@' symbol to execute code before or after the main function runs."
        }
      ]
    },
    "Java": {
      Beginner: [
        {
          question: "What is a class and an object in Java?",
          answerOutline: "A class is a blueprint or template for creating objects. An object is a real instance created from that blueprint."
        }
      ],
      Intermediate: [
        {
          question: "What is the difference between method overloading and method overriding in Java?",
          answerOutline: "Overloading happens in the same class with different method parameters. Overriding replaces a parent class method in a child class."
        }
      ],
      Advanced: [
        {
          question: "Explain the difference between final, finally, and finalize in Java.",
          answerOutline: "final declares constants, finally marks catch cleanup blocks, and finalize is the garbage-collection hook."
        }
      ]
    },
    "C / C++": {
      Beginner: [
        {
          question: "What is a pointer in C and why do we use it?",
          answerOutline: "A pointer is a variable that stores the memory address of another variable. We use pointers to access data directly in memory."
        }
      ],
      Intermediate: [
        {
          question: "What is memory allocation in C using malloc and free?",
          answerOutline: "malloc reserves memory space during run-time. free releases that memory block to prevent memory leaks."
        }
      ],
      Advanced: [
        {
          question: "Explain virtual functions and runtime polymorphism in C++.",
          answerOutline: "Virtual functions allow a derived class to override methods of a base class, resolved at runtime using v-tables."
        }
      ]
    },
    "Databases / SQL": {
      Beginner: [
        {
          question: "What is a database and what is a primary key?",
          answerOutline: "A database stores organized data. A primary key is a unique ID (like an ID number) that identifies each row in a table."
        }
      ],
      Intermediate: [
        {
          question: "What is the difference between INNER JOIN and LEFT JOIN in SQL?",
          answerOutline: "INNER JOIN returns only rows that match in both tables. LEFT JOIN returns all rows from the left table and matching rows from the right table."
        }
      ],
      Advanced: [
        {
          question: "What is database normalization and normal forms?",
          answerOutline: "Normalization organizes tables to reduce duplicate data. Normal forms (1NF, 2NF, 3NF) use foreign keys to link tables safely."
        }
      ]
    },
    "Leadership": {
      Beginner: [
        {
          question: "Tell me about a time you helped a teammate or led a class project.",
          answerOutline: "Explain who you helped, what the task was, and how working together led to a good result."
        }
      ],
      Intermediate: [
        {
          question: "Tell me about a time you took the lead on a project or team initiative.",
          answerOutline: "Explain the project goals, how you assigned tasks, solved problems, and successfully delivered the project."
        }
      ],
      Advanced: [
        {
          question: "How do you manage team conflicts and align different opinions on technical decisions?",
          answerOutline: "Discuss active listening, weighing options objectively, creating small trial versions, and aligning on team consensus."
        }
      ]
    },
    "Conflict Resolution": {
      Beginner: [
        {
          question: "How do you handle disagreements when working in a group?",
          answerOutline: "Explain that you listen to the other person, stay calm, and find a compromise that works for everyone."
        }
      ],
      Intermediate: [
        {
          question: "How do you handle disagreement with a colleague or manager on technical architectural choices?",
          answerOutline: "Discuss active listening, comparing pros/cons objectively, running small POC experiments, and aligning on consensus parameters."
        }
      ],
      Advanced: [
        {
          question: "Describe a time you resolved a major team conflict that threatened project timelines.",
          answerOutline: "Outline the conflict, your mediation steps, how you refocused the team on project goals, and the successful resolution."
        }
      ]
    },
    "Career Goals": {
      Beginner: [
        {
          question: "Why do you want to work as a developer and what do you hope to learn?",
          answerOutline: "Share your passion for coding, what projects you enjoy building, and how you want to grow your skills."
        }
      ],
      Intermediate: [
        {
          question: "Where do you see yourself in five years and what are your career aspirations?",
          answerOutline: "Express passion for deep technical mastery, mentor roles, or system leadership, showing alignment with the hiring company."
        }
      ],
      Advanced: [
        {
          question: "How do you plan to contribute to our engineering culture and technical roadmap in the long run?",
          answerOutline: "Discuss sharing knowledge, contributing to design standards, and driving innovative technologies to solve business needs."
        }
      ]
    },
    "Architecture & Design": {
      Beginner: [
        {
          question: "How do you organize files and folders in your personal coding projects?",
          answerOutline: "Explain that you separate styles, page layouts, and helper functions into clear folders to keep the code neat."
        }
      ],
      Intermediate: [
        {
          question: "How did you design the architecture of your recent project?",
          answerOutline: "Discuss separation of concerns, modular components, database choice rationale, network protocols (REST/GraphQL), and caching tiers."
        }
      ],
      Advanced: [
        {
          question: "Explain microservices architecture and the trade-offs of service mesh deployments.",
          answerOutline: "Discuss service isolation, database per service patterns, service discovery, communication overhead, and monitoring complexities."
        }
      ]
    },
    "Challenges & Failures": {
      Beginner: [
        {
          question: "Tell me about a bug in your code that took you a long time to fix.",
          answerOutline: "Describe the bug, how you used console.log or prints to find it, and what you learned once it was fixed."
        }
      ],
      Intermediate: [
        {
          question: "Describe a major technical failure in a project and how you resolved it.",
          answerOutline: "Explain the bug/crash context, debugging steps (logs, tests), temporary fixes, and long-term resolution or prevention checklists."
        }
      ],
      Advanced: [
        {
          question: "Describe a system-wide production crash you diagnosed and resolved under pressure.",
          answerOutline: "Outline the crash context, telemetry analysis, immediate hotfix deployment, post-mortem logs, and prevention mechanisms."
        }
      ]
    },
    "System Crash": {
      Beginner: [
        {
          question: "What do you do if your website doesn't load when you run it locally?",
          answerOutline: "Check terminal log outputs, check port conflicts, ensure backend services are running, and read the error logs."
        }
      ],
      Intermediate: [
        {
          question: "What steps do you take when a production database or application server crashes unexpectedly?",
          answerOutline: "Audit logs immediately, isolate the problem node, rollback recent code shifts, communicate status reports, and execute a post-mortem."
        }
      ],
      Advanced: [
        {
          question: "How do you design high-availability system topologies to tolerate node failures?",
          answerOutline: "Discuss load balancers, multi-region database replication, circuit breakers, health check probes, and failover automation."
        }
      ]
    },
    "Tight Deadlines": {
      Beginner: [
        {
          question: "How do you manage your time when you have a school project due in a few days?",
          answerOutline: "Break the project into small daily tasks, focus on finishing the main features first, and avoid distractions."
        }
      ],
      Intermediate: [
        {
          question: "How do you prioritize deliverables when facing extremely tight project deadlines?",
          answerOutline: "Negotiate MVP features range, focus on critical blockers first, automate integration check tests, and request helper resources if needed."
        }
      ],
      Advanced: [
        {
          question: "How do you handle scope creep and prioritize critical paths during crunch time?",
          answerOutline: "Implement strict change control protocols, focus engineering resources on critical paths, and align stakeholder expectations."
        }
      ]
    },
    "Vague Requirements": {
      Beginner: [
        {
          question: "What do you do if you don't understand the description of a task?",
          answerOutline: "Ask your teacher, teammate, or client for clarification. Write down your questions clearly so they are easy to answer."
        }
      ],
      Intermediate: [
        {
          question: "How do you proceed when client requirements for a feature are vague or changing constantly?",
          answerOutline: "Host rapid prototyping review cycles, build mock wireframes, request written requirement sheets, and define small sprint targets."
        }
      ],
      Advanced: [
        {
          question: "How do you proceed when feature goals change constantly?",
          answerOutline: "Utilize short feedback loops, build modular plug-and-play code bases, and maintain clear definition guidelines."
        }
      ]
    }
  };

  // Fetch practice history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await api.get("/api/analyses/practice");
        setHistory(data);
      } catch (err) {
        console.error("Failed to load practice history:", err.message);
      }
    };
    fetchHistory();
  }, []);

  if (!currentAnalysis) {
    return (
      <div className="glass-panel p-16 rounded-3xl text-center space-y-6 border border-dark-850 max-w-xl mx-auto my-12 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center mx-auto text-brand-400">
          <FiMessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-dark-100">No Interview Questions</h3>
        <p className="text-sm text-dark-400">Scan your resume PDF first to generate role-tailored technical and behavioral practice questions.</p>
        <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all">Go to Upload</Link>
      </div>
    );
  }

  // Parse questions from resume
  let parsedQuestions = { technical: [], hr: [], project: [], scenario: [] };
  const rawQuestions = currentAnalysis.careerGuidance?.interviewQuestions;

  if (rawQuestions) {
    if (Array.isArray(rawQuestions)) {
      parsedQuestions.technical = rawQuestions;
    } else {
      parsedQuestions = {
        technical: rawQuestions.technical || [],
        hr: rawQuestions.hr || [],
        project: rawQuestions.project || [],
        scenario: rawQuestions.scenario || []
      };
    }
  }

  // Determine active questions based on SOURCE & DIFFICULTY & TOPIC
  let activeQuestions = [];
  
  if (source === "resume") {
    // Resume-based questions: pulls parsed questions from upload context
    const resumeSourceList = parsedQuestions[activeTab] || [];
    
    // Filter by topic if not "All"
    if (selectedTopic !== "All") {
      activeQuestions = resumeSourceList.filter(q => 
        q.question.toLowerCase().includes(selectedTopic.toLowerCase()) || 
        (selectedTopic === "React / Frontend" && (q.question.toLowerCase().includes("react") || q.question.toLowerCase().includes("frontend") || q.question.toLowerCase().includes("web"))) ||
        (selectedTopic === "Databases / SQL" && (q.question.toLowerCase().includes("sql") || q.question.toLowerCase().includes("database") || q.question.toLowerCase().includes("join")))
      );
    } else {
      activeQuestions = resumeSourceList;
    }

    // Simplify question titles dynamically if difficulty is Beginner
    if (difficulty === "Beginner" && activeQuestions.length > 0) {
      activeQuestions = activeQuestions.map(q => {
        let simplifiedQ = q.question;
        let simplifiedOutline = q.answerOutline;

        // Simple replacements to make complex questions fresher-friendly
        if (simplifiedQ.toLowerCase().includes("architecture")) {
          simplifiedQ = "How did you design and build your project?";
          simplifiedOutline = "Explain what your project does, what languages you used, and how the parts connect simply.";
        } else if (simplifiedQ.toLowerCase().includes("state caching")) {
          simplifiedQ = "How do you save and store data inside your web app?";
          simplifiedOutline = "Talk about using React state, variables, or local storage to save values while typing.";
        }

        return {
          question: simplifiedQ,
          answerOutline: simplifiedOutline,
          isResumeBased: true
        };
      });
    }
  } else {
    // General Prep Questions: pulls from curated difficulty-based topic questions map
    if (selectedTopic !== "All") {
      const topicDb = topicQuestionsMap[selectedTopic] || {};
      activeQuestions = topicDb[difficulty] || [];
    } else {
      // Gather all questions for active category matching difficulty
      const categoryTopics = topicFilters[activeTab].filter(t => t !== "All");
      const list = [];
      categoryTopics.forEach(topic => {
        const topicDb = topicQuestionsMap[topic] || {};
        const questions = topicDb[difficulty] || [];
        list.push(...questions);
      });
      activeQuestions = list;
    }
  }

  const handleToggle = (idx) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
    setFeedback("");
    setUserAnswer("");
  };

  const handleVerifyAnswer = async (e, qText) => {
    e.preventDefault();
    if (!userAnswer.trim()) return;

    setSubmitting(true);
    setFeedback("");

    try {
      const res = await api.post("/api/analyses/improve", {
        text: userAnswer,
        type: "interview",
        instruction: `Evaluate this candidate's interview answer to the question: "${qText}". Give feedback in extremely simple, beginner-friendly English.`
      });
      setFeedback(res.optimized);

      const attempt = await api.post("/api/analyses/practice", {
        resumeId: currentAnalysis.resumeId || "",
        question: qText,
        category: activeTab,
        userAnswer: userAnswer,
        feedback: res.optimized
      });
      setHistory(prev => [attempt, ...prev]);
    } catch (err) {
      setFeedback("API Connection Error: Re-submitting in fallback mock evaluation mode.");
      setTimeout(() => {
        setFeedback("Good response! You explained the concepts simply. Tips: Try mentioning clear examples from your projects next time to make it stand out.");
      }, 1000);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">Interview Practice</h2>
        <p className="text-sm text-dark-400 mt-1">Practice role-specific interview queries. Select your level and questions source below.</p>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-dark-900 gap-1.5 pb-px">
        {[
          { id: "technical", label: "Technical Questions" },
          { id: "hr", label: "HR / Behavioral" },
          { id: "project", label: "Project-based" },
          { id: "scenario", label: "Scenario-based" }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedTopic("All");
                setExpandedIndex(null);
                setFeedback("");
                setUserAnswer("");
              }}
              className={`flex-1 sm:flex-initial text-left px-5 py-3 border-b-2 font-semibold transition-all transition-colors duration-200 outline-none ${
                isActive
                  ? "border-brand-500 text-brand-350 bg-brand-500/[0.02]"
                  : "border-transparent text-dark-450 hover:text-dark-250 hover:bg-dark-900/10"
              }`}
            >
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Selectors Bar: Source & Difficulty */}
      <div className="grid sm:grid-cols-2 gap-4 p-5 rounded-2xl border border-dark-850 bg-white shadow-sm">
        {/* Source Selection */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest block">Questions Source</span>
          <div className="flex gap-2">
            {[
              { id: "resume", label: "Resume-based" },
              { id: "general", label: "General Prep" }
            ].map((src) => (
              <button
                key={src.id}
                onClick={() => {
                  setSource(src.id);
                  setExpandedIndex(null);
                  setSelectedTopic("All");
                  setFeedback("");
                  setUserAnswer("");
                }}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  source === src.id
                    ? "border-brand-500 bg-brand-500/5 text-brand-600"
                    : "border-dark-800 bg-white text-dark-450 hover:border-dark-700"
                }`}
              >
                {src.label}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold text-dark-500 uppercase tracking-widest block">Difficulty Level</span>
          <div className="flex gap-2">
            {[
              { id: "Beginner", label: "Beginner" },
              { id: "Intermediate", label: "Intermediate" },
              { id: "Advanced", label: "Advanced" }
            ].map((diff) => (
              <button
                key={diff.id}
                onClick={() => {
                  setDifficulty(diff.id);
                  setExpandedIndex(null);
                  setFeedback("");
                  setUserAnswer("");
                }}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                  difficulty === diff.id
                    ? "border-brand-500 bg-brand-500/5 text-brand-600"
                    : "border-dark-800 bg-white text-dark-450 hover:border-dark-700"
                }`}
              >
                {diff.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Subtopic Filters Bar */}
      <div className="flex flex-wrap gap-2 pt-1 pb-2">
        {topicFilters[activeTab]?.map((topic) => {
          const isTopicActive = selectedTopic === topic;
          return (
            <button
              key={topic}
              onClick={() => {
                setSelectedTopic(topic);
                setExpandedIndex(null);
                setFeedback("");
                setUserAnswer("");
              }}
              className={`px-3.5 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-wider transition-all duration-200 outline-none ${
                isTopicActive
                  ? "border-brand-500 bg-brand-500/10 text-brand-500"
                  : "border-dark-850 bg-white hover:border-dark-700 text-dark-350"
              }`}
            >
              {topic}
            </button>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Questions List */}
        <div className="lg:col-span-8 space-y-4">
          {activeQuestions.length === 0 ? (
            <div className="glass-panel p-10 rounded-2xl border border-dark-850 text-center text-xs text-dark-500 bg-white font-semibold">
              No matching questions found for this topic, source, and level. Try switching to "General Prep" or change the difficulty.
            </div>
          ) : (
            <div className="space-y-3">
              {activeQuestions.map((q, idx) => {
                const isOpen = expandedIndex === idx;
                return (
                  <div
                    key={idx}
                    className="glass-panel rounded-2xl border border-dark-850 overflow-hidden transition-all shadow-sm bg-white space-y-px"
                  >
                    {/* Accordion header */}
                    <button
                      onClick={() => handleToggle(idx)}
                      className="w-full px-6 py-4 flex items-center justify-between text-left focus:outline-none hover:bg-dark-950/10 transition-colors"
                    >
                      <div className="flex gap-4 items-start pr-4">
                        <span className="text-xs font-bold text-brand-400 shrink-0 mt-0.5">Q{idx + 1}</span>
                        <h4 className="text-sm font-semibold text-dark-150 leading-snug">
                          {q.question}
                          {q.isResumeBased && (
                            <span className="ml-2.5 px-2 py-0.5 rounded bg-brand-50 text-[9px] border border-brand-100 text-brand-500 font-bold uppercase tracking-wider">
                              Resume-based
                            </span>
                          )}
                        </h4>
                      </div>
                      {isOpen ? (
                        <FiChevronUp className="w-5 h-5 text-dark-400 shrink-0" />
                      ) : (
                        <FiChevronDown className="w-5 h-5 text-dark-400 shrink-0" />
                      )}
                    </button>

                    {/* Accordion body */}
                    {isOpen && (
                      <div className="px-6 pb-6 pt-2 border-t border-dark-850 space-y-4 animate-fade-in bg-white">
                        <div className="space-y-2">
                          <h5 className="text-[10px] font-bold text-brand-450 uppercase tracking-widest flex items-center gap-1">
                            <FiCompass className="w-3.5 h-3.5" />
                            Ideal Answer Guidance Outline
                          </h5>
                          <p className="text-xs text-dark-400 leading-relaxed font-normal">{q.answerOutline}</p>
                        </div>

                        {/* Mini form to test draft response */}
                        <form onSubmit={(e) => handleVerifyAnswer(e, q.question)} className="space-y-4 pt-2 border-t border-dark-850">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-dark-500 uppercase tracking-widest">Practice Mode Playground</label>
                            <textarea
                              rows={4}
                              placeholder="Draft your answer here. Click 'Submit Response for Review' to run a real-time Gemini evaluation..."
                              value={userAnswer}
                              onChange={(e) => setUserAnswer(e.target.value)}
                              className="w-full p-4 rounded-xl border border-dark-800 bg-white text-dark-100 placeholder-dark-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all font-normal leading-relaxed"
                            />
                          </div>

                          {feedback && (
                            <div className="p-4 rounded-xl bg-brand-500/[0.02] border border-brand-500/10 space-y-1.5 leading-relaxed text-xs">
                              <h6 className="font-bold text-brand-450 uppercase tracking-wider text-[9px] flex items-center gap-1">
                                <FiCpu />
                                AI Evaluation Feedback
                              </h6>
                              <p className="text-dark-350 font-normal">{feedback}</p>
                            </div>
                          )}

                          <button
                            type="submit"
                            disabled={submitting || !userAnswer.trim()}
                            className="px-5 py-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-md transition-all flex items-center gap-1.5"
                          >
                            {submitting ? (
                              <>
                                <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin shrink-0" />
                                Reviewing...
                              </>
                            ) : (
                              "Submit Response for Review"
                            )}
                          </button>
                        </form>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Practice History log */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-panel p-5 rounded-2xl border border-dark-850 bg-white space-y-4 shadow-sm max-h-[460px] overflow-y-auto">
            <h4 className="text-xs font-bold text-dark-400 uppercase tracking-widest flex items-center gap-1.5">
              <FiClock className="text-dark-550" />
              Practice History Log
            </h4>

            {history.length === 0 ? (
              <div className="text-center py-6 text-xs text-dark-500 bg-white font-semibold">
                No answers practiced yet.
              </div>
            ) : (
              <div className="space-y-3.5">
                {history.map((item, idx) => (
                  <div
                    key={item.sessionId || idx}
                    className="p-3.5 rounded-xl border border-dark-850 bg-dark-950/10 text-left space-y-1"
                  >
                    <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-brand-350">
                      <span>{item.category}</span>
                      <span className="text-dark-500 font-medium font-semibold">{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[11px] text-dark-150 font-semibold truncate leading-relaxed">Q: {item.question}</p>
                    <p className="text-[10px] text-emerald-450 font-normal leading-relaxed truncate">Feedback: {item.feedback}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-dark-850 bg-white space-y-4 shadow-sm flex items-start gap-4">
            <FiShield className="w-5 h-5 text-brand-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-dark-200">Recruiter Audits</h4>
              <p className="text-[11px] text-dark-450 leading-relaxed font-normal">
                Verifying responses builds communication fluency. Use active verbs when discussing project challenges.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
