import React, { useState } from "react";
import { Upload, Lock, Sparkles, FileCheck2, ArrowLeft } from "lucide-react";
import TopBar from "../components/TopBar";
import { reportsAPI } from "../api/api";

export default function UploadReport({ onAnalyze }) {
  const [loading, setLoading] = useState(false);
  const [reportText, setReportText] = useState("");
  const [reportType, setReportType] = useState("CBC");
  const [fileName, setFileName] = useState("");
  const [error, setError] = useState("");

  const analyze = async () => {
    const name = fileName || "demo_report.pdf";
    const text = reportText ||
      "Patient blood test results: Hemoglobin 11.2 g/dL (Low), Glucose Fasting 108 mg/dL (High), Cholesterol Total 228 mg/dL (High), LDL 142 mg/dL (High), White Blood Cells 7.4 K/uL (Normal), Creatinine 0.9 mg/dL (Normal)";

    setLoading(true);
    setError("");
    try {
      const data = await reportsAPI.create(name, reportType, text);
      if (data.success) {
        onAnalyze(data.data.report.id, data.data.summary);
      } else {
        setError(data.error || "Failed to analyze report.");
      }
    } catch {
      setError("Could not connect to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <TopBar title="Upload Medical Report" subtitle="Supports PDF, JPG, PNG — any lab report format" />
      <div className="mx-auto mt-8 max-w-xl">

        {error && (
          <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">{error}</div>
        )}

        {/* File upload area */}
        <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-10 text-center transition hover:border-blue-300">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <Upload className="h-5 w-5 text-blue-600" />
          </div>
          <p className="text-sm font-semibold text-slate-900">Drop your report here</p>
          <p className="mt-1 text-xs text-slate-400">or click to browse files</p>
          <span className="mt-3 inline-block rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
            PDF · JPG · PNG — up to 20 MB
          </span>
        </div>

        {/* Report type selector */}
        <div className="mt-4">
          <label className="block mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          >
            {["CBC", "Lipid Panel", "Diabetes Panel", "Thyroid (TFT)", "Liver (LFT)", "Kidney (RFT)", "Complete Metabolic Panel", "General"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Optional text input */}
        <div className="mt-4">
          <label className="block mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Paste Report Text <span className="font-normal text-slate-400">(optional — or click Analyze Demo below)</span>
          </label>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            rows={4}
            placeholder="Paste your lab report text here..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15"
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            { icon: Lock, label: "End-to-end encrypted" },
            { icon: Sparkles, label: "Results in ~5 seconds" },
            { icon: FileCheck2, label: "Any lab format" },
          ].map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 rounded-xl border border-slate-200 bg-white py-3 text-center">
              <Icon className="h-4 w-4 text-slate-400" />
              <span className="text-[11px] text-slate-500">{label}</span>
            </div>
          ))}
        </div>

        <button
          onClick={analyze}
          disabled={loading}
          className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
        >
          {loading ? "Analyzing report…" : (
            <>Analyze Report <ArrowLeft className="h-4 w-4 rotate-180" /></>
          )}
        </button>
        <p className="mt-3 text-center text-xs text-slate-400">
          No file? Click to analyze a sample CBC + Lipid Panel report
        </p>
      </div>
    </div>
  );
}
