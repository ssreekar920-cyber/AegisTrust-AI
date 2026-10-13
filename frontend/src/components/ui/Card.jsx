import React from "react";

export function Card({ children, className = "", glow = false, dangerGlow = false }) {
  return (
    <div
      className={`bg-[#0f172a] border border-[#1e293b] rounded-xl transition-all duration-200 ${
        glow ? "glow-cyan border-cyan-500/30" : ""
      } ${dangerGlow ? "glow-danger border-rose-500/40" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export default Card;
