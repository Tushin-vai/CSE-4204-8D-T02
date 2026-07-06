import React from "react";
import { Activity } from "lucide-react";

export default function Logo({ light }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
        <Activity className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
      </div>
      <span className={`text-[15px] font-bold tracking-tight ${light ? "text-white" : "text-slate-900"}`}>
        MedReport <span className="text-blue-500">AI</span>
      </span>
    </div>
  );
}
