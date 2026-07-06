import React, { useEffect, useState } from "react";
import { Edit2, Mail, User, Save, X, Lock } from "lucide-react";
import TopBar from "../components/TopBar";
import Toggle from "../components/Toggle";
import { profileAPI, reportsAPI, getUser, setUser } from "../api/api";

export default function Profile({ onChangePassword }) {
  const [profile, setProfile] = useState(getUser() || {});
  const [reportCount, setReportCount] = useState(0);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    profileAPI.get().then((data) => {
      if (data.success) { setProfile(data.data.user); setUser(data.data.user); }
    });
    reportsAPI.list().then((data) => {
      if (data.success) setReportCount(data.data.count);
    });
  }, []);

  const startEdit = () => { setFullName(profile.full_name || ""); setEmail(profile.email || ""); setEditing(true); setMsg(""); };

  const save = async () => {
    if (!fullName.trim()) { setIsError(true); setMsg("Full name cannot be empty."); return; }
    setSaving(true);
    const data = await profileAPI.update({ full_name: fullName, email });
    if (data.success) {
      setProfile(data.data.user); setUser(data.data.user);
      setIsError(false); setMsg("Profile updated!"); setEditing(false);
    } else { setIsError(true); setMsg(data.error || "Update failed."); }
    setSaving(false);
  };

  const initials = profile.full_name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() || "?";

  return (
    <div className="p-6">
      <TopBar title="Profile" subtitle="Manage your account and health settings"
        action={!editing ? (
          <button onClick={startEdit} className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => { setEditing(false); setMsg(""); }} className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
            <button onClick={save} disabled={saving} className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-70">
              <Save className="h-3.5 w-3.5" /> {saving ? "Saving…" : "Save"}
            </button>
          </div>
        )}
      />

      {msg && (
        <div className={`mt-3 rounded-lg px-4 py-3 text-sm ${isError ? "bg-rose-50 border border-rose-200 text-rose-700" : "bg-emerald-50 border border-emerald-200 text-emerald-700"}`}>{msg}</div>
      )}

      <div className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-lg font-bold text-blue-700">{initials}</div>
          <div>
            <p className="text-base font-bold text-slate-900">{profile.full_name || "—"}</p>
            <p className="text-sm text-slate-500">{profile.email || "—"}</p>
            <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
              {profile.is_verified ? "✓ Verified" : profile.role || "user"}
            </span>
          </div>
        </div>

        {editing ? (
          <div className="mt-5 border-t border-slate-100 pt-5 space-y-4">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Full Name</span>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)}
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15" />
            </label>
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Email</span>
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                className="mt-1 w-full rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm outline-none focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/15" />
            </label>
          </div>
        ) : (
          <div className="mt-5 grid grid-cols-2 gap-4 border-t border-slate-100 pt-5">
            {[{ icon: Mail, label: "Email", value: profile.email }, { icon: User, label: "Role", value: profile.role }].map(({ icon: Icon, label, value }) => (
              <div key={label}>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400"><Icon className="h-3.5 w-3.5" /> {label}</p>
                <p className="mt-1 text-sm font-medium text-slate-800">{value || "—"}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Account Summary</h3>
        <div className="grid grid-cols-3 gap-3">
          {[{ label: "Total Reports", value: reportCount }, { label: "Member Since", value: profile.created_at ? new Date(profile.created_at).toLocaleDateString() : "—" }, { label: "Account", value: profile.is_verified ? "Verified ✓" : "Active" }].map((s) => (
            <div key={s.label} className="rounded-lg bg-slate-50 p-3 text-center">
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
              <p className="text-[11px] text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="mb-4 text-sm font-bold text-slate-900">Settings &amp; Privacy</h3>
        <div className="space-y-4">
          {[{ label: "Email notifications for new analysis", def: true }, { label: "Share de-identified data for research", def: false }, { label: "Two-factor authentication", def: true }].map((s) => (
            <div key={s.label} className="flex items-center justify-between">
              <span className="text-sm text-slate-600">{s.label}</span>
              <Toggle defaultChecked={s.def} />
            </div>
          ))}
          <button onClick={onChangePassword} className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 mt-2">
            <Lock className="h-4 w-4" /> Change password
          </button>
        </div>
      </div>
    </div>
  );
}
