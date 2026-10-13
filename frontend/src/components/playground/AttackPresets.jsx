import React from "react";
import attackPresets from "../../data/presets.js";
import { Zap } from "lucide-react";

export function AttackPresets({ onSelectPreset, currentText }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 mr-1">
        <Zap className="w-3.5 h-3.5 text-cyan-400" />
        <span>Attack Presets:</span>
      </div>

      {attackPresets.map((preset) => {
        const isSelected = currentText === preset.payload;
        return (
          <button
            key={preset.id}
            type="button"
            onClick={() => onSelectPreset(preset.payload)}
            title={preset.description}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all border ${
              isSelected
                ? "bg-cyan-500/20 text-cyan-300 border-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.2)]"
                : "bg-slate-900/80 text-slate-300 border-slate-700/80 hover:border-cyan-500/60 hover:text-cyan-300"
            }`}
          >
            {preset.title}
          </button>
        );
      })}
    </div>
  );
}

export default AttackPresets;
