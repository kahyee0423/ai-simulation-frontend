"use client";

import { useState } from "react";
import { Play, Loader2, Code, Terminal, Cpu, Check, RefreshCw, GripHorizontal, FlaskConical, ShieldCheck, Sigma, ScanSearch } from "lucide-react";
import { AgentStep, TabId, SimulationResult } from "./utils/type";
import HeroSection from "./components/HeroSection";
import ResearchReport from "./components/ResearchReport";
import CodeEditor from "./components/CodeEditor";
import TerminalOutput from "./components/TerminalOutput";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState<AgentStep>("idle");
  
  // Tab layout state
  const [activeTab, setActiveTab] = useState<TabId>("code");
  const [tabOrder, setTabOrder] = useState<TabId[]>(["code", "output"]);
  const [isBottomDocked, setIsBottomDocked] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);

  // Drag and drop state
  const [draggedTab, setDraggedTab] = useState<TabId | null>(null);

  const [result, setResult] = useState<SimulationResult | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/simulate";

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setHasStarted(true);
    setResult(null);
    setCurrentStep("parsing");

    const timer1 = setTimeout(() => setCurrentStep("planning"), 2000);
    const timer2 = setTimeout(() => setCurrentStep("executing"), 5000);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      clearTimeout(timer1);
      clearTimeout(timer2);

      if (response.ok) {
        setResult(data);
        if (data.error && data.error.length > 0) {
          setCurrentStep("retrying");
          setTimeout(() => setCurrentStep("completed"), 1500);
        } else {
          setCurrentStep("completed");
        }
      } else {
        setCurrentStep("error");
        alert(data.detail || "Simulation failed");
      }
    } catch (err) {
      clearTimeout(timer1);
      console.error(err);
      setCurrentStep("error");
      alert("Failed to connect to backend server. Make sure your FastAPI backend is running locally on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop handlers
  const handleDragStart = (e: React.DragEvent, tab: TabId) => {
    setDraggedTab(tab);
    e.dataTransfer.setData("text/plain", tab);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleTabDrop = (e: React.DragEvent, targetTab: TabId) => {
    e.preventDefault();
    if (!draggedTab || draggedTab === targetTab) return;

    const newOrder = [...tabOrder];
    const draggedIdx = newOrder.indexOf(draggedTab);
    const targetIdx = newOrder.indexOf(targetTab);

    newOrder.splice(draggedIdx, 1);
    newOrder.splice(targetIdx, 0, draggedTab);

    setTabOrder(newOrder);
    setDraggedTab(null);
  };

  const handleEditorDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedTab) return;

    if (draggedTab === "output") {
      setIsBottomDocked(true);
      setActiveTab("code");
    } else if (draggedTab === "code" && isBottomDocked) {
      setIsBottomDocked(false);
    }
    setDraggedTab(null);
  };

  const handleHeaderDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (draggedTab === "output" && isBottomDocked) {
      setIsBottomDocked(false);
      setActiveTab("output");
    }
    setDraggedTab(null);
  };

  return (
    <main className="h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 p-4 md:p-6 flex flex-col selection:bg-indigo-500 selection:text-white">
      <div className="max-w-7xl w-full mx-auto flex flex-col h-full">
        
        {/* Dynamic Header Layout */}
        {hasStarted ? (
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 shrink-0">
            <h1 className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              AI Simulation Scientist
            </h1>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-semibold tracking-wide uppercase border border-indigo-500/20 shadow-sm">
              <Cpu className="w-3 h-3" /> Powered by Gemini & LangGraph
            </div>
          </div>
        ) : (
          <HeroSection prompt={prompt} setPrompt={setPrompt} loading={loading} onSimulate={handleSimulate} />
        )}

        {/* Compact input bar after launch (Scrollable, Scrollbar Hidden) */}
        {hasStarted && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl shadow-xl transition-all duration-300 shrink-0 p-3 max-w-7xl w-full mx-auto">
            <form onSubmit={handleSimulate} className="flex gap-3 items-end">
              <div className="relative flex-1">
                <textarea
                  value={prompt}
                  onChange={(e) => {
                    setPrompt(e.target.value);
                    // Auto-grow height logic
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                  }}
                  placeholder="e.g., Simulate 50 delivery drones navigating through a 10x10 city grid..."
                  rows={1}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-xs md:text-sm resize-none shadow-inner transition-all max-h-40 leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
                />
              </div>

              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="flex items-center justify-center gap-2 bg-transparent border border-slate-700 hover:border-purple-500 text-white font-medium rounded-xl transition-all shadow-lg text-xs md:text-sm whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed px-6 h-12 shrink-0"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current text-purple-400" />
                    <span>Launch Agent</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Main Split Layout */}
        {hasStarted && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 pb-2 mt-3">
            
            <ResearchReport currentStep={currentStep} result={result} loading={loading} />

            {/* RIGHT COLUMN: IDE & Workspace */}
            <div className="lg:col-span-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
              
              {/* Workspace Navigation Header */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleHeaderDrop}
                className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-4 pt-2 shrink-0"
              >
                <div className="flex gap-2">
                  {tabOrder.map((tab) => {
                    if (tab === "output" && isBottomDocked) return null;

                    return (
                      <div
                        key={tab}
                        draggable
                        onDragStart={(e) => handleDragStart(e, tab)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleTabDrop(e, tab)}
                        onClick={() => setActiveTab(tab)}
                        className={`flex items-center gap-1.5 px-3 py-2 font-medium text-xs rounded-t-lg transition-all border-t border-x cursor-grab active:cursor-grabbing ${
                          activeTab === tab && !isBottomDocked
                            ? "bg-slate-900 border-slate-800 text-indigo-400 shadow-sm"
                            : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/40"
                        }`}
                      >
                        <GripHorizontal className="w-3 h-3 opacity-40" />
                        {tab === "code" ? (
                          <>
                            <Code className="w-3.5 h-3.5" /> Python IDE
                          </>
                        ) : (
                          <>
                            <Terminal className="w-3.5 h-3.5" /> Terminal Output
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 pb-1">
                  {currentStep === "parsing" && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-violet-400 bg-violet-500/10 border border-violet-500/20 px-2 py-0.5 rounded-full">
                      <Loader2 className="w-3 h-3 animate-spin" /> Parsing scenario...
                    </span>
                  )}
                  {currentStep === "planning" && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                      <Loader2 className="w-3 h-3 animate-spin" /> Planning...
                    </span>
                  )}
                  {currentStep === "critiquing" && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                      <ShieldCheck className="w-3 h-3 animate-pulse" /> Critic reviewing...
                    </span>
                  )}
                  {currentStep === "executing" && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                      <FlaskConical className="w-3 h-3 animate-bounce" /> Simulating...
                    </span>
                  )}
                  {currentStep === "validating" && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
                      <ScanSearch className="w-3 h-3 animate-pulse" /> Validating results...
                    </span>
                  )}
                  {currentStep === "analyzing" && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                      <Sigma className="w-3 h-3 animate-pulse" /> Analyzing...
                    </span>
                  )}
                  {currentStep === "retrying" && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                      <RefreshCw className="w-3 h-3 animate-spin" /> Fixing error...
                    </span>
                  )}
                  {currentStep === "completed" && (
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                      <Check className="w-3 h-3" /> Ready
                    </span>
                  )}
                </div>
              </div>

              {/* Workspace Content */}
              <div 
                onDragOver={handleDragOver}
                onDrop={handleEditorDrop}
                className="p-4 flex-1 flex flex-col min-h-0"
              >
                {!isBottomDocked ? (
                  <div className="flex-1 flex flex-col min-h-0">
                    {activeTab === "code" ? (
                      <CodeEditor result={result} loading={loading} />
                    ) : (
                      <TerminalOutput result={result} loading={loading} />
                    )}
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col min-h-0 gap-3">
                    <CodeEditor result={result} loading={loading} />
                    <TerminalOutput 
                      result={result} 
                      loading={loading} 
                      isBottomDocked={true}
                      isTerminalOpen={isTerminalOpen}
                      setIsTerminalOpen={setIsTerminalOpen}
                      onDragStart={(e) => handleDragStart(e, "output")}
                    />
                  </div>
                )}
              </div>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}