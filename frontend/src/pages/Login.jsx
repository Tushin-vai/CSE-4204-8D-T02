import React, { useState } from "react";
import { Activity } from "lucide-react";
import Field from "../components/Field";
import { authAPI } from "../api/api";

export default function Login({ goRegister, goApp }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Please enter your email and password."); return; }
    setLoading(true);
    setError("");
    try {
      const data = await authAPI.login(email, password);
      if (data.success) {
        goApp(data.data.user);
      } else {
        setError(data.error || "Invalid email or password.");
      }
    } catch {
      setError("Could not connect to server. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-6 text-center">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
          <Activity className="h-5 w-5 text-white" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">MedReport AI</h1>
        <p className="mt-1 text-sm text-slate-500">Sign in to your account</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Field
        label="Email Address"
        placeholder="your@email.com"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <label className="block mb-5">
        <span className="mb-1.5 flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Password</span>
          <button className="text-[11px] font-medium text-blue-600 hover:text-blue-700">Forgot password?</button>
        </span>
        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
          className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15"
        />
      </label>

      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70"
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
      <p className="mt-4 text-center text-sm text-slate-500">
        No account?{" "}
        <button onClick={goRegister} className="font-semibold text-blue-600 hover:text-blue-700">Create one</button>
      </p>
    </div>
  );
}
