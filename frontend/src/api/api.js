// src/api/api.js — All backend API calls
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// ── Token helpers ─────────────────────────────────────────────
export const getToken        = () => localStorage.getItem("access_token");
export const getRefreshToken = () => localStorage.getItem("refresh_token");
export const setTokens = (access, refresh) => {
  if (access)  localStorage.setItem("access_token",  access);
  if (refresh) localStorage.setItem("refresh_token", refresh);
};
export const clearTokens = () => {
  localStorage.removeItem("access_token");
  localStorage.removeItem("refresh_token");
  localStorage.removeItem("user");
};
export const getUser  = () => { try { return JSON.parse(localStorage.getItem("user")); } catch { return null; } };
export const setUser  = (u) => localStorage.setItem("user", JSON.stringify(u));

// ── Core fetch ────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = { "Content-Type": "application/json", ...options.headers };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res  = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const data = await res.json();

    if (res.status === 401 && getRefreshToken()) {
      const ok = await tryRefresh();
      if (ok) {
        headers["Authorization"] = `Bearer ${getToken()}`;
        const retry = await fetch(`${BASE_URL}${path}`, { ...options, headers });
        return retry.json();
      } else { clearTokens(); window.location.reload(); }
    }
    return data;
  } catch (err) {
    console.error("API error:", err);
    return { success: false, error: "Cannot connect to server. Is the backend running?" };
  }
}

async function tryRefresh() {
  try {
    const res  = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: getRefreshToken() }),
    });
    const data = await res.json();
    if (data.success) { setTokens(data.data.access_token, null); return true; }
    return false;
  } catch { return false; }
}

// ── AUTH ──────────────────────────────────────────────────────
export const authAPI = {
  register: (full_name, email, password) =>
    request("/api/auth/register", { method: "POST", body: JSON.stringify({ full_name, email, password }) }),

  login: async (email, password) => {
    const data = await request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    if (data.success) {
      setTokens(data.data.access_token, data.data.refresh_token);
      setUser(data.data.user);
    }
    return data;
  },

  logout: async () => {
    await request("/api/auth/logout", { method: "POST", body: JSON.stringify({ refresh_token: getRefreshToken() }) });
    clearTokens();
  },
};

// ── PROFILE ───────────────────────────────────────────────────
export const profileAPI = {
  get:    ()       => request("/api/profile"),
  update: (fields) => request("/api/profile", { method: "PUT", body: JSON.stringify(fields) }),
};

// ── REPORTS ───────────────────────────────────────────────────
export const reportsAPI = {
  create: (file_name, report_type, report_text) =>
    request("/api/reports", { method: "POST", body: JSON.stringify({ file_name, report_type, report_text }) }),
  list:   ()   => request("/api/reports"),
  get:    (id) => request(`/api/reports/${id}`),
  delete: (id) => request(`/api/reports/${id}`, { method: "DELETE" }),
};

// ── SUMMARIES ─────────────────────────────────────────────────
export const summariesAPI = {
  get: (reportId) => request(`/api/summaries/${reportId}`),
};

// ── CHAT ──────────────────────────────────────────────────────
export const chatAPI = {
  send:    (reportId, message) =>
    request(`/api/chat/${reportId}`, { method: "POST", body: JSON.stringify({ message }) }),
  history: (reportId) => request(`/api/chat/${reportId}/history`),
};
