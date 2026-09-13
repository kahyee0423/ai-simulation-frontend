import { Cpu, Play, Loader2 } from "lucide-react";

interface HeroSectionProps {
  prompt: string;
  setPrompt: (val: string) => void;
  loading: boolean;
  onSimulate: (e: React.FormEvent) => void;
}

export default function HeroSection({ prompt, setPrompt, loading, onSimulate }: HeroSectionProps) {
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

          <h1 className="mt-5 text-5xl md:text-7xl font-bold tracking-[-0.04em] leading-[0.95] bg-gradient-to-r bg-clip-text">
            AI Simulation Laboratory
          </h1>

          <p className="mt-5 max-w-2xl mx-auto text-sm md:text-base text-slate-400 leading-7">
            Turn a research hypothesis into a reproducible simulation.
            <br />
            <span className="text-slate-300">Plan → Code → Execute → Analyze</span>
            {" "}with an autonomous multi-agent workflow.
          </p>

          <div className="mt-5 flex items-center justify-center gap-5 text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-indigo-400" /> Natural language</span>
            <span className="h-3 w-px bg-slate-800" />
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-purple-400" /> Generated code</span>
            <span className="h-3 w-px bg-slate-800" />
            <span className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-pink-400" /> Research report</span>
          </div>
        </div>

        {/* Prompt area */}
        <div className="mt-9 max-w-4xl mx-auto">
          <div className="relative rounded-3xl border border-slate-700/70 bg-slate-900/85 backdrop-blur-2xl p-2 shadow-2xl shadow-black/40 ring-1 ring-white/[0.03]">
            <div className="rounded-[1.35rem] border border-slate-800/80 bg-slate-950/80 p-4 md:p-5">
              <form onSubmit={onSimulate}>
                <div className="flex items-center justify-between mb-3 px-1">
                  <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.14em]">
                    Research Scenario
                  </label>
                  <span className="text-[10px] text-slate-600">Describe what you want to simulate</span>
                </div>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Simulate 50 delivery drones navigating through a 10×10 city grid..."
                  rows={3}
                  className="w-full h-28 bg-transparent border-0 px-1 text-sm md:text-base text-slate-200 placeholder-slate-600 focus:outline-none resize-none leading-7"
                />

                <div className="mt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-800/80 pt-3">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                    Gemini + LangGraph
                    <span className="text-slate-700">•</span>
                    Autonomous execution
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !prompt.trim()}
                    className="group inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-transparent px-5 py-2.5 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:border-purple-500 hover:text-white hover:shadow-lg hover:shadow-purple-900/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:border-slate-700"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Running...</span>
                      </>
                    ) : (
                      <>
                        <span>Launch Simulation</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Example prompts */}
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {[
              "Drone routing in a city",
              "Epidemic spread model",
              "Multi-agent resource allocation",
            ].map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setPrompt(example)}
                className="rounded-full border border-slate-800 bg-slate-900/40 px-3 py-1.5 text-[10px] text-slate-500 transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/5 hover:text-slate-300"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}