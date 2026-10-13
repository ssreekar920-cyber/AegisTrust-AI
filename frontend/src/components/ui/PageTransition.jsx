import React, { useEffect, useState, useRef } from "react";

// Themed Metadata & Audio Frequency for Each Page
const pageConfigs = {
  home: {
    className: "page-anim-home",
    color: "#06b6d4",
    name: "WARP: HOME MATRIX",
    freq: 520,
  },
  chatbot: {
    className: "page-anim-chatbot",
    color: "#38bdf8",
    name: "UPLINK: AI DEFENDER",
    freq: 880,
  },
  scanner: {
    className: "page-anim-scanner",
    color: "#f43f5e",
    name: "SONAR: THREAT SCANNER",
    freq: 440,
  },
  privacy: {
    className: "page-anim-privacy",
    color: "#10b981",
    name: "CIPHER: PRIVACY VAULT",
    freq: 580,
  },
  apps: {
    className: "page-anim-apps",
    color: "#f59e0b",
    name: "ORBITAL: MAIL & DRIVE APPS",
    freq: 720,
  },
  dashboard: {
    className: "page-anim-dashboard",
    color: "#8b5cf6",
    name: "TELEMETRY: TRUST SCORECARD",
    freq: 800,
  },
  about: {
    className: "page-anim-about",
    color: "#eab308",
    name: "SUPERNOVA: TEAM STARS",
    freq: 980,
  },
};

/**
 * High-Tech Page Transition & Animation Wrapper
 * Triggers unique entrance animation, horizontal laser sweep beam, and micro-audio feedback.
 */
export function PageTransition({ page, children }) {
  const [showSweep, setShowSweep] = useState(true);
  const audioCtxRef = useRef(null);

  const config = pageConfigs[page] || pageConfigs.home;

  useEffect(() => {
    setShowSweep(true);

    // Subtle Web Audio Micro-Tone
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(config.freq, audioCtxRef.current.currentTime);
      gain.gain.setValueAtTime(0.025, audioCtxRef.current.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtxRef.current.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start();
      osc.stop(audioCtxRef.current.currentTime + 0.08);
    } catch {
      // Audio fallback
    }

    const timer = setTimeout(() => {
      setShowSweep(false);
    }, 700);

    return () => clearTimeout(timer);
  }, [page, config.freq]);

  return (
    <div key={page} className="relative w-full overflow-hidden">
      {/* Dynamic Laser Beam Transition Sweep */}
      {showSweep && (
        <>
          <div
            className="fixed top-0 left-0 h-[2px] w-48 anim-beam-sweep pointer-events-none z-50 shadow-[0_0_12px_rgba(255,255,255,0.8)]"
            style={{
              background: `linear-gradient(90deg, transparent, ${config.color}, #ffffff, transparent)`,
              boxShadow: `0 0 16px ${config.color}`,
            }}
          />
          {/* Ephemeral HUD Mode Pill */}
          <div
            className="fixed top-20 right-6 pointer-events-none z-50 px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase transition-all duration-500 flex items-center gap-1.5 shadow-lg border"
            style={{
              backgroundColor: "#030718e6",
              borderColor: `${config.color}80`,
              color: config.color,
              boxShadow: `0 0 20px ${config.color}35`,
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-ping"
              style={{ backgroundColor: config.color }}
            />
            <span>{config.name}</span>
          </div>
        </>
      )}

      {/* Unique Animated Page Container */}
      <div className={config.className}>{children}</div>
    </div>
  );
}

export default PageTransition;
