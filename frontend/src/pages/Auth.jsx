import React, { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { Shield, Lock, Mail, User, KeyRound, ArrowRight, Loader2 } from "lucide-react";

export function Auth({ onCancel }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [clientError, setClientError] = useState("");
  const { login, register } = useAuth();

  const validate = () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setClientError("Please provide a valid email address.");
      return false;
    }
    if (!password || password.length < 8) {
      setClientError("Password must be at least 8 characters long.");
      return false;
    }
    if (isRegister && !name.trim()) {
      setClientError("Name is required.");
      return false;
    }
    setClientError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
    } catch {
      // Error handled via toast
    } finally {
      setLoading(false);
    }
  };

  const handleUseDemoAccount = async () => {
    setEmail("demo@aegistrust.demo");
    setPassword("DemoPass123");
    setClientError("");
    setLoading(true);
    try {
      await login("demo@aegistrust.demo", "DemoPass123");
    } catch {
      // Error handled via toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 bg-[#020617] relative overflow-hidden">
      {/* Background Cyber Ambient Lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-rose-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-md p-8 rounded-2xl bg-[#0f172a] border border-[#1e293b] shadow-2xl backdrop-blur-xl">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="mb-4 text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
          >
            ← Back to Homepage
          </button>
        )}

        {/* Header with Shield Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex p-3 rounded-2xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 mb-4 shadow-[0_0_24px_rgba(6,182,212,0.25)]">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            AegisTrust <span className="text-cyan-400">AI</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Zero-Trust AI Security Gateway & SecOps Control Center
          </p>
        </div>

        {/* Tab Toggle: Login / Register */}
        <div className="flex p-1 rounded-xl bg-slate-950 border border-slate-800 mb-6 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setClientError("");
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              !isRegister
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setClientError("");
            }}
            className={`flex-1 py-2 rounded-lg font-bold transition-all ${
              isRegister
                ? "bg-cyan-500 text-slate-950 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Register
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label className="block text-xs font-mono text-slate-300 mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Security Analyst"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="analyst@enterprise.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-300 mb-1.5">Password (≥ 8 chars)</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {clientError && (
            <p className="text-xs font-mono text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-900/60">
              {clientError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-[0_0_16px_rgba(6,182,212,0.3)] disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
            <span>{isRegister ? "Create Analyst Account" : "Authenticate to Gateway"}</span>
          </button>
        </form>

        {/* 10-Second Demo Button */}
        <div className="mt-6 pt-5 border-t border-[#1e293b]">
          <button
            type="button"
            disabled={loading}
            onClick={handleUseDemoAccount}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-700/80 hover:border-cyan-500/60 text-xs font-mono transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-cyan-400" />
            <span>Use Demo Account (demo@aegistrust.demo)</span>
          </button>
          <p className="text-[10px] text-center text-slate-500 mt-2 font-mono">
            Fast track for hackathon judges & evaluators
          </p>
        </div>
      </div>
    </div>
  );
}

export default Auth;
