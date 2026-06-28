-- ============================================================
-- MedInsight Database Schema
-- Run this in Supabase SQL Editor (one time only)
-- Matches the ER Diagram exactly
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── USERS ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email         VARCHAR(255) UNIQUE NOT NULL
                  CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  password_hash VARCHAR(255) NOT NULL,
  full_name     VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW(),
  is_verified   BOOLEAN DEFAULT FALSE,
  role          VARCHAR(20) DEFAULT 'user'
                  CHECK (role IN ('user', 'admin'))
);

-- ── SESSIONS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token         TEXT,
  refresh_token TEXT NOT NULL,
  created_at    TIMESTAMP DEFAULT NOW(),
  expires_at    TIMESTAMP NOT NULL
);

-- ── REPORTS ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reports (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  file_name     VARCHAR(255) NOT NULL,
  file_url      TEXT,
  report_type   VARCHAR(100) DEFAULT 'general',
  upload_date   TIMESTAMP DEFAULT NOW(),
  status        VARCHAR(20) DEFAULT 'pending'
                  CHECK (status IN ('pending', 'processing', 'completed', 'failed'))
);

-- ── SUMMARIES (1:1 with reports) ─────────────────────────────
CREATE TABLE IF NOT EXISTS summaries (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id      UUID UNIQUE NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  summary_text   TEXT,
  key_findings   JSONB DEFAULT '[]',
  abnormal_flags JSONB DEFAULT '[]',
  generated_at   TIMESTAMP DEFAULT NOW()
);

-- ── CHAT_HISTORY ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS chat_history (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  report_id  UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message    TEXT NOT NULL,
  response   TEXT NOT NULL,
  timestamp  TIMESTAMP DEFAULT NOW(),
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL
);

-- ── INDEXES (for faster queries) ─────────────────────────────
CREATE INDEX IF NOT EXISTS idx_sessions_user_id    ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_user_id     ON reports(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_report_id      ON chat_history(report_id);
CREATE INDEX IF NOT EXISTS idx_chat_user_id        ON chat_history(user_id);
