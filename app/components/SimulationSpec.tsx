"use client";

import { useState } from "react";
import { Network, ChevronDown, ChevronRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { SimulationResult } from "../utils/type";

interface SimSpec {
  domain?: string;
  methodology?: string;
  objective?: string;
  time_horizon?: { steps?: number | string; unit?: string } | string | number;
  num_runs?: number | string;
  entities?: Array<{ name?: string; type?: string; objective?: string }>;
  outcomes?: string[];
  stochastic_variables?: string[];
}

interface CriticReview {
  approved?: boolean;
  severity?: string;
  issues?: Array<{ criterion?: string; severity?: string; description?: string; suggested_fix?: string }>;
  summary?: string;
}

interface SimulationSpecProps {
  result: SimulationResult | null;
  loading: boolean;
}

export default function SimulationSpec({ result, loading }: SimulationSpecProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const specRaw = result?.simulation_spec;
  const criticApproved = result?.critic_approved;
  const criticFeedback = result?.critic_feedback;

  let specObj: SimSpec | null = null;
  if (specRaw) {
    try {
      specObj = JSON.parse(specRaw) as SimSpec;
    } catch {
      specObj = null;
    }
  }

  let criticObj: CriticReview | null = null;
  if (criticFeedback) {
    try {
      criticObj = JSON.parse(criticFeedback) as CriticReview;
    } catch {
      criticObj = null;
    }
  }

  const hasCriticData = criticFeedback && criticFeedback.length > 0;

  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-slate-800/40 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold text-slate-200">Simulation Specification</span>
        </div>
        <div className="flex items-center gap-2">
          {/* Critic badge */}
          {hasCriticData && (
            criticApproved ? (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                <CheckCircle2 className="w-3 h-3" /> Critic Approved
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
                <AlertTriangle className="w-3 h-3" /> Critic Issues
              </span>
            )
          )}
          {loading && !specObj && (
            <span className="text-[10px] text-slate-500 animate-pulse">Parsing scenario...</span>
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
            <p className="text-xs text-slate-500 italic">No specification available yet.</p>
          )}

          {specObj && (
            <div className="grid grid-cols-2 gap-3 text-xs">
              {/* Domain + Methodology */}
              <SpecField label="Domain" value={specObj.domain ?? "—"} accent="violet" />
              <SpecField label="Methodology" value={specObj.methodology ?? "—"} accent="indigo" />
              <SpecField label="Objective" value={specObj.objective ?? "—"} accent="slate" fullWidth />

              {/* Time horizon + Runs */}
              {specObj.time_horizon && (
                <SpecField
                  label="Time Horizon"
                  value={
                    typeof specObj.time_horizon === "object"
                      ? `${specObj.time_horizon.steps ?? ""} ${specObj.time_horizon.unit ?? ""}`
                      : String(specObj.time_horizon)
                  }
                  accent="cyan"
                />
              )}
              <SpecField label="Simulation Runs" value={String(specObj.num_runs ?? "—")} accent="cyan" />

              {/* Entities */}
              {Array.isArray(specObj.entities) && specObj.entities.length > 0 && (
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Entities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {specObj.entities.map((e, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[10px]"
                        title={e.objective ?? ""}
                      >
                        {e.name ?? `Entity ${i + 1}`} ({e.type ?? "?"})
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Outcomes */}
              {Array.isArray(specObj.outcomes) && specObj.outcomes.length > 0 && (
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Outcome Metrics</p>
                  <div className="flex flex-wrap gap-1.5">
                    {specObj.outcomes.map((o, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px]"
                      >
                        {o}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Stochastic variables */}
              {Array.isArray(specObj.stochastic_variables) && specObj.stochastic_variables.length > 0 && (
                <div className="col-span-2">
                  <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1.5">Stochastic Variables</p>
                  <div className="flex flex-wrap gap-1.5">
                    {specObj.stochastic_variables.map((v, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[10px]"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Critic feedback section */}
          {hasCriticData && criticObj && (
            <div className="border-t border-slate-800/50 pt-3 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-slate-500">Model Critic Review</p>
              {Array.isArray(criticObj.issues) &&
                criticObj.issues.map((issue, i) => (
                  <div
                    key={i}
                    className={`text-[10px] px-2.5 py-1.5 rounded-lg border ${
                      issue.severity === "critical"
                        ? "bg-red-500/8 border-red-500/20 text-red-300"
                        : issue.severity === "warning"
                        ? "bg-amber-500/8 border-amber-500/20 text-amber-300"
                        : "bg-slate-700/30 border-slate-700/40 text-slate-400"
                    }`}
                  >
                    <span className="font-semibold">[{issue.criterion ?? "?"}]</span>{" "}
                    {issue.description ?? ""}
                  </div>
                ))}
              {Boolean(criticObj.summary) && (
                <p className="text-[10px] text-slate-400 italic">
                  {criticObj.summary ?? ""}
                </p>
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
