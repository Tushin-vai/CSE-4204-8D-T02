import React, { useEffect, useState } from "react";
import { Search, Eye, Trash2 } from "lucide-react";
import TopBar from "../components/TopBar";
import StatusBadge from "../components/StatusBadge";
import { reportsAPI } from "../api/api";

const statusMap = (s) => s === "completed" ? "Normal" : s === "failed" ? "Abnormal" : "Monitoring";

export default function ReportHistory({ openReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [deleting, setDeleting] = useState(null);

  const load = () => {
    setLoading(true);
    reportsAPI.list().then((data) => {
      if (data.success) setReports(data.data.reports);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this report?")) return;
    setDeleting(id);
    await reportsAPI.delete(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    setDeleting(null);
  };

  const filtered = reports.filter((r) =>
    r.file_name.toLowerCase().includes(q.toLowerCase()) ||
    r.report_type.toLowerCase().includes(q.toLowerCase())
  );

  return (
    <div className="p-6">
      <TopBar title="Report History" subtitle={`${reports.length} report(s) on file`} />

      <div className="mt-4 mb-3 flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Search reports..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {loading ? (
          <div className="py-12 text-center text-sm text-slate-400">Loading reports…</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            {reports.length === 0 ? "No reports yet. Upload your first one!" : "No reports match your search."}
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-400">
                <th className="px-5 py-3 font-medium">Report</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3">
                    <button onClick={() => openReport(r.id)} className="text-left">
                      <p className="font-medium text-slate-800">{r.file_name}</p>
                      <p className="text-xs text-slate-400">
                        {new Date(r.upload_date).toLocaleDateString()}
                      </p>
                    </button>
                  </td>
                  <td className="px-3 py-3 text-slate-500">{r.report_type}</td>
                  <td className="px-3 py-3"><StatusBadge status={statusMap(r.status)} /></td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end gap-3 text-slate-400">
                      <button onClick={() => openReport(r.id)} className="hover:text-blue-600">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(r.id)}
                        disabled={deleting === r.id}
                        className="hover:text-rose-600 disabled:opacity-40"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
