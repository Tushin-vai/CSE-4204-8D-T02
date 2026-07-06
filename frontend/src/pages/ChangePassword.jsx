// src/pages/ChangePassword.jsx
// Backend supports password update via profile PUT — this page uses it
import React, { useState } from "react";
import { ArrowLeft, Lock, Eye, EyeOff } from "lucide-react";
import { profileAPI, authAPI, getUser, clearTokens } from "../api/api";

export default function ChangePassword({ onBack, onLogout }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  const handleChange = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setIsError(true); setMsg("Please fill in all fields."); return;
    }
    if (newPassword.length < 8) {
      setIsError(true); setMsg("New password must be at least 8 characters."); return;
    }
    if (!/[A-Z]/.test(newPassword)) {
      setIsError(true); setMsg("New password must contain at least one uppercase letter."); return;
    }
    if (!/[0-9]/.test(newPassword)) {
      setIsError(true); setMsg("New password must contain at least one number."); return;
    }
    if (newPassword !== confirmPassword) {
      setIsError(true); setMsg("Passwords do not match."); return;
    }

    setLoading(true); setMsg("");

    // Verify current password by trying to login
    const user = getUser();
    const verifyData = await authAPI.login(user?.email, currentPassword);
    if (!verifyData.success) {
      setLoading(false); setIsError(true); setMsg("Current password is incorrect."); return;
    }

    // Update password via profile endpoint
    const data = await profileAPI.update({ password: newPassword });
    setLoading(false);
    if (data.success) {
      setIsError(false);
      setMsg("Password changed successfully! Please login again.");
      setTimeout(() => { clearTokens(); onLogout(); }, 2000);
    } else {
      setIsError(true); setMsg(data.error || "Failed to change password.");
    }
  };

  return (
    <div className="p-6 max-w-md">
      <button onClick={onBack} className="mb-6 flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700">
        <ArrowLeft className="h-4 w-4" /> Back to Profile
      </button>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
            <Lock className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">Change Password</h2>
            <p className="text-xs text-slate-500">Update your account password</p>
          </div>
        </div>

        {msg && (
          <div className={`mb-4 rounded-lg px-4 py-3 text-sm ${isError ? "bg-rose-50 border border-rose-200 text-rose-700" : "bg-emerald-50 border border-emerald-200 text-emerald-700"}`}>
            {msg}
          </div>
        )}

        {/* Current password */}
        <label className="block mb-4">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Current Password</span>
          <div className="relative">
            <input
              type={showCurrent ? "text" : "password"}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15"
            />
            <button type="button" onClick={() => setShowCurrent(!showCurrent)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        {/* New password */}
        <label className="block mb-4">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">New Password</span>
          <div className="relative">
            <input
              type={showNew ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Min. 8 chars + uppercase + number"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 pr-10 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15"
            />
            <button type="button" onClick={() => setShowNew(!showNew)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </label>

        {/* Confirm password */}
        <label className="block mb-6">
          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Confirm New Password</span>
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15"
          />
        </label>

        {/* Password rules */}
        <div className="mb-5 rounded-lg bg-slate-50 p-3">
          <p className="text-xs font-semibold text-slate-500 mb-2">Password requirements:</p>
          {[
            { check: newPassword.length >= 8, label: "At least 8 characters" },
            { check: /[A-Z]/.test(newPassword), label: "One uppercase letter" },
            { check: /[0-9]/.test(newPassword), label: "One number" },
            { check: newPassword === confirmPassword && newPassword !== "", label: "Passwords match" },
          ].map(({ check, label }) => (
            <div key={label} className="flex items-center gap-2 text-xs">
              <span className={check ? "text-emerald-500" : "text-slate-300"}>
                {check ? "✓" : "○"}
              </span>
              <span className={check ? "text-emerald-700" : "text-slate-400"}>{label}</span>
            </div>
          ))}
        </div>

        <button onClick={handleChange} disabled={loading}
          className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-70 transition">
          {loading ? "Changing password…" : "Change Password"}
        </button>
      </div>
    </div>
  );
}
