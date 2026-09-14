import { useState } from "react";
import { Code, Copy, Check } from "lucide-react";
import { SimulationResult } from "../utils/type";
import { Translations, TRANSLATIONS } from "../utils/i18n";

interface CodeEditorProps {
  result: SimulationResult | null;
  loading: boolean;
  t?: Translations;
}

export default function CodeEditor({ result, loading, t = TRANSLATIONS.English }: CodeEditorProps) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2 flex-1 flex flex-col min-h-0">
      <div className="flex items-center justify-between shrink-0">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
          <Code className="w-3.5 h-3.5 text-indigo-400" /> simulation.py
        </span>
        {result?.code && (
          <button
            onClick={() => copyToClipboard(result.code || "")}
            className="flex items-center gap-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-md transition-all"
          >
            {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            {copied ? t.copied : t.copy}
          </button>
        )}
      </div>
      <pre className="bg-slate-950 p-4 rounded-xl overflow-y-auto text-xs font-mono text-indigo-200 border border-slate-800 shadow-inner flex-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <code>{result?.code || (loading ? t.generatingScript : t.readyForScript)}</code>
      </pre>
    </div>
  );
}