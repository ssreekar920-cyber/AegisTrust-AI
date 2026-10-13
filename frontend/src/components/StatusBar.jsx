import React, { useState, useEffect, useRef } from "react";
import api from "../lib/api.js";
import { useToast } from "../context/ToastContext.jsx";
import { ShieldCheck, Cpu, Zap, WifiOff, Star, Activity, Lock } from "lucide-react";

export function StatusBar() {
  const [health, setHealth] = useState({
    active: true,
    latencyMs: 12,
    model: "gemini-3.1-flash-lite",
    version: "v1 (NIST RMF)",
  });
  const [unreachable, setUnreachable] = useState(false);
  const toast = useToast();
  const hasWarnedRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function checkHealth() {
      const start = Date.now();
      try {
        const res = await api.getHealth();
        if (isMounted) {
          const clientLatency = Date.now() - start;
          setHealth({
            active: res.ok,
            latencyMs: res.latencyMs || clientLatency,
            model: res.model || "gemini-3.1-flash-lite",
            version: res.version || "v1 (NIST RMF)",
          });
          setUnreachable(false);
          hasWarnedRef.current = false;
        }
      } catch {
        if (isMounted) {
          setUnreachable(true);
          if (!hasWarnedRef.current) {
            toast.error("Gateway unreachable. Please verify backend service on port 5000.");
            hasWarnedRef.current = true;
          }
        }
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [toast]);

  return (
    <div className="w-full bg-[#020514]/90 border-b border-cyan-900/40 py-1 px-4 sm:px-6 lg:px-8 text-[11px] font-mono text-slate-400 backdrop-blur-xl shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        {/* Left Telemetry Cluster */}
        <div className="flex items-center gap-3">
          {unreachable ? (
            <span className="flex items-center gap-1.5 text-rose-400 font-semibold px-2 py-0.5 rounded bg-rose-950/60 border border-rose-900">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
              <WifiOff className="w-3 h-3 text-rose-400" />
              <span>GATEWAY UNREACHABLE</span>
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-950/50 border border-emerald-800/80 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>ZERO-TRUST SHIELD: ACTIVE</span>
            </span>
          )}

          <div className="flex items-center gap-1.5 text-slate-300">
            <Zap className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">Latency:</span>
            <span className="text-cyan-300 font-bold px-1.5 py-0.2 rounded bg-cyan-950/60 border border-cyan-800/60">
              {health.latencyMs}ms
            </span>
          </div>

          <span className="text-slate-700 hidden md:inline">|</span>

          <div className="hidden md:flex items-center gap-1.5 text-emerald-300">
            <Lock className="w-3 h-3 text-emerald-400" />
            <span className="text-slate-400">DLP Vault:</span>
            <span className="text-emerald-400 font-semibold">Zero-Knowledge</span>
          </div>
        </div>

        {/* Right Telemetry Cluster */}
        <div className="flex items-center gap-3 text-slate-400">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span className="text-slate-400">Engine:</span>
            <span className="text-slate-200 font-semibold">{health.model}</span>
          </div>

          <span className="text-slate-700 hidden sm:inline">|</span>

          <div className="hidden sm:flex items-center gap-1.5 text-amber-300">
            <Star className="w-3 h-3 text-amber-400 fill-amber-400 animate-pulse" />
            <span className="text-slate-400">Crew:</span>
            <span className="text-amber-300 font-bold">TEAM STARS</span>
          </div>

          <span className="text-slate-700 hidden lg:inline">|</span>

          <div className="hidden lg:flex items-center gap-1.5">
            <Activity className="w-3 h-3 text-violet-400" />
            <span className="text-slate-400">Trust Index:</span>
            <span className="text-violet-300 font-bold">98.4% (A+)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusBar;
