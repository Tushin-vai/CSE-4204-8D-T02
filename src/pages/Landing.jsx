// src/pages/Landing.jsx
// Landing page shown to non-logged-in users
import React from "react";
import { Activity, ArrowRight, Shield, Zap, FileCheck2 } from "lucide-react";

export default function Landing({ goLogin, goRegister }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">

      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600">
            <Activity className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[15px] font-bold tracking-tight">MedReport <span className="text-blue-400">AI</span></span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={goLogin}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition">
            Login
          </button>
          <button onClick={goRegister}
            className="px-4 py-2 text-sm font-semibold bg-blue-600 rounded-lg hover:bg-blue-700 transition">
            Get Started Free
          </button>
        </div>
      </nav>

      {/* Hero */}
      <div className="mx-auto max-w-4xl px-8 pt-20 pb-16 text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-blue-600/20 border border-blue-500/30 px-4 py-1.5 text-xs font-medium text-blue-300 mb-6">
          <Activity className="h-3 w-3" /> AI-Powered Medical Intelligence
        </span>
        <h1 className="text-5xl font-bold leading-tight mb-6">
          Understand Your<br />
          <span className="text-blue-400">Medical Reports</span> Instantly
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl mx-auto mb-10">
          Upload any lab test, blood report, or diagnostic result. Our AI reads every value,
          explains abnormalities in plain language, and flags health risks — in under 5 seconds.
        </p>
        <div className="flex items-center justify-center gap-4">
          <button onClick={goRegister}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold hover:bg-blue-700 transition">
            Analyze Your Report Free <ArrowRight className="h-4 w-4" />
          </button>
          <button onClick={goLogin}
            className="rounded-lg border border-white/20 px-6 py-3 text-sm font-medium text-slate-300 hover:bg-white/5 transition">
            Sign In
          </button>
        </div>
        <p className="mt-4 text-xs text-slate-500">No credit card required · HIPAA-aligned · Instant results</p>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/10 pt-10">
          {[
            { value: "18,000+", label: "Reports analyzed" },
            { value: "4.2s",    label: "Avg. processing time" },
            { value: "99.9%",   label: "Uptime" },
          ].map((s) => (
            <div key={s.label}>
              <p className="text-3xl font-bold text-white">{s.value}</p>
              <p className="mt-1 text-sm text-slate-400">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mx-auto max-w-4xl px-8 pb-20">
        <div className="grid grid-cols-3 gap-6">
          {[
            { icon: Shield,    title: "End-to-end encrypted",  desc: "Your health data is encrypted and never shared with third parties." },
            { icon: Zap,       title: "Results in ~5 seconds", desc: "AI instantly analyzes your report and highlights what matters most." },
            { icon: FileCheck2,title: "Any lab format",        desc: "CBC, Lipid Panel, Thyroid, Diabetes, Liver, Kidney — all supported." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-xl border border-white/10 bg-white/5 p-5">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
                <Icon className="h-5 w-5 text-blue-400" />
              </div>
              <h3 className="mb-1 text-sm font-bold">{title}</h3>
              <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
