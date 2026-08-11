import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";
import { FiUploadCloud, FiFile, FiTrash2, FiAlignLeft, FiAlertCircle, FiTrendingUp } from "react-icons/fi";
import { extractErrorMessage } from "../services/api";

export default function Upload() {
  const { analyzeResume, isAnalyzing, analysisProgress, progressText } = useAnalysis();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (selectedFile) => {
    setError("");
    if (selectedFile.type !== "application/pdf") {
      return setError("Only PDF files are supported currently.");
    }
    // Limit to 5MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      return setError("File size exceeds 5MB limit.");
    }
    setFile(selectedFile);
  };

  const handleRemoveFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      return setError("Please upload your resume PDF first.");
    }
    try {
      setError("");
      await analyzeResume(file, jobDescription);
      navigate("/report");
    } catch (err) {
      console.error("Resume analysis failed:", err);
      setError(extractErrorMessage(err));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 relative">
      {/* Simulation Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-dark-950/90 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full border-4 border-brand-500/10 animate-pulse-subtle"></div>
              {/* Spinning gradient border */}
              <div className="absolute inset-0 rounded-full border-t-4 border-l-4 border-brand-400 animate-spin"></div>
              {/* Numerical indicator */}
              <div className="absolute inset-0 flex items-center justify-center font-bold text-lg text-brand-300">
                {analysisProgress}%
              </div>
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-dark-100">AI Analysis in Progress</h3>
              <p className="text-sm text-dark-400 min-h-[40px] px-4">
                {progressText}
              </p>
            </div>

            {/* Horizontal progress bar */}
            <div className="w-full h-1.5 bg-dark-900 rounded-full overflow-hidden border border-dark-850">
              <div 
                className="h-full bg-gradient-to-r from-brand-500 to-brand-700 rounded-full transition-all duration-300"
                style={{ width: `${analysisProgress}%` }}
              ></div>
            </div>

            <div className="text-[10px] text-dark-500 uppercase tracking-widest font-semibold flex items-center justify-center gap-1.5">
              <FiTrendingUp className="text-brand-450 animate-bounce" />
              Calibrating with Gemini 1.5 Flash Model
            </div>
          </div>
        </div>
      )}

      <div>
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">ATS Audit Engine</h2>
        <p className="text-sm text-dark-400 mt-1">
          Upload your resume PDF and optionally paste your target job listing to pinpoint critical keyword matches.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/25 flex items-center justify-between gap-3 text-red-400 text-sm animate-fade-in no-print">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={(e) => {
              if (fileInputRef.current?.files?.length || file) {
                handleAnalyze(e);
              } else {
                setError("Please select a resume PDF file to upload first.");
              }
            }}
            className="px-3.5 py-1.5 bg-red-650 hover:bg-red-550 text-white rounded-lg text-xs font-semibold shrink-0 transition-all shadow-sm"
          >
            Retry Scan
          </button>
        </div>
      )}

      <form onSubmit={handleAnalyze} className="space-y-6">
        {/* File upload drag-and-drop zone */}
        <div className="space-y-2">
          <label className="block text-xs font-semibold text-dark-300 uppercase tracking-wider">
            Resume PDF File
          </label>
          
          {!file ? (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-brand-500 bg-brand-500/5 shadow-lg shadow-brand-500/5"
                  : "border-dark-800 bg-dark-900/35 hover:border-dark-700 hover:bg-dark-900/50"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-14 h-14 rounded-2xl bg-dark-800 border border-dark-700 flex items-center justify-center mx-auto mb-4 text-dark-400">
                <FiUploadCloud className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-dark-200">
                Drag and drop your resume here, or{" "}
                <span className="text-brand-400 hover:underline">browse files</span>
              </p>
              <p className="text-xs text-dark-500 mt-2">
                Supported formats: PDF (max. 5MB)
              </p>
            </div>
          ) : (
            <div className="p-5 rounded-2xl border border-dark-800 bg-dark-900/40 flex items-center justify-between">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 text-brand-400 flex items-center justify-center shrink-0">
                  <FiFile className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-dark-200 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-dark-500 mt-0.5">
                    {(file.size / 1024 / 1024).toFixed(2)} MB • PDF File
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-2 rounded-lg hover:bg-red-500/10 text-dark-500 hover:text-red-400 border border-transparent hover:border-red-500/15 transition-all"
                title="Remove uploaded resume"
              >
                <FiTrash2 className="w-4.5 h-4.5" />
              </button>
            </div>
          )}
        </div>

        {/* Job Description paste zone */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="jd" className="block text-xs font-semibold text-dark-300 uppercase tracking-wider flex items-center gap-1.5">
              <FiAlignLeft className="text-dark-500" />
              Job Description (Optional)
            </label>
            <span className="text-[10px] text-dark-500 font-semibold uppercase tracking-wider">
              {jobDescription.length} characters
            </span>
          </div>
          <textarea
            id="jd"
            rows={6}
            placeholder="Paste target job listing description here to audit skill matches and extract critical industry keywords..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-dark-800 bg-dark-900/60 text-dark-100 placeholder-dark-550 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all text-sm resize-y min-h-[120px]"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all shadow-lg shadow-brand-600/25 flex items-center justify-center gap-2.5 group"
        >
          <FiTrendingUp className="w-4.5 h-4.5" />
          Analyze Resume
        </button>
      </form>
    </div>
  );
}
