import React, { useEffect, useState } from "react";
import { ArrowLeft, Download, ClipboardList, AlertTriangle, CheckCircle2 } from "lucide-react";
import StatusBadge from "../components/StatusBadge";
import { MARKERS, RISKS, RECOMMENDATIONS } from "../data/mockData";
import { reportsAPI, summariesAPI } from "../api/api";

export default function ResultPage({ onBack, reportId }) {
  const [report, setReport] = useState(null);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!reportId) { setLoading(false); return; }
    Promise.all([reportsAPI.get(reportId), summariesAPI.get(reportId)])
      .then(([rData, sData]) => {
        if (rData.success) setReport(rData.data.report);
        if (sData.success) setSummary(sData.data.summary);
      })
      .finally(() => setLoading(false));
  }, [reportId]);

  // Use real key_findings if available, else fallback to mockData
  const markers = summary?.key_findings?.length ? summary.key_findings.map((f) => ({
    name: f.marker, value: f.value, unit: "", range: "", status: f.status,
  })) : MARKERS;

  const abnormal = summary?.abnormal_flags || [];
  const counts = markers.reduce((acc, m) => {
    acc[m.status] = (acc[m.status] || 0) + 1; return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-slate-500">Loading report results…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
        <div className="flex gap-2">
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
          <button className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            <ClipboardList className="h-3.5 w-3.5" /> All Reports
          </button>
        </div>
      </div>

      <div className="mb-5">
        <h1 className="text-lg font-bold text-slate-900">{report?.file_name || "Medical Report"}</h1>
        <p className="text-sm text-slate-500">
          {report ? new Date(report.upload_date).toLocaleDateString() : ""} · {report?.report_type || "General"}
        </p>
      </div>

      {/* AI Summary Banner */}
      <div className="mb-5 rounded-xl bg-blue-600 p-5 text-white">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-blue-100">AI Health Summary · Plain language</p>
            <p className="text-sm leading-relaxed text-blue-50">
              {summary?.summary_text || "Your blood test results show a few areas that need attention. Please consult your doctor for detailed advice."}
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-center gap-1 rounded-lg bg-white/10 px-4 py-2">
            <span className="text-xl font-bold">{markers.length}</span>
            <span className="text-[10px] uppercase tracking-wide text-blue-100">Total markers</span>
          </div>
        </div>
        <div className="mt-4 flex gap-4 text-xs">
          <span><b>{counts.Normal || 0}</b> Normal</span>
          <span><b>{counts.High || 0}</b> High</span>
          <span><b>{counts.Low || 0}</b> Low</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.4fr_1fr]">
        {/* Markers Table */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-3">
            <h3 className="text-sm font-bold text-slate-900">Detected Values</h3>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-2 font-medium">Marker</th>
                <th className="px-2 py-2 font-medium">Value</th>
                <th className="px-2 py-2 font-medium">Range</th>
                <th className="px-5 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {markers.map((m, i) => (
                <tr key={i}>
                  <td className="px-5 py-2.5 font-medium text-slate-800">{m.name}</td>
                  <td className="px-2 py-2.5 text-slate-600">{m.value} {m.unit}</td>
                  <td className="px-2 py-2.5 text-slate-400">{m.range || "—"}</td>
                  <td className="px-5 py-2.5"><StatusBadge status={m.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="space-y-4">
          {/* Abnormal Flags / Risk Warnings */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
              <AlertTriangle className="h-4 w-4 text-amber-500" /> Risk Warnings
            </h3>
            <div className="space-y-3">
              {(abnormal.length ? abnormal : RISKS).map((r, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold text-slate-800">{r.marker || r.title}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{r.reason || r.body}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recommendations */}
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
              <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Recommendations
            </h3>
            <ol className="space-y-2">
              {RECOMMENDATIONS.map((r, i) => (
                <li key={r} className="flex gap-2 text-xs text-slate-600">
                  <span className="font-semibold text-blue-600">{String(i + 1).padStart(2, "0")}.</span>{r}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
