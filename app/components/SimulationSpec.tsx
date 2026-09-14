// frontend/src/components/SimulationSpec.tsx
"use client";

import { useState } from "react";
import { Network, ChevronDown, ChevronRight } from "lucide-react";
import { SimulationResult } from "../utils/type";

import { Translations, TRANSLATIONS } from "../utils/i18n";

interface SimSpec {
  domain?: string;
  methodology?: string;
  methodology_hint?: string;
  objective?: string;
  time_horizon?: { steps?: number | string; unit?: string } | string | number;
  num_runs?: number | string;
  entities?: Array<{ name?: string; type?: string; objective?: string } | string>;
  outcomes?: string[];
  stochastic_variables?: Array<{ name?: string; distribution_hint?: string; provenance?: string } | string>;
}

interface SimulationSpecProps {
  result: SimulationResult | null;
  loading: boolean;
  hasStats: boolean;
  t?: Translations;
}

export default function SimulationSpec({ result, loading, hasStats, t = TRANSLATIONS.English }: SimulationSpecProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Hide component completely once stats summary is ready
  if (hasStats) return null;

  const specRaw = result?.simulation_spec;

  let specObj: SimSpec | null = null;
  if (specRaw) {
    try {
      specObj = JSON.parse(specRaw) as SimSpec;
    } catch {
      specObj = null;
    }
  }

  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-800/40 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold text-slate-200">{t.simSpecTitle}</span>
        </div>
        <div className="flex items-center gap-2">
          {loading && !specObj && (
            <span className="text-[10px] text-slate-500 animate-pulse">{t.specParsing}</span>
          )}
          {isExpanded ? (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
          )}
        </div>
      </div>

      {/* Body */}
      {isExpanded && (
        <div className="border-t border-slate-800/60 px-4 py-3 space-y-4">
          {!specObj && !loading && (
            <p className="text-xs text-slate-500 italic">{t.specNoData}</p>
          )}

          {specObj && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              <SpecField label={t.specDomain} value={specObj.domain ?? "—"} accent="violet" />
              <SpecField label={t.specMethodology} value={specObj.methodology ?? specObj.methodology_hint ?? "—"} accent="indigo" />
              <SpecField label={t.specObjective} value={specObj.objective ?? "—"} accent="slate" fullWidth />

              {specObj.time_horizon && (
                <SpecField
                  label={t.specTimeHorizon}
                  value={
                    typeof specObj.time_horizon === "object"
                      ? `${specObj.time_horizon.steps ?? ""} ${specObj.time_horizon.unit ?? ""}`
                      : String(specObj.time_horizon)
                  }
                  accent="cyan"
                />
              )}
              <SpecField label={t.specRuns} value={String(specObj.num_runs ?? "—")} accent="cyan" />

              {Array.isArray(specObj.entities) && specObj.entities.length > 0 && (
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">{t.specEntities}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {specObj.entities.map((e, i) => {
                      const name = typeof e === "object" && e !== null ? (e.name ?? `Entity ${i + 1}`) : String(e);
                      const type = typeof e === "object" && e !== null ? (e.type ?? "?") : "";
                      const objective = typeof e === "object" && e !== null ? (e.objective ?? "") : "";
                      return (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px]"
                          title={objective}
                        >
                          {name} {type ? `(${type})` : ""}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}

              {Array.isArray(specObj.outcomes) && specObj.outcomes.length > 0 && (
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">{t.specOutcomes}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {specObj.outcomes.map((o, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px]"
                      >
                        {typeof o === "string" ? o : JSON.stringify(o)}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function SpecField({
  label,
  value,
  accent,
  fullWidth,
}: {
  label: string;
  value: string;
  accent: "violet" | "indigo" | "cyan" | "slate";
  fullWidth?: boolean;
}) {
  const accentMap = {
    violet: "text-violet-300",
    indigo: "text-indigo-300",
    cyan: "text-cyan-300",
    slate: "text-slate-300",
  };
  return (
    <div className={fullWidth ? "col-span-2" : ""}>
      <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-0.5">{label}</p>
      <p className={`${accentMap[accent]} font-medium`}>{value}</p>
    </div>
  );
}