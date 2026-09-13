// frontend/src/components/StatsSummary.tsx
"use client";

import { BarChart3, CheckCircle2, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { SimulationResult } from "../utils/type";

interface StatsSummaryProps {
  result: SimulationResult | null;
  loading: boolean;
}

export default function StatsSummary({ result, loading }: StatsSummaryProps) {
  const summary = result?.statistical_summary;
  const criticApproved = result?.critic_approved;
  const criticFeedback = result?.critic_feedback;
  const hasCriticData = Boolean(criticFeedback && criticFeedback.length > 0);

  if (!summary && !loading) return null;

  return (
    <div className="bg-slate-900/60 border border-slate-800/60 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/60">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-semibold text-slate-200">Statistical Analysis</span>
        </div>

        {hasCriticData ? (
          criticApproved ? (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              <CheckCircle2 className="w-3 h-3" /> Critic Approved
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 font-medium">
              <AlertTriangle className="w-3 h-3" /> Critic Issues
            </span>
          )
        ) : (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
            Python-computed
          </span>
        )}
      </div>

      {/* Body */}
      <div className="px-4 py-3">
        {loading && !summary ? (
          <p className="text-xs text-slate-500 italic animate-pulse">Computing statistics...</p>
        ) : summary ? (
          <div className="prose prose-invert prose-slate max-w-none text-xs leading-relaxed
            [&_table]:w-full [&_table]:text-xs [&_table]:border-collapse
            [&_th]:text-left [&_th]:px-2 [&_th]:py-1 [&_th]:border [&_th]:border-slate-700/60 [&_th]:bg-slate-800/60 [&_th]:text-slate-300
            [&_td]:px-2 [&_td]:py-1 [&_td]:border [&_td]:border-slate-700/40 [&_td]:text-slate-300
            [&_tr:nth-child(even)_td]:bg-slate-800/20
            [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-cyan-300 [&_h3]:mt-3 [&_h3]:mb-1
            [&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-slate-200 [&_h2]:mt-4 [&_h2]:mb-2
          ">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </div>
        ) : null}
      </div>
    </div>
  );
}