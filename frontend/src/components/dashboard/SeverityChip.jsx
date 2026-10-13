import React from "react";

export function SeverityChip({ severity = "low" }) {
  const styles = {
    critical: "bg-rose-950/80 text-rose-300 border-rose-700/80 shadow-[0_0_8px_rgba(239,68,68,0.25)]",
    high: "bg-orange-950/80 text-orange-300 border-orange-700/80",
    medium: "bg-amber-950/80 text-amber-300 border-amber-700/80",
    low: "bg-emerald-950/80 text-emerald-300 border-emerald-700/80",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${
        styles[severity.toLowerCase()] || styles.low
      }`}
    >
      {severity}
    </span>
  );
}

export default SeverityChip;
