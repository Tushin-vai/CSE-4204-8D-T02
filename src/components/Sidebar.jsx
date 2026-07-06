import React from "react";
import {
  Upload, MessageSquare, User, LayoutDashboard, ClipboardList, LogOut,
} from "lucide-react";
import Logo from "./Logo";

export const NAV_ITEMS = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "upload", label: "Upload Report", icon: Upload },
  { key: "history", label: "Report History", icon: ClipboardList },
  { key: "assistant", label: "AI Assistant", icon: MessageSquare },
  { key: "profile", label: "Profile", icon: User },
];

export default function Sidebar({ view, setView, onLogout }) {
  return (
    <aside className="hidden md:flex md:w-60 md:flex-col md:shrink-0 bg-[#0B1220] text-slate-300">
      <div className="px-5 py-5 border-b border-white/10">
        <Logo light />
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setView(key)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              view === key ? "bg-blue-600 text-white" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"
            }`}
          >
            <Icon className="h-4 w-4" strokeWidth={2} />
            {label}
          </button>
        ))}
      </nav>
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-400 hover:bg-white/5 hover:text-slate-100"
        >
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </aside>
  );
}
