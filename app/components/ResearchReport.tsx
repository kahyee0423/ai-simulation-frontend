import ReactMarkdown from "react-markdown";
import { FileText } from "lucide-react";
import { AgentStep, SimulationResult } from "../utils/type";
import SimulationSpec from "./SimulationSpec";
import StatsSummary from "./StatsSummary";

interface ResearchReportProps {
  currentStep: AgentStep;
  result: SimulationResult | null;
  loading: boolean;
}

export default function ResearchReport({ currentStep, result, loading }: ResearchReportProps) {
  const hasSpec = Boolean(result?.simulation_spec);
  const hasStats = Boolean(result?.statistical_summary);
  const hasReport = Boolean(result?.report);
  const isCompleted = currentStep === "completed";

  return (
    <div className="lg:col-span-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-4 py-3 shrink-0">
        <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" /> Research Report
        </h3>
        {isCompleted && hasReport ? (
          <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Ready
          </span>
        ) : (
          <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
            {loading ? "Running pipeline..." : "Pending Analysis..."}
          </span>
        )}
      </div>

      {/* Body — scrollable */}
      <div className="p-4 flex-1 overflow-y-auto min-h-0 flex flex-col gap-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

        {/* Simulation Spec (always show when available or loading) */}
        {(hasSpec || loading) && (
          <SimulationSpec result={result} loading={loading} />
        )}

        {/* Stats Summary */}
        {(hasStats || (loading && hasSpec)) && (
          <StatsSummary result={result} loading={loading} />
        )}

        {/* LLM Research Report */}
        {isCompleted && hasReport ? (
          <div className="prose prose-invert prose-slate max-w-none text-xs md:text-sm leading-relaxed bg-slate-950/40 p-5 rounded-xl border border-slate-800/50 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <ReactMarkdown>{result!.report!}</ReactMarkdown>
          </div>
        ) : !loading ? (
          <div className="text-center space-y-3 py-16 text-slate-500">
            <FileText className="w-10 h-10 mx-auto opacity-20 text-indigo-400 animate-pulse" />
            <p className="text-xs">Waiting for simulation trial to complete...</p>
          </div>
        ) : !hasSpec ? (
          <div className="text-center space-y-3 py-16 text-slate-500">
            <FileText className="w-10 h-10 mx-auto opacity-20 text-indigo-400 animate-pulse" />
            <p className="text-xs">
              Agent is parsing scenario &amp; compiling simulation plan...
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}