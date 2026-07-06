import React from "react";

export default function Field({ label, hint, ...props }) {
  return (
    <label className="block mb-4">
      <span className="mb-1.5 flex items-baseline justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
        {hint && <span className="text-[11px] font-normal text-slate-400">{hint}</span>}
      </span>
      <input
        {...props}
        className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15"
      />
    </label>
  );
}
