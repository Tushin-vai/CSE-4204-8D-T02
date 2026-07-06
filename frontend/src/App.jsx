import React, { useState } from "react";
import { ClipboardList, X } from "lucide-react";
import AuthShell from "./components/AuthShell";
import Sidebar, { NAV_ITEMS } from "./components/Sidebar";
import Logo from "./components/Logo";
import Landing        from "./pages/Landing";
import Login          from "./pages/Login";
import Register       from "./pages/Register";
import Dashboard      from "./pages/Dashboard";
import UploadReport   from "./pages/UploadReport";
import ResultPage     from "./pages/ResultPage";
import ReportHistory  from "./pages/ReportHistory";
import AIAssistant    from "./pages/AIAssistant";
import Profile        from "./pages/Profile";
import ChangePassword from "./pages/ChangePassword";
import { authAPI, getUser, clearTokens } from "./api/api";

export default function App() {
  const savedUser = getUser();
  // screen: landing | login | register | app
  const [screen, setScreen]             = useState(savedUser ? "app" : "landing");
  // view inside app
  const [view, setView]                 = useState("dashboard");
  const [mobileNav, setMobileNav]       = useState(false);
  const [currentReportId, setCurrentReportId] = useState(null);

  const handleGoApp = () => { setScreen("app"); setView("dashboard"); };

  const handleLogout = async () => {
    await authAPI.logout();
    clearTokens();
    setScreen("landing");
    setView("dashboard");
  };

  const openReport = (reportId) => { setCurrentReportId(reportId); setView("result"); };

  const handleAnalyzed = (reportId) => { setCurrentReportId(reportId); setView("result"); };

  // ── Landing ───────────────────────────────────────────────────
  if (screen === "landing") {
    return <Landing goLogin={() => setScreen("login")} goRegister={() => setScreen("register")} />;
  }

  // ── Auth screens ──────────────────────────────────────────────
  if (screen === "login") {
    return (
      <div className="font-sans">
        <AuthShell>
          <Login goRegister={() => setScreen("register")} goApp={handleGoApp} />
        </AuthShell>
      </div>
    );
  }

  if (screen === "register") {
    return (
      <div className="font-sans">
        <AuthShell>
          <Register goLogin={() => setScreen("login")} goApp={handleGoApp} />
        </AuthShell>
      </div>
    );
  }

  // ── App views ─────────────────────────────────────────────────
  const content = {
    dashboard: <Dashboard setView={setView} openReport={openReport} />,
    upload:    <UploadReport onAnalyze={handleAnalyzed} />,
    result:    <ResultPage onBack={() => setView("history")} reportId={currentReportId} />,
    history:   <ReportHistory openReport={openReport} />,
    assistant: <AIAssistant />,
    profile:   <Profile onChangePassword={() => setView("change-password")} />,
    "change-password": <ChangePassword onBack={() => setView("profile")} onLogout={handleLogout} />,
  }[view] || <Dashboard setView={setView} openReport={openReport} />;

  return (
    <div className="flex h-screen w-full bg-slate-50 font-sans text-slate-900">
      <Sidebar
        view={["result", "change-password"].includes(view) ? "history" : view}
        setView={setView}
        onLogout={handleLogout}
      />

      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-20 flex items-center justify-between bg-[#0B1220] px-4 py-3">
        <Logo light />
        <button onClick={() => setMobileNav(true)} className="text-slate-300">
          <ClipboardList className="h-5 w-5" />
        </button>
      </div>

      {/* Mobile nav drawer */}
      {mobileNav && (
        <div className="fixed inset-0 z-30 flex md:hidden">
          <div className="w-64 bg-[#0B1220] p-4">
            <div className="mb-4 flex items-center justify-between">
              <Logo light />
              <button onClick={() => setMobileNav(false)} className="text-slate-400"><X className="h-5 w-5" /></button>
            </div>
            <nav className="space-y-1">
              {NAV_ITEMS.map(({ key, label, icon: Icon }) => (
                <button key={key} onClick={() => { setView(key); setMobileNav(false); }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${view === key ? "bg-blue-600 text-white" : "text-slate-400"}`}>
                  <Icon className="h-4 w-4" /> {label}
                </button>
              ))}
            </nav>
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setMobileNav(false)} />
        </div>
      )}

      <main className="flex-1 overflow-y-auto pt-14 md:pt-0">{content}</main>
    </div>
  );
}
