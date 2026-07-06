import React, { useState } from "react";
import { Activity } from "lucide-react";
import Field from "../components/Field";
import { CONDITIONS } from "../data/mockData";
import { authAPI } from "../api/api";

export default function Register({ goLogin, goApp }) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const toggle = (c) => setSelected((s) => s.includes(c) ? s.filter((x) => x !== c) : [...s, c]);

  const handleRegister = async () => {
    if (!fullName || !email || !password) { setError("Please fill in all required fields."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    setLoading(true);
    setError("");
    try {
      const data = await authAPI.register(fullName, email, password);
      if (data.success) {
        // Auto login after register
        const loginData = await authAPI.login(email, password);
        if (loginData.success) goApp(loginData.data.user);
        else goLogin();
      } else {
        setError(data.error || (data.details ? data.details[0].message : "Registration failed."));
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
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Create Account</h1>
        <p className="mt-1 text-sm text-slate-500">Start analyzing your medical reports</p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-rose-50 border border-rose-200 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <Field label="Full Name" placeholder="Alex Rivera" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      <Field label="Email Address" placeholder="your@email.com" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <Field label="Password" placeholder="Min. 8 characters + uppercase + number" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />

      <div className="mb-5">
        <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
          Existing Conditions <span className="font-normal text-slate-400">(optional)</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <button key={c} type="button" onClick={() => toggle(c)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                selected.includes(c) ? "border-blue-600 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <button
        onClick={handleRegister}
        disabled={loading}
        className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 active:scale-[0.99] disabled:opacity-70"
      >
        {loading ? "Creating account…" : "Create Account"}
      </button>
      <p className="mt-4 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <button onClick={goLogin} className="font-semibold text-blue-600 hover:text-blue-700">Sign in</button>
      </p>
    </div>
  );
}
