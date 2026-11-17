"use client";

import React, { useState } from "react";
import { BarChart3, Download, Maximize2, Minimize2, ZoomIn, Sparkles, CheckCircle2 } from "lucide-react";
import { Translations, TRANSLATIONS } from "../utils/i18n";

interface ChartVisualizerProps {
  chart?: string;
  loading: boolean;
  t?: Translations;
}

export default function ChartVisualizer({ chart, loading, t = TRANSLATIONS.English }: ChartVisualizerProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleDownload = () => {
    if (!chart) return;
    const link = document.createElement("a");
    link.href = chart;
    link.download = `simulation_empirical_chart_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-950/60 relative">
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-900/60 px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-cyan-400" />
            {t.chartVisualizer || "Scientific Empirical Figures"}
          </span>

        </div>

        <div className="flex items-center gap-2">
          {chart && (
            <>
              <button
                onClick={() => setIsZoomed(!isZoomed)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all text-xs flex items-center gap-1"
                title={isZoomed ? "Fit to View" : "Original Zoom"}
              >
                <ZoomIn className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">{isZoomed ? "Fit" : "100%"}</span>
              </button>

              <button
                onClick={handleDownload}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium transition-all shadow-sm"
                title="Download high-resolution PNG"
              >
                {downloadSuccess ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Saved</span>
                  </>
                ) : (
                  <>
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PNG</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all"
                title="Toggle Fullscreen"
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Chart Canvas Area */}
      <div className={`flex-1 p-4 overflow-auto flex items-center justify-center [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden ${isFullscreen ? "fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-2xl p-8" : ""}`}>
        {isFullscreen && (
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-white shadow-xl z-10"
          >
            <Minimize2 className="w-5 h-5" />
          </button>
        )}

        {chart ? (
          <div className="relative group max-w-full max-h-full flex flex-col items-center justify-center">
            {/* Glowing Accent Border */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl blur-sm opacity-60 group-hover:opacity-100 transition-opacity" />
            
            <div className="relative rounded-xl overflow-hidden border border-slate-800/90 bg-slate-900/90 shadow-2xl p-2 flex flex-col items-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={chart}
                alt="AI Simulation Empirical Chart"
                className={`rounded-lg object-contain transition-all duration-300 ${isZoomed ? "max-w-none w-auto" : "max-w-full max-h-[68vh] w-auto h-auto"}`}
              />


            </div>
          </div>
        ) : loading ? (
          <div className="text-center space-y-3 py-16 text-slate-500">
            <div className="relative w-12 h-12 mx-auto">
              <div className="absolute inset-0 rounded-full border-2 border-indigo-500/20 border-t-indigo-500 animate-spin" />
              <BarChart3 className="w-6 h-6 text-indigo-400 absolute inset-0 m-auto animate-pulse" />
            </div>
            <p className="text-xs text-slate-400 font-medium">Synthesizing Empirical Charts & Bayesian Shifts...</p>
            <p className="text-[11px] text-slate-600">Extracting distributions and confidence boundaries</p>
          </div>
        ) : (
          <div className="text-center space-y-3 py-16 text-slate-500">
            <BarChart3 className="w-12 h-12 mx-auto opacity-20 text-indigo-400" />
            <p className="text-xs text-slate-400">No empirical chart generated yet.</p>
            <p className="text-[11px] text-slate-600 max-w-xs mx-auto">
              Run a simulation to generate hypothesis distribution comparisons and outcome metrics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

