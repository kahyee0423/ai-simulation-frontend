"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Play, Loader2, Code, Terminal, FileText, Cpu } from "lucide-react";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"report" | "code" | "output">("report");
  const [result, setResult] = useState<{
    plan?: string;
    code?: string;
    output?: string;
    error?: string;
    report?: string;
  } | null>(null);

  // If running locally, point to localhost:8000. 
  // Later if you deploy backend to Render/Railway, replace this with your cloud backend URL.
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/simulate";

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data);
      } else {
        alert(data.detail || "Simulation failed");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to connect to backend server. Make sure your FastAPI backend is running locally on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-medium border border-indigo-500/20">
            <Cpu className="w-4 h-4" /> Powered by Qwen & LangGraph
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Simulation Scientist
          </h1>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Describe any scenario in natural language. The autonomous agent will plan, write simulation code, execute it in a sandbox, and analyze the results.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSimulate} className="space-y-4">
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g., Simulate 50 delivery drones navigating through a 10x10 city grid with random battery drain and find the optimal charging station density..."
              className="w-full h-36 bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none shadow-inner"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !prompt.trim()}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-3.5 px-6 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Running Autonomous Simulation & Analysis...
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-current" />
                Launch Simulation Agent
              </>
            )}
          </button>
        </form>

        {/* Results Section */}
        {result && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Tabs Header */}
            <div className="flex border-b border-slate-800 bg-slate-950/50">
              <button
                onClick={() => setActiveTab("report")}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                  activeTab === "report"
                    ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-4 h-4" /> Research Report
              </button>
              <button
                onClick={() => setActiveTab("code")}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                  activeTab === "code"
                    ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Code className="w-4 h-4" /> Generated Python Code
              </button>
              <button
                onClick={() => setActiveTab("output")}
                className={`flex items-center gap-2 px-6 py-4 font-medium text-sm border-b-2 transition-all ${
                  activeTab === "output"
                    ? "border-indigo-500 text-indigo-400 bg-indigo-500/5"
                    : "border-transparent text-slate-400 hover:text-slate-200"
                }`}
              >
                <Terminal className="w-4 h-4" /> Terminal Output
              </button>
            </div>

            {/* Tabs Content */}
            <div className="p-6 md:p-8 min-h-[300px]">
              {activeTab === "report" && (
                <div className="prose prose-invert max-w-none">
                  <ReactMarkdown>{result.report || "No report generated."}</ReactMarkdown>
                </div>
              )}

              {activeTab === "code" && (
                <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto text-sm font-mono text-indigo-300 border border-slate-800">
                  <code>{result.code || "No code generated."}</code>
                </pre>
              )}

              {activeTab === "output" && (
                <div className="space-y-4">
                  {result.error && (
                    <div className="p-4 bg-red-950/30 border border-red-500/30 rounded-xl text-red-400 text-sm font-mono">
                      <strong>Execution Error:</strong>
                      <pre className="mt-2 whitespace-pre-wrap">{result.error}</pre>
                    </div>
                  )}
                  <pre className="bg-slate-950 p-4 rounded-xl overflow-x-auto text-sm font-mono text-emerald-400 border border-slate-800">
                    <code>{result.output || "No stdout output."}</code>
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}