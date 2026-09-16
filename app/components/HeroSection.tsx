import { Cpu, Play, Loader2 } from "lucide-react";
import { Translations } from "../utils/i18n";

interface HeroSectionProps {
  prompt: string;
  setPrompt: (val: string) => void;
  loading: boolean;
  onSimulate: (e: React.FormEvent) => void;
  t: Translations;
  isLimitReached?: boolean;
}

export default function HeroSection({
  prompt,
  setPrompt,
  loading,
  onSimulate,
  t,
  isLimitReached = false,
}: HeroSectionProps) {
  return (
    <section className="relative flex-1 min-h-0 flex items-center justify-center overflow-hidden py-6 md:py-10">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-10 h-72 w-72 -translate-x-1/2 rounded-full bg-indigo-600/10 blur-3xl" />
        <div className="absolute left-1/4 bottom-0 h-56 w-56 rounded-full bg-purple-600/10 blur-3xl" />
        <div className="absolute right-1/4 top-1/3 h-48 w-48 rounded-full bg-pink-600/5 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-40" />
      </div>

      <div className="relative z-10 w-full max-w-5xl">
        <div className="text-center">
          <h1 className="mt-5 text-4xl md:text-6xl font-bold tracking-tight leading-tight bg-gradient-to-r from-slate-100 via-indigo-200 to-slate-300 bg-clip-text text-transparent">
            {t.heroTitle}
          </h1>

          <p className="mt-4 max-w-2xl mx-auto text-xs md:text-sm text-slate-400 leading-relaxed">
            {t.heroSubtitle}
          </p>

          <div className="mt-4 flex items-center justify-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Natural Language</span>
            <span className="h-3 w-px bg-slate-800" />
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-purple-400" /> Python Code</span>
            <span className="h-3 w-px bg-slate-800" />
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-pink-400" /> Research Report</span>
          </div>
        </div>

        {/* Prompt area */}
        <div className="mt-7 max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-slate-700/70 bg-slate-900/85 backdrop-blur-2xl p-2 shadow-2xl shadow-black/40 ring-1 ring-white/[0.03]">
            <div className="rounded-[1.35rem] border border-slate-800/80 bg-slate-950/80 p-4 md:p-5">
              <form onSubmit={onSimulate}>
                <div className="flex items-center justify-between mb-2.5 px-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    {t.appTitle}
                  </label>
                  <span className="text-[10px] text-slate-500">{t.poweredBy}</span>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder={isLimitReached ? "Simulation limit reached (1/1 run used). Contact administrator to reset." : t.inputPlaceholder}
                  disabled={isLimitReached || loading}
                  rows={3}
                  className="w-full h-24 bg-transparent border-0 px-1 text-xs md:text-sm text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-relaxed disabled:opacity-60 disabled:cursor-not-allowed"
                />

                {isLimitReached && (
                  <div className="mt-2 py-1.5 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center justify-between">
                    <span>You have used your 1 simulation grant.</span>
                    <span className="text-[10px] font-semibold bg-amber-500/20 px-2 py-0.5 rounded">Limit Reached</span>
                  </div>
                )}

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    Gemini + LangGraph
                    <span className="text-slate-700">•</span>
                    Autonomous Simulation
                  </div>

                  <button
                    type="submit"
                    disabled={isLimitReached || loading || !prompt.trim()}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-xs md:text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-900/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:border-slate-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                        <span>{t.running}</span>
                      </>
                    ) : isLimitReached ? (
                      <span>Limit Reached (1/1)</span>
                    ) : (
                      <>
                        <span>{t.launchAgent}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Example prompts */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {t.samplePrompts.map((example, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPrompt(example.prompt)}
                className="rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-[10px] text-slate-400 transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/10 hover:text-slate-200"
                title={example.prompt}
              >
                {example.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}