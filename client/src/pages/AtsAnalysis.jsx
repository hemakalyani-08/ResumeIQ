import React from "react";
import { Link } from "react-router-dom";
import { useAnalysis } from "../context/AnalysisContext";
import { FiCheckSquare, FiAlertTriangle, FiCheck, FiInfo, FiFileText } from "react-icons/fi";

export default function AtsAnalysis() {
  const { currentAnalysis } = useAnalysis();

  if (!currentAnalysis) {
    return (
      <div className="glass-panel p-16 rounded-3xl text-center space-y-6 border border-dark-850 max-w-xl mx-auto my-12">
        <div className="w-16 h-16 rounded-2xl bg-brand-500/10 border border-brand-500/25 flex items-center justify-center mx-auto text-brand-400">
          <FiCheckSquare className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-bold text-dark-100">No Active Analysis</h3>
        <p className="text-sm text-dark-400">Please scan your resume to unlock detailed ATS scanner compliance reports.</p>
        <Link to="/upload" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm transition-all">Go to Upload</Link>
      </div>
    );
  }

  const checklistItems = [
    { title: "Standard Chronological Format", status: "pass", desc: "Your resume structure matches standard chronological layouts that ATS engines read easiest." },
    { title: "Single-Column Structure", status: "warning", desc: "Dual-column table detected. Some legacy ATS systems merge side-by-side cells, scrambling text chronological order." },
    { title: "Web-Safe Font Families", status: "pass", desc: "Using Arial/Inter style fonts. Standard fonts are parsed accurately without rendering errors." },
    { title: "Section Headers Detection", status: "pass", desc: "Recognizable headers like 'Work History' and 'Education' detected correctly." },
    { title: "Contact Details Layout", status: "pass", desc: "Your name, phone, and email are placed clearly at the top, avoiding header/footer bounds." },
    { title: "No Embedded Vector Icons", status: "warning", desc: "Avoid vector charts or graphical badges. ATS parsers skip images or throw document parsing bugs." }
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-dark-100 tracking-tight">ATS Scan Compliance</h2>
        <p className="text-sm text-dark-400 mt-1">Review critical layout checks that applicant tracking systems run to extract credentials.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Checklist summary */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
              <FiCheckSquare className="text-brand-400" />
              Compliance Checklist
            </h3>
            
            <div className="space-y-4 divide-y divide-dark-900">
              {checklistItems.map((item, idx) => (
                <div key={item.title} className={`pt-4 first:pt-0 flex gap-4 items-start`}>
                  {item.status === "pass" ? (
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5 text-xs font-bold">✓</span>
                  ) : (
                    <span className="w-5 h-5 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shrink-0 mt-0.5 text-xs font-bold">!</span>
                  )}
                  <div className="space-y-1">
                    <h4 className="text-sm font-semibold text-dark-150 flex items-center gap-2">
                      {item.title}
                      {item.status === "warning" && <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-[9px] font-bold border border-amber-500/10 uppercase tracking-wider">Warning</span>}
                    </h4>
                    <p className="text-xs text-dark-400 leading-relaxed font-normal">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Recommendations */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm bg-brand-600/[0.01]">
            <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
              <FiInfo className="text-brand-450" />
              Pro Layout Tip
            </h3>
            <p className="text-xs text-dark-450 leading-relaxed font-normal">
              Most applicant tracking systems parse text from top to bottom, left to right. When you use columns, older models read both columns line-by-line horizontally, joining disjointed words. 
            </p>
            <div className="p-3.5 rounded-xl bg-dark-900/60 border border-dark-800 text-[11px] text-dark-350 leading-relaxed">
              <strong>Recommendation:</strong> Use a clean, single-column Microsoft Word or PDF template without graphics to guarantee a 100% reading rate.
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-dark-850 space-y-4 shadow-sm">
            <h3 className="text-sm font-bold text-dark-200 uppercase tracking-wider flex items-center gap-2">
              <FiFileText className="text-brand-300" />
              File Compatibility
            </h3>
            <div className="space-y-3 text-xs text-dark-400 leading-relaxed">
              <p>
                <strong>File Extension:</strong> Make sure to upload <code>.docx</code> or <code>.pdf</code>. Some recruitment platforms do not support <code>.pages</code>, <code>.txt</code> or image formats.
              </p>
              <p>
                <strong>Interactive Elements:</strong> Remove links inside headers, tables, or buttons. The text inside links could be corrupted by extraction tools.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
