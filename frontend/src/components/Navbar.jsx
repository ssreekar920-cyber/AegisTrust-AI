import React from "react";
import {
  Shield,
  Activity,
  Terminal,
  ShieldCheck,
  LogOut,
  User,
  Search,
  Bot,
  HardDrive,
  Lock,
  Star,
  Sparkles,
} from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";

export function Navbar({ activePage, setActivePage }) {
  const { user, logout } = useAuth();

  const tabs = [
    { id: "home", label: "Home", icon: Shield, color: "#06b6d4" },
    { id: "chatbot", label: "Blue-Team Chat", icon: Bot, color: "#38bdf8" },
    { id: "scanner", label: "Malware Scanner", icon: Search, color: "#f43f5e" },
    { id: "privacy", label: "Privacy Vault & DLP", icon: Lock, color: "#10b981" },
    { id: "apps", label: "Mail & Drive Apps", icon: HardDrive, color: "#f59e0b" },
    { id: "dashboard", label: "Trust Scorecard", icon: Activity, color: "#8b5cf6" },
    { id: "about", label: "Team STARS", icon: Star, color: "#eab308", isStar: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full bg-[#030718]/90 backdrop-blur-2xl border-b border-cyan-500/20 shadow-[0_4px_30px_rgba(0,0,0,0.6)] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Futuristic Brand Crest */}
        <div
          onClick={() => setActivePage("home")}
          className="flex items-center gap-3 cursor-pointer group shrink-0"
          title="Return to AegisTrust Home"
        >
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-cyan-950 via-[#030718] to-cyan-900 border border-cyan-500/40 shadow-[0_0_20px_rgba(6,182,212,0.35)] group-hover:border-cyan-400 group-hover:shadow-[0_0_28px_rgba(6,182,212,0.6)] transition-all duration-300">
            <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base sm:text-lg text-white tracking-tight">
                AegisTrust <span className="text-cyan-400 font-black">AI</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-950/80 text-amber-300 border border-amber-800 flex items-center gap-1 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
                <Star className="w-2.5 h-2.5 fill-amber-400" />
                STARS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block font-mono">
              Zero-Trust AI Gateway & SecOps Control Center
            </p>
          </div>
        </div>

        {/* Futuristic Cyber Command Dock (Taskbar) */}
        <nav className="hidden lg:flex items-center gap-1 bg-[#090f22]/90 p-1.5 rounded-2xl border border-slate-800/90 shadow-[inset_0_1px_3px_rgba(0,0,0,0.6)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePage(tab.id)}
                className={`relative flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "text-slate-950 font-bold shadow-md"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-800/50"
                }`}
                style={{
                  backgroundColor: isActive ? tab.color : "transparent",
                  boxShadow: isActive ? `0 0 16px ${tab.color}60` : "none",
                }}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-transform ${
                    isActive
                      ? "text-slate-950 scale-110"
                      : "text-slate-400 group-hover:text-white"
                  } ${tab.isStar ? "fill-amber-400 text-amber-400" : ""}`}
                />
                <span>{tab.label}</span>
                {tab.badge && !isActive && (
                  <span className="px-1 py-0.2 rounded text-[8px] font-mono bg-blue-950 text-blue-300 border border-blue-800">
                    {tab.badge}
                  </span>
                )}
                {/* Active Underline Pill */}
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-0.5 rounded-full bg-white opacity-80" />
                )}
              </button>
            );
          })}
        </nav>

        {/* User Chip & Logout / Sign In */}
        <div className="flex items-center gap-2.5 shrink-0">
          {user ? (
            <>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-sm">
                <div className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400">
                  <User className="w-3 h-3" />
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-[11px] font-bold text-slate-200 leading-tight">
                    {user.name}
                  </div>
                  <div className="text-[9px] font-mono text-cyan-400 leading-none">
                    SecOps Commander
                  </div>
                </div>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log out</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setActivePage("auth")}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-[0_0_16px_rgba(6,182,212,0.4)] hover:shadow-[0_0_24px_rgba(6,182,212,0.6)] transition-all cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Sign In / Demo</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile / Tablet Horizontal Scrollable Cyber Dock */}
      <div className="flex lg:hidden px-3 py-2 border-t border-[#1e293b]/80 gap-1.5 overflow-x-auto bg-[#070d1e]/95 scrollbar-none">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activePage === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePage(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all font-semibold ${
                isActive
                  ? "text-slate-950 font-bold"
                  : "text-slate-400 hover:text-slate-200 bg-slate-900/60"
              }`}
              style={{
                backgroundColor: isActive ? tab.color : undefined,
                boxShadow: isActive ? `0 0 12px ${tab.color}50` : "none",
              }}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}

export default Navbar;
