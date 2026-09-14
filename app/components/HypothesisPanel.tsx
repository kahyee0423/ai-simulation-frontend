"use client";

import { Brain, TrendingUp, TrendingDown, Minus, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { SimulationResult } from "../utils/type";
import { Translations, TRANSLATIONS } from "../utils/i18n";

interface HypothesisPanelProps {
  result: SimulationResult | null;
  loading: boolean;
  t?: Translations;
}

interface Hypothesis {
  id: string;
  name: string;
  description: string;
  prior: number;
  posterior: number;
  posterior_rank: number;
  status: "dominant" | "plausible" | "low_probability" | "excluded";
  exclusion_reason?: string;
}

interface EvidenceItem {
  evidence: string;
  provenance: string;
  justification: string;
}

interface HypothesisData {
  hypotheses: Hypothesis[];
  evidence_log: EvidenceItem[];
  dominant_hypothesis_name: string;
  dominant_posterior: number;
  secondary_hypotheses: string[];
  excluded_hypotheses: string[];
  simulation_focus: string;
  multi_branch_required: boolean;
  multi_branch_reason?: string;
}

function StatusBadge({ status, t }: { status: Hypothesis["status"]; t: Translations }) {
  const configs = {
    dominant:       { label: t.hypoDominant,      cls: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
    plausible:      { label: t.hypoPlausible,     cls: "bg-sky-500/15 text-sky-400 border-sky-500/30" },
    low_probability:{ label: t.hypoLowProb,       cls: "bg-slate-500/15 text-slate-400 border-slate-600/30" },
    excluded:       { label: t.hypoExcluded,      cls: "bg-red-500/10 text-red-400 border-red-500/20" },
  };
  const cfg = configs[status] ?? configs.low_probability;
  return (
    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function ProvenanceBadge({ label }: { label: string }) {
  const colours: Record<string, string> = {
    USER_PROVIDED:    "text-emerald-400",
    OBSERVED:         "text-cyan-400",
    AI_INFERENCE:     "text-violet-400",
    MODEL_ASSUMPTION: "text-amber-400",
    DERIVED:          "text-sky-400",
  };
  const cls = colours[label.trim()] ?? "text-slate-400";
  return <span className={`text-[9px] font-bold ${cls}`}>[{label.trim()}]</span>;
}

function DeltaIcon({ delta }: { delta: number }) {
  if (delta > 0.01) return <TrendingUp className="w-3 h-3 text-emerald-400 shrink-0" />;
  if (delta < -0.01) return <TrendingDown className="w-3 h-3 text-red-400 shrink-0" />;
  return <Minus className="w-3 h-3 text-slate-500 shrink-0" />;
}

export default function HypothesisPanel({ result, loading, t = TRANSLATIONS.English }: HypothesisPanelProps) {
  const [showEvidence, setShowEvidence] = useState(false);
  const rawJson = result?.hypothesis_analysis;

  if (!rawJson && !loading) return null;

  let data: HypothesisData | null = null;
  if (rawJson) {
    try {
      data = JSON.parse(rawJson) as HypothesisData;
    } catch {
      //malformed JSON, still render skeleton or nothing
    }
  }

  const sorted = data?.hypotheses
    ? [...data.hypotheses].sort((a, b) => b.posterior - a.posterior)
    : [];

  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-400" />
          <span className="text-xs font-semibold text-slate-200">{t.hypoTitle}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 font-medium">
            {t.hypoBayesianBadge}
          </span>
        </div>
        {data?.multi_branch_required && (
          <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
            {t.hypoMultiBranchBadge}
          </span>
        )}
      </div>

      <div className="px-4 py-3 space-y-3">
        {loading && !data ? (
          <p className="text-xs text-slate-500 italic animate-pulse">
            {t.hypoUpdating}
          </p>
        ) : !data ? (
          <p className="text-xs text-slate-500 italic">{t.hypoNoData}</p>
        ) : (
          <>
            {data.simulation_focus && (
              <p className="text-[10px] text-slate-400 leading-relaxed border-l-2 border-violet-500/40 pl-2">
                {data.simulation_focus}
              </p>
            )}

            <div className="space-y-2">
              {sorted.map((h) => {
                const delta = h.posterior - h.prior;
                const barColor =
                  h.status === "dominant"        ? "bg-amber-500"
                  : h.status === "plausible"     ? "bg-sky-500"
                  : h.status === "excluded"      ? "bg-red-500/50"
                  :                               "bg-slate-600";

                return (
                  <div key={h.id} className="group">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <DeltaIcon delta={delta} />
                        <span className="text-[10px] font-medium text-slate-300 truncate">
                          {h.name}
                        </span>
                        <StatusBadge status={h.status} t={t} />
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="text-[10px] text-slate-500 line-through">
                          {(h.prior * 100).toFixed(0)}%
                        </span>
                        <span
                          className={`text-[11px] font-bold tabular-nums ${
                            h.status === "dominant" ? "text-amber-400"
                            : h.status === "plausible" ? "text-sky-400"
                            : h.status === "excluded" ? "text-red-400"
                            : "text-slate-500"
                          }`}
                        >
                          {(h.posterior * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    {/* Dual bar: prior (ghost) + posterior (solid) */}
                    <div className="relative h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      {/* prior ghost */}
                      <div
                        className="absolute top-0 left-0 h-full bg-slate-600/40 rounded-full"
                        style={{ width: `${h.prior * 100}%` }}
                      />
                      {/* posterior solid */}
                      <div
                        className={`absolute top-0 left-0 h-full rounded-full transition-all duration-700 ${barColor}`}
                        style={{ width: `${h.posterior * 100}%` }}
                      />
                    </div>

                    {/* Description tooltip on hover */}
                    <p className="text-[9px] text-slate-600 group-hover:text-slate-400 transition-colors leading-relaxed mt-0.5 truncate">
                      {h.exclusion_reason ?? h.description}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Evidence toggle */}
            {data.evidence_log && data.evidence_log.length > 0 && (
              <div>
                <button
                  onClick={() => setShowEvidence((v) => !v)}
                  className="flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors mt-1"
                >
                  {showEvidence ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {data.evidence_log.length} {t.hypoEvidenceApplied}
                </button>

                {showEvidence && (
                  <div className="mt-2 space-y-1.5 border-l border-slate-800 pl-3">
                    {data.evidence_log.map((ev, i) => (
                      <div key={i} className="space-y-0.5">
                        <div className="flex items-start gap-1.5">
                          <AlertCircle className="w-2.5 h-2.5 text-slate-500 mt-0.5 shrink-0" />
                          <span className="text-[10px] text-slate-300 leading-snug">{ev.evidence}</span>
                          <ProvenanceBadge label={ev.provenance} />
                        </div>
                        <p className="text-[9px] text-slate-500 ml-4 leading-relaxed">{ev.justification}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Multi-branch note */}
            {data.multi_branch_required && data.multi_branch_reason && (
              <p className="text-[9px] text-amber-400/70 leading-relaxed border-t border-slate-800/60 pt-2">
                ⚡ {data.multi_branch_reason}
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
