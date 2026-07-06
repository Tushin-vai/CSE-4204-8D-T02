import React, { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import TopBar from "../components/TopBar";
import { chatAPI, reportsAPI } from "../api/api";

export default function AIAssistant() {
  const [messages, setMessages] = useState([{
    role: "assistant",
    text: "Hi! I'm your AI medical assistant. I can help you understand your lab results, explain medical terms, and answer health questions. Select a report below to ask specific questions about it.",
  }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [reports, setReports] = useState([]);
  const [selectedReportId, setSelectedReportId] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    reportsAPI.list().then((data) => {
      if (data.success) setReports(data.data.reports);
    });
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      if (selectedReportId) {
        // Real backend chat
        const data = await chatAPI.send(selectedReportId, userText);
        if (data.success) {
          setMessages((m) => [...m, { role: "assistant", text: data.data.response }]);
        } else {
          setMessages((m) => [...m, { role: "assistant", text: "Sorry, I couldn't process that. Please try again." }]);
        }
      } else {
        // No report selected — general response
        await new Promise((r) => setTimeout(r, 600));
        setMessages((m) => [...m, {
          role: "assistant",
          text: "Please select a report from the dropdown above so I can give you specific answers about your results. Or ask me a general health question!",
        }]);
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", text: "Connection error. Make sure the backend server is running." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <TopBar title="AI Assistant" subtitle="Ask questions about your reports and health data" />

      {/* Report selector */}
      <div className="border-b border-slate-200 bg-white px-6 py-3">
        <select
          value={selectedReportId}
          onChange={(e) => setSelectedReportId(e.target.value)}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15"
        >
          <option value="">General questions (no report selected)</option>
          {reports.map((r) => (
            <option key={r.id} value={r.id}>{r.file_name} — {r.report_type}</option>
          ))}
        </select>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              m.role === "user" ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-700"
            }`}>
              {m.text}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl bg-slate-100 px-4 py-3">
              <div className="flex gap-1">
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
                <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Ask about your cholesterol, glucose, or any health question..."
            className="flex-1 bg-transparent text-sm outline-none placeholder-slate-400"
          />
          <button onClick={send} disabled={loading}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50">
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-center text-xs text-slate-400">AI assistant — not a substitute for professional medical advice</p>
      </div>
    </div>
  );
}
