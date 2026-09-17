"use client";

import { useState, useEffect, useCallback } from "react";
import { Play, Loader2, Code, Terminal, Cpu, Check, RefreshCw, GripHorizontal, FlaskConical, ShieldCheck, Sigma, ScanSearch, Globe } from "lucide-react";
import { AgentStep, TabId, SimulationResult } from "./utils/type";
import { SupportedLanguage, detectPromptLanguage, getTranslations } from "./utils/i18n";
import HeroSection from "./components/HeroSection";
import ResearchReport from "./components/ResearchReport";
import CodeEditor from "./components/CodeEditor";
import TerminalOutput from "./components/TerminalOutput";
import AuthGuard from "./components/AuthGuard";
import UserBadge from "./components/UserBadge";
import { useAuth } from "./context/AuthContext";
import { recordSimulation } from "./lib/firestore";

function HomeContent() {
  const { user, userRecord, isAdmin, refreshUserRecord } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentStep, setCurrentStep] = useState<AgentStep>("idle");
  const [activeTab, setActiveTab] = useState<TabId>("code");
  const [tabOrder, setTabOrder] = useState<TabId[]>(["code", "output"]);
  const [isBottomDocked, setIsBottomDocked] = useState(false);
  const [isTerminalOpen, setIsTerminalOpen] = useState(true);
  const [draggedTab, setDraggedTab] = useState<TabId | null>(null);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [selectedLang, setSelectedLang] = useState<SupportedLanguage>("English");

  const isUsageLimitReached = !isAdmin && !!userRecord && userRecord.usageCount >= 1;

  // Clear in-memory state when the user leaves the page (tab close, back button, navigate away).
  // Results remain in Firestore only for usage-limit enforcement — they are never re-displayed.
  const clearSession = useCallback(() => {
    setResult(null);
    setPrompt("");
    setHasStarted(false);
    setCurrentStep("idle");
    setLoading(false);
  }, []);

  useEffect(() => {
    // 1. Browser Back/Forward navigation: wipe in-memory state so previous run cannot be seen
    const handlePopState = () => {
      clearSession();
    };

    // 2. bfcache restoration (user clicked back button to return to page from cache): clear immediately
    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted) {
        clearSession();
      }
    };

    // 3. Tab close, window close, or navigate away: clear session
    // Note: We deliberately do NOT listen to visibilitychange, so minimizing the window or switching tabs keeps memory intact.
    const handlePageHide = () => {
      clearSession();
    };

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("pageshow", handlePageShow);
    window.addEventListener("pagehide", handlePageHide);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("pageshow", handlePageShow);
      window.removeEventListener("pagehide", handlePageHide);
    };
  }, [clearSession]);

  // Determine active UI language: explicit selection -> result language -> English
  const effectiveLang = selectedLang !== "auto"
    ? selectedLang
    : (result?.language || "English");
  const t = getTranslations(effectiveLang);

  const rawApiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    "http://localhost:8000";

  const API_URL = rawApiUrl.endsWith("/api/simulate")
    ? rawApiUrl
    : `${rawApiUrl.replace(/\/+$/, "")}/api/simulate`;

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    if (isUsageLimitReached) {
      alert("You have already used your 1 simulation grant. Please contact your administrator if you need your usage reset.");
      return;
    }

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
        body: JSON.stringify({
          prompt,
          language: selectedLang !== "auto" ? selectedLang : "auto"
        }),
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

        // Record simulation usage & result in Firestore AFTER successful simulation
        if (user) {
          try {
            await recordSimulation(user.uid, prompt, data);
            await refreshUserRecord();
          } catch (firestoreErr) {
            console.error("Failed to record simulation usage:", firestoreErr);
          }
        }
      } else {
        setCurrentStep("error");
        alert(data.detail || "Simulation failed");
      }
    } catch (err) {
      clearTimeout(timer1);
      console.error(err);
      setCurrentStep("error");
      alert(`Failed to connect to backend server (${API_URL}). If using Render free-tier, it may take 50–60 seconds to wake up from sleep. Please check your network and try again.`);
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
      <div className="w-full mx-auto flex flex-col h-full">
        {/* Top App Bar with Language Selector */}
        <div className="flex items-center justify-between shrink-0 mb-1">
          {hasStarted ? (
            <h1 className="text-xl font-extrabold tracking-tight text-slate-200">
              {t.appTitle}
            </h1>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold tracking-wider text-indigo-400 uppercase">
                {t.appTitle}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2.5">
            {/* Language Selector Dropdown */}
            <div className="relative inline-flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 shadow-sm hover:border-slate-700 transition-all">
              <Globe className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <select
                value={selectedLang}
                onChange={(e) => setSelectedLang(e.target.value as SupportedLanguage)}
                className="bg-transparent text-xs text-slate-200 focus:outline-none cursor-pointer pr-1"
                aria-label="Select interface language"
              >
                <option value="English" className="bg-slate-900 text-slate-200">English</option>
                <option value="Chinese" className="bg-slate-900 text-slate-200">中文 (Chinese)</option>
                <option value="Spanish" className="bg-slate-900 text-slate-200">Español (Spanish)</option>
                <option value="French" className="bg-slate-900 text-slate-200">Français (French)</option>
                <option value="German" className="bg-slate-900 text-slate-200">Deutsch (German)</option>
                <option value="Japanese" className="bg-slate-900 text-slate-200">日本語 (Japanese)</option>
              </select>
            </div>

            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-[11px] font-semibold tracking-wide uppercase border border-indigo-500/20 shadow-sm">
              <Cpu className="w-3 h-3" /> {t.poweredBy}
            </div>

            {/* User badge */}
            <UserBadge />
          </div>
        </div>

        {!hasStarted ? (
          <HeroSection
            prompt={prompt}
            setPrompt={setPrompt}
            loading={loading}
            onSimulate={handleSimulate}
            t={t}
            isLimitReached={isUsageLimitReached}
          />
        ) : (
          <>
            {/* Compact input bar after launch */}
            <div className="transition-all duration-300 shrink-0 pt-1.5 w-full mx-auto">
              {isUsageLimitReached && (
                <div className="mb-2 py-1 px-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                    <span className="truncate">Simulation grant used (1/1). You can review your code, logs, and report below.</span>
                  </div>
                  <span className="text-[10px] font-semibold bg-amber-500/20 px-2 py-0.5 rounded shrink-0">1/1 Limit</span>
                </div>
              )}
              <form onSubmit={handleSimulate} className="flex gap-3 items-start">
                <div className="relative flex-1">
                  <textarea
                    value={prompt}
                    onChange={(e) => {
                      setPrompt(e.target.value);
                      e.target.style.height = 'auto';
                      e.target.style.height = `${Math.min(e.target.scrollHeight, 160)}px`;
                    }}
                    placeholder={isUsageLimitReached ? "Simulation limit reached (1/1 run used)." : t.inputPlaceholder}
                    disabled={isUsageLimitReached || loading}
                    rows={1}
                    className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-3.5 py-2.5 text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 text-xs md:text-sm resize-none shadow-inner transition-all max-h-40 leading-relaxed [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isUsageLimitReached || loading || !prompt.trim()}
                  className="flex items-center justify-center gap-2 bg-transparent border border-slate-700 hover:border-purple-500 text-white font-medium rounded-xl transition-all shadow-lg text-xs md:text-sm whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed px-6 py-2.5 shrink-0 h-[42px]"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                      <span>{t.running}</span>
                    </>
                  ) : isUsageLimitReached ? (
                    <span>Limit Reached</span>
                  ) : (
                    <span>{t.launchAgent}</span>
                  )}
                </button>
              </form>
            </div>

            {/* Main Split Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 flex-1 min-h-0 pb-2 mt-2.5">
              
              <ResearchReport currentStep={currentStep} result={result} loading={loading} t={t} />

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
                              <Code className="w-3.5 h-3.5" /> {t.pythonIde}
                            </>
                          ) : (
                            <>
                              <Terminal className="w-3.5 h-3.5" /> {t.terminalOutput}
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
                        <Loader2 className="w-3 h-3 animate-spin" /> {t.parsingScenarioStatus}
                      </span>
                    )}
                    {currentStep === "planning" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full">
                        <Loader2 className="w-3 h-3 animate-spin" /> {t.planningStatus}
                      </span>
                    )}
                    {currentStep === "critiquing" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-full">
                        <ShieldCheck className="w-3 h-3 animate-pulse" /> {t.criticReviewingStatus}
                      </span>
                    )}
                    {currentStep === "executing" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                        <FlaskConical className="w-3 h-3 animate-bounce" /> {t.simulatingStatus}
                      </span>
                    )}
                    {currentStep === "validating" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-teal-400 bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 rounded-full">
                        <ScanSearch className="w-3 h-3 animate-pulse" /> {t.validatingResultsStatus}
                      </span>
                    )}
                    {currentStep === "analyzing" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                        <Sigma className="w-3 h-3 animate-pulse" /> {t.analyzingStatus}
                      </span>
                    )}
                    {currentStep === "retrying" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-purple-400 bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-full">
                        <RefreshCw className="w-3 h-3 animate-spin" /> {t.running}
                      </span>
                    )}
                    {currentStep === "completed" && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <Check className="w-3 h-3" /> {t.ready}
                      </span>
                    )}
                  </div>
                </div>

                <div 
                  onDragOver={handleDragOver}
                  onDrop={handleEditorDrop}
                  className="p-4 flex-1 flex flex-col min-h-0"
                >
                  {!isBottomDocked ? (
                    <div className="flex-1 flex flex-col min-h-0">
                      {activeTab === "code" ? (
                        <CodeEditor result={result} loading={loading} t={t} />
                      ) : (
                        <TerminalOutput result={result} loading={loading} t={t} />
                      )}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col min-h-0 gap-3">
                      <CodeEditor result={result} loading={loading} t={t} />
                      <TerminalOutput 
                        result={result} 
                        loading={loading} 
                        isBottomDocked={true}
                        isTerminalOpen={isTerminalOpen}
                        setIsTerminalOpen={setIsTerminalOpen}
                        onDragStart={(e) => handleDragStart(e, "output")}
                        t={t}
                      />
                    </div>
                  )}
                </div>

              </div>

            </div>
          </>
        )}

      </div>
    </main>
  );
}

export default function Home() {
  return (
    <AuthGuard>
      <HomeContent />
    </AuthGuard>
  );
}