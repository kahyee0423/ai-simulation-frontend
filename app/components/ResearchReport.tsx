import ReactMarkdown from "react-markdown";
import { FileText } from "lucide-react";
import { AgentStep, SimulationResult } from "../utils/type";

interface ResearchReportProps {
  currentStep: AgentStep;
  result: SimulationResult | null;
  loading: boolean;
}

export default function ResearchReport({ currentStep, result, loading }: ResearchReportProps) {
  return (
    <div className="lg:col-span-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-4 py-3 shrink-0">
        <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" /> Research Report
        </h3>
        {currentStep === "completed" && result?.report ? (
          <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            Ready
          </span>
        ) : (
          <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
            Pending Analysis...
          </span>
        )}
      </div>

      <div className="p-4 flex-1 overflow-y-auto min-h-0 flex flex-col justify-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        {currentStep === "completed" && result?.report ? (
          <div className="prose prose-invert prose-slate max-w-none text-xs md:text-sm leading-relaxed bg-slate-950/40 p-5 rounded-xl border border-slate-800/50 h-full overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <ReactMarkdown>{result.report}</ReactMarkdown>
          </div>
        ) : (
          <div className="text-center space-y-3 py-16 text-slate-500">
            <FileText className="w-10 h-10 mx-auto opacity-20 text-indigo-400 animate-pulse" />
            <p className="text-xs">
              {loading 
                ? "Agent is compiling simulation data & synthesizing analysis report..." 
                : "Waiting for simulation trial to complete..."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}