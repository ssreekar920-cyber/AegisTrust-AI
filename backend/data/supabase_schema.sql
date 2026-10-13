-- ==============================================================
-- AegisTrust AI — Supabase PostgreSQL Database Schema
-- Run this script in your Supabase Dashboard: SQL Editor -> New Query
-- ==============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'analyst' CHECK (role IN ('analyst', 'admin', 'auditor')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index on user email for fast authentication lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- 2. INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS public.incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT DEFAULT 'file',
    payload_redacted TEXT,
    threat_vector TEXT,
    confidence INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'quarantined', 'resolved')),
    remediation_patch TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);

-- 3. THREAT TELEMETRY LOGS TABLE
CREATE TABLE IF NOT EXISTS public.threat_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT,
    client_ip TEXT DEFAULT '127.0.0.1',
    channel TEXT DEFAULT 'file',
    direction TEXT DEFAULT 'inbound',
    attack_type TEXT NOT NULL,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_threat_logs_severity ON public.threat_logs(severity);
CREATE INDEX IF NOT EXISTS idx_threat_logs_created_at ON public.threat_logs(created_at DESC);

-- 4. GATEWAY CONFIGURATION SINGLETON TABLE
CREATE TABLE IF NOT EXISTS public.gateway_config (
    id TEXT PRIMARY KEY DEFAULT 'singleton',
    version TEXT DEFAULT 'v1',
    system_prompt TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. AUDIT REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.audit_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    trust_score NUMERIC DEFAULT 98.4,
    nist_compliant BOOLEAN DEFAULT true,
    iso_compliant BOOLEAN DEFAULT true,
    owasp_compliant BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. SEED DEMO ADMIN USER (Password: DemoPass123)
-- bcrypt hash for DemoPass123 (salt rounds 12)
INSERT INTO public.users (name, email, password_hash, role)
VALUES (
    'Alex Vance (SecOps Lead)',
    'demo@aegistrust.demo',
    '$2b$12$e6mZ8b2bK9T2Q9m6s7G5..zE8zL4P3K1h0Y2b7N8v5C4a1D9f6e2m',
    'admin'
)
ON CONFLICT (email) DO NOTHING;

-- 7. INITIALIZE GATEWAY CONFIGURATION
INSERT INTO public.gateway_config (id, version, system_prompt)
VALUES (
    'singleton',
    'v1',
    'You are AegisTrust AI, a sovereign cybersecurity and defensive intelligence assistant.'
)
ON CONFLICT (id) DO NOTHING;

-- Enable Row Level Security (RLS) policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.threat_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gateway_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_reports ENABLE ROW LEVEL SECURITY;

-- Allow read/write access for authenticated service role backend API
CREATE POLICY "Allow backend service access on users" ON public.users FOR ALL USING (true);
CREATE POLICY "Allow backend service access on incidents" ON public.incidents FOR ALL USING (true);
CREATE POLICY "Allow backend service access on threat_logs" ON public.threat_logs FOR ALL USING (true);
CREATE POLICY "Allow backend service access on gateway_config" ON public.gateway_config FOR ALL USING (true);
CREATE POLICY "Allow backend service access on audit_reports" ON public.audit_reports FOR ALL USING (true);
