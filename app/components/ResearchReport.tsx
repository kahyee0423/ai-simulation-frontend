"use client";

import React, { useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { FileText, Download } from "lucide-react";
import { AgentStep, SimulationResult } from "../utils/type";
import { Translations, TRANSLATIONS } from "../utils/i18n";
import SimulationSpec from "./SimulationSpec";
import StatsSummary from "./StatsSummary";
import HypothesisPanel from "./HypothesisPanel";

interface ResearchReportProps {
  currentStep: AgentStep;
  result: SimulationResult | null;
  loading: boolean;
  t?: Translations;
}

export default function ResearchReport({ currentStep, result, loading, t = TRANSLATIONS.English }: ResearchReportProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const hasSpec = Boolean(result?.simulation_spec);
  const hasHypothesis = Boolean(result?.hypothesis_analysis);
  const hasStats = Boolean(result?.statistical_summary);
  const hasReport = Boolean(result?.report);
  const isCompleted = currentStep === "completed";
  const cleanedReport = result?.report
    ? result.report.replace(/^(#{1,3})\s+\d+[\.\)]\s*/gm, "$1 ")
    : "";

  const handleExportPDF = () => {
    const printContent = reportRef.current;
    if (!printContent) return;

    const WindowPrt = window.open("", "", "left=0,top=0,width=900,height=900,toolbar=0,scrollbars=0,status=0");
    if (!WindowPrt) return;

    WindowPrt.document.write(`
      <html>
        <head>
          <title>AI Simulation Research Report</title>
          <style>
            @page {
              margin: 40mm 40mm 20mm 20mm; /* Added top page margin to prevent content hugging the top edge */
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #1e293b;
              line-height: 1.7;
              padding: 0 20px 20px 20px;
              max-width: 800px;
              margin: 0 auto;
            }
            h1 {
              font-size: 26px;
              color: #0f172a;
              border-bottom: 2px solid #cbd5e1;
              padding-bottom: 12px;
              margin-top: 10px;
              margin-bottom: 24px;
            }
            /* Section titles with top breathing room so they never stick to the page top */
            h2 {
              font-size: 16px;
              font-weight: 700;
              color: #0f172a;
              margin-top: 40px;
              margin-bottom: 16px;
              padding-top: 16px;
              padding-bottom: 6px;
              border-bottom: 1.5px solid #cbd5e1;
              break-after: avoid;
              page-break-after: avoid;
            }
            h3 {
              font-size: 14px;
              color: #334155;
              margin-top: 24px;
              margin-bottom: 8px;
              break-after: avoid;
              page-break-after: avoid;
            }
            p, li {
              font-size: 13px;
              color: #334155;
              margin-bottom: 12px;
              orphans: 3;
              widows: 3;
            }
            ul, ol {
              margin-top: 4px;
              margin-bottom: 12px;
              padding-left: 20px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin: 24px 0;
              font-size: 12px;
              break-inside: avoid;
              page-break-inside: avoid;
            }
            th, td {
              border: 1px solid #cbd5e1;
              padding: 10px 14px;
              text-align: left;
            }
            th {
              background-color: #f1f5f9;
              color: #0f172a;
              font-weight: 600;
            }
            tr:nth-child(even) {
              background-color: #f8fafc;
            }
            blockquote {
              border-left: 4px solid #6366f1;
              margin: 16px 0;
              padding: 8px 16px;
              background-color: #f8fafc;
              color: #475569;
              break-inside: avoid;
              page-break-inside: avoid;
            }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    WindowPrt.document.close();
    WindowPrt.focus();
    setTimeout(() => {
      WindowPrt.print();
      WindowPrt.close();
    }, 500);
  };

  return (
    <div className="lg:col-span-6 bg-slate-900/80 backdrop-blur-xl border border-slate-800/80 rounded-2xl flex flex-col h-full overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-4 py-3 shrink-0">
        <h3 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-400" /> {t.researchReport}
        </h3>
        
        <div className="flex items-center gap-2">
          {isCompleted && hasReport && (
            <button
              onClick={handleExportPDF}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-medium transition-all shadow-sm"
              title={t.exportPdf}
            >
              <Download className="w-3.5 h-3.5" /> {t.exportPdf}
            </button>
          )}

          {isCompleted && hasReport ? (
            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
              {t.ready}
            </span>
          ) : (
            <span className="text-[11px] px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 font-medium">
              {loading ? t.runningPipeline : t.pendingAnalysis}
            </span>
          )}
        </div>
      </div>

      {/* Body — scrollable */}
      <div className="p-4 flex-1 overflow-y-auto min-h-0 flex flex-col gap-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">

        {/* Simulation Spec — hidden automatically when hasStats is true */}
        <SimulationSpec result={result} loading={loading} hasStats={hasStats} t={t} />

        {/* {(hasHypothesis || (loading && hasSpec)) && (
          <HypothesisPanel result={result} loading={loading} t={t} />
        )} */}

        {/* Stats Summary */}
        {(hasStats || (loading && hasSpec)) && (
          <StatsSummary result={result} loading={loading} t={t} />
        )}

        {/* LLM Research Report */}
        {isCompleted && hasReport ? (
          <div 
            ref={reportRef}
            className="prose prose-invert prose-slate max-w-none text-xs md:text-sm leading-relaxed bg-slate-950/40 p-6 rounded-xl border border-slate-800/50 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden
              [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-indigo-300 [&_h2]:mt-10 [&_h2]:mb-3 [&_h2]:border-l-2 [&_h2]:border-indigo-500 [&_h2]:pl-3 [&_h2]:bg-slate-900/40 [&_h2]:py-2 [&_h2]:rounded-r-md
              [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:text-slate-200 [&_h3]:mt-5 [&_h3]:mb-2
              [&_p]:mb-3.5 [&_ul]:mb-3.5 [&_ol]:mb-3.5 [&_li]:mb-1.5
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-6 [&_table]:text-xs
              [&_th]:border [&_th]:border-slate-700 [&_th]:bg-slate-800/80 [&_th]:p-2.5 [&_th]:text-slate-200 [&_th]:text-left
              [&_td]:border [&_td]:border-slate-800 [&_td]:p-2.5 [&_td]:text-slate-300
              [&_tr:nth-child(even)_td]:bg-slate-900/40"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{cleanedReport}</ReactMarkdown>
          </div>
        ) : !loading ? (
          <div className="text-center space-y-3 py-16 text-slate-500">
            <FileText className="w-10 h-10 mx-auto opacity-20 text-indigo-400 animate-pulse" />
            <p className="text-xs">{t.waitingForTrial}</p>
          </div>
        ) : !hasSpec ? (
          <div className="text-center space-y-3 py-16 text-slate-500">
            <FileText className="w-10 h-10 mx-auto opacity-20 text-indigo-400 animate-pulse" />
            <p className="text-xs">
              {t.parsingScenarioStatus}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}