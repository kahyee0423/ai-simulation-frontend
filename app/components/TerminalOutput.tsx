import { Terminal, AlertCircle, ChevronUp, ChevronDown, GripHorizontal } from "lucide-react";
import { SimulationResult } from "../utils/type";

interface TerminalOutputProps {
  result: SimulationResult | null;
  loading: boolean;
  isBottomDocked?: boolean;
  isTerminalOpen?: boolean;
  setIsTerminalOpen?: (val: boolean) => void;
  onDragStart?: (e: React.DragEvent) => void;
}

export default function TerminalOutput({
  result,
  loading,
  isBottomDocked = false,
  isTerminalOpen = true,
  setIsTerminalOpen,
  onDragStart
}: TerminalOutputProps) {
  
  const content = (
    <div className="space-y-3 flex-1 flex flex-col min-h-0 text-xs font-mono">
      {result?.error && (
        <div className="space-y-1 shrink-0">
          <span className="text-[10px] font-semibold text-red-400 uppercase tracking-wider flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Trial Error Log
          </span>
          <div className="p-2.5 bg-red-950/20 border border-red-500/30 rounded-lg text-red-300 text-xs max-h-28 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            <pre className="whitespace-pre-wrap">{result.error}</pre>
          </div>
        </div>
      )}
      <div className="space-y-1.5 flex-1 flex flex-col min-h-0">
        {!isBottomDocked && (
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Terminal Output (Stdout)</span>
        )}
        <pre className={`bg-slate-950 p-4 rounded-xl overflow-y-auto text-xs font-mono text-emerald-400 border border-slate-800 shadow-inner [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isBottomDocked ? "max-h-36" : "flex-1"}`}>
          <code>{result?.output || (loading ? "Executing simulation sandbox..." : "No stdout output yet.")}</code>
        </pre>
      </div>
    </div>
  );

  // If docked to bottom, wrap inside a collapsible drawer
  if (isBottomDocked) {
    return (
      <div 
        draggable
        onDragStart={onDragStart}
        className="border border-slate-800 rounded-xl bg-slate-950 flex flex-col shrink-0 transition-all cursor-grab active:cursor-grabbing"
      >
        <div 
          onClick={() => setIsTerminalOpen?.(!isTerminalOpen)}
          className="flex items-center justify-between px-3.5 py-2 bg-slate-900/60 border-b border-slate-800/60 select-none rounded-t-xl hover:bg-slate-900"
        >
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
            <GripHorizontal className="w-3.5 h-3.5 opacity-50" />
            <Terminal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Terminal Output <span className="text-[10px] text-slate-500 font-normal">(Drag header to undock)</span></span>
            {result?.error && (
              <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-1.5 py-0.2 rounded text-[10px]">
                Error Occurred
              </span>
            )}
          </div>
          <button className="text-slate-400 hover:text-slate-200">
            {isTerminalOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
          </button>
        </div>

        {isTerminalOpen && <div className="p-3">{content}</div>}
      </div>
    );
  }

  return content;
}