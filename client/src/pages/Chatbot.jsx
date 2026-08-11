import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";
import { api } from "../services/api";
import { 
  FiMessageSquare, 
  FiSend, 
  FiTrash2, 
  FiCpu, 
  FiHelpCircle,
  FiUser,
  FiInfo
} from "react-icons/fi";

export default function Chatbot() {
  const { currentAnalysis } = useAnalysis();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const chatEndRef = useRef(null);

  const suggestedQuestions = [
    "How can I improve my resume?",
    "Why is my ATS score low?",
    "Which skills are missing?",
    "How can I improve my projects?",
    "Which jobs match my profile?",
    "What should I learn next?"
  ];

  // Fetch chat history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await api.get("/api/analyses/chatbot");
        setMessages(history);
      } catch (err) {
        console.error("Failed to load chat history:", err.message);
      } finally {
        setInitializing(false);
      }
    };
    fetchHistory();
  }, []);

  // Scroll to bottom whenever messages list grows
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSendMessage = async (textToSend) => {
    if (!textToSend.trim()) return;
    const text = textToSend.trim();
    
    // Clear input
    setInputText("");
    setLoading(true);

    // 1. Add user message locally
    const userMsg = {
      sender: "user",
      text: text,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      // 2. Call backend chatbot API
      const res = await api.post("/api/analyses/chatbot", { message: text });
      
      // 3. Add bot reply locally
      setMessages(prev => [...prev, res.botResponse]);
    } catch (err) {
      console.error("Chatbot submit failed:", err.message);
      // Fallback response if offline/simulation
      const errorReply = {
        sender: "bot",
        text: "I encountered a connection error. Here is a simulated advice snippet: Make sure to detail action verbs and quantify results on your projects section to stand out.",
        createdAt: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorReply]);
    } finally {
      setLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (!window.confirm("Are you sure you want to clear your chat history?")) return;
    try {
      await api.delete("/api/analyses/chatbot");
      setMessages([]);
    } catch (err) {
      console.error("Failed to clear chat history:", err.message);
    }
  };

  if (!currentAnalysis) {
    return (
      <div className="glass-panel p-16 rounded-3xl text-center space-y-6 border border-dark-850 max-w-xl mx-auto my-12 animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center mx-auto text-brand-400">
          <FiMessageSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-dark-100">No Resume Context</h3>
        <p className="text-sm text-dark-400">Scan your resume PDF first to unlock personalized AI career coaching & resume feedback conversation loops.</p>
        <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all">Go to Upload</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col glass-panel rounded-3xl border border-dark-850 overflow-hidden shadow-sm animate-fade-in">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-dark-850 bg-white flex justify-between items-center shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-500">
            <FiCpu className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-dark-100">Career & Resume AI Coach</h3>
            <p className="text-[10px] text-dark-500 font-semibold uppercase tracking-wider">Powered by Gemini 1.5 Flash</p>
          </div>
        </div>
        
        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="p-2 text-dark-450 hover:text-red-400 rounded-lg hover:bg-red-500/5 transition-all border border-transparent hover:border-red-500/10"
            title="Clear conversation history"
          >
            <FiTrash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-dark-950/20">
        {initializing ? (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin"></div>
          </div>
        ) : messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6">
            <div className="w-12 h-12 rounded-xl bg-dark-900 border border-dark-800 flex items-center justify-center text-dark-400">
              <FiMessageSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1.5 max-w-sm">
              <h4 className="text-sm font-bold text-dark-150">Ask me anything about your career</h4>
              <p className="text-xs text-dark-450 leading-relaxed font-normal">
                I have loaded your parsed resume file as context. Ask me how to improve specific bullets, find job fits, or build roadmap milestones!
              </p>
            </div>
            
            {/* Suggested Prompts Grid */}
            <div className="grid sm:grid-cols-2 gap-2.5 max-w-md w-full">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="px-4 py-2.5 rounded-xl border border-dark-800 bg-white hover:border-brand-500/30 text-dark-250 hover:text-brand-350 text-left text-xs font-semibold shadow-sm transition-all"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4.5">
            {messages.map((msg, index) => {
              const isUser = msg.sender === "user";
              return (
                <div key={index} className={`flex gap-3.5 items-start ${isUser ? "justify-end" : "justify-start"}`}>
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-500 shrink-0 text-xs font-bold">
                      <FiCpu className="w-4 h-4" />
                    </div>
                  )}
                  <div className={`max-w-[75%] px-4 py-3 rounded-2xl border text-xs leading-relaxed font-normal shadow-sm ${
                    isUser 
                      ? "bg-brand-600 border-brand-600 text-white rounded-tr-none" 
                      : "bg-white border-dark-850 text-dark-150 rounded-tl-none prose prose-slate"
                  }`}>
                    {msg.text}
                  </div>
                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-dark-900 border border-dark-800 flex items-center justify-center text-dark-400 shrink-0 text-xs font-bold">
                      <FiUser className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bouncing three-dot typing loader */}
            {loading && (
              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-500 shrink-0 text-xs font-bold">
                  <FiCpu className="w-4 h-4" />
                </div>
                <div className="px-4 py-3 bg-white border border-dark-850 rounded-2xl rounded-tl-none flex items-center gap-1">
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                  <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>

      {/* Suggested Questions bottom tray (Only shows if messages exist) */}
      {messages.length > 0 && !loading && (
        <div className="px-6 py-2 bg-dark-950/40 border-t border-dark-850 flex gap-2 overflow-x-auto no-scrollbar shrink-0">
          {suggestedQuestions.slice(0, 4).map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-3.5 py-1.5 rounded-lg border border-dark-800 bg-white hover:border-brand-500/30 text-dark-250 hover:text-brand-350 text-xs font-semibold whitespace-nowrap shadow-sm transition-all"
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Input panel */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputText);
        }}
        className="p-4 border-t border-dark-850 bg-white flex gap-3 items-center shrink-0"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask AI Coach a question (e.g. 'How can I rewrite my work experience?')..."
          disabled={loading}
          className="flex-1 px-4 py-3 rounded-xl border border-dark-800 bg-dark-950/20 text-dark-100 placeholder-dark-500 text-xs focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
        />
        <button
          type="submit"
          disabled={loading || !inputText.trim()}
          className="p-3 bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white rounded-xl shadow-md transition-all flex items-center justify-center shrink-0"
        >
          <FiSend className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
