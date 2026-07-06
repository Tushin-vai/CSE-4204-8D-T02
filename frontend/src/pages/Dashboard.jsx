import React, { useEffect, useState } from "react";
import { Upload, ChevronRight, FileText } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import TopBar from "../components/TopBar";
import StatusBadge from "../components/StatusBadge";
import { GLUCOSE_TREND, RISKS, STAT_CARDS } from "../data/mockData";
import { reportsAPI, getUser } from "../api/api";

export default function Dashboard({ setView, openReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = getUser();

  useEffect(() => {
    reportsAPI.list().then((data) => {
      if (data.success) setReports(data.data.reports);
    }).finally(() => setLoading(false));
  }, []);

  const firstName = user?.full_name?.split(" ")[0] || "there";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  return (
    <div className="p-6 space-y-6">
      <TopBar
        title={`${greeting}, ${firstName}`}
        subtitle={`Welcome to MedInsight — ${reports.length} report(s) on file`}
        action={
          <button onClick={() => setView("upload")}
            className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-blue-700">
            <Upload className="h-4 w-4" /> Upload Report
          </button>
        }
      />

      {/* Stat Cards */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {STAT_CARDS.map((s) => (
          <div key={s.label} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{s.label}</span>
              <StatusBadge status={s.status} />
            </div>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-2xl font-bold text-slate-900">{s.value}</span>
              <span className="text-xs text-slate-400">{s.unit}</span>
            </div>
            {s.note && <p className="mt-0.5 text-xs text-slate-400">{s.note}</p>}
          </div>
        ))}
      </div>

      {/* Chart + Insights */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Glucose Trend</h3>
            <span className="text-xs text-slate-400">Last 6 months · mg/dL</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={GLUCOSE_TREND} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EEF2F7" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#94A3B8" }} axisLine={false} tickLine={false} domain={[70, 110]} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #E2E8F0", fontSize: 12 }} />
              <Line type="monotone" dataKey="value" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3, fill: "#2563EB" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">AI Insights</h3>
            <button onClick={() => setView("assistant")} className="text-xs font-semibold text-blue-600 hover:text-blue-700">Ask AI</button>
          </div>
          <div className="space-y-2.5">
            {RISKS.map((r) => (
              <div key={r.title} className={`rounded-lg px-3 py-2.5 text-xs ${
                r.level === "high" ? "bg-rose-50 text-rose-800" : r.level === "medium" ? "bg-amber-50 text-amber-800" : "bg-blue-50 text-blue-800"
              }`}>
                <p className="font-semibold">{r.title}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Reports from REAL backend */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Reports</h3>
          <button onClick={() => setView("history")} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700">
            View all <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {loading && <p className="text-sm text-slate-400 py-4 text-center">Loading reports…</p>}

        {!loading && reports.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-slate-400">No reports yet.</p>
            <button onClick={() => setView("upload")} className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-700">
              Upload your first report →
            </button>
          </div>
        )}

        <div className="divide-y divide-slate-100">
          {reports.slice(0, 3).map((r) => (
            <button key={r.id} onClick={() => openReport(r.id)}
              className="flex w-full items-center justify-between py-3 text-left hover:bg-slate-50 -mx-1 px-1 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <FileText className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">{r.file_name}</p>
                  <p className="text-xs text-slate-400">
                    {new Date(r.upload_date).toLocaleDateString()} · {r.report_type}
                  </p>
                </div>
              </div>
              <StatusBadge status={r.status === "completed" ? "Normal" : r.status === "failed" ? "Abnormal" : "Monitoring"} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
