"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { Sparkles, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useStore } from "@/lib/store";
import type { CalculationResult } from "@/types";

const ReactMarkdown = dynamic(() => import("react-markdown"), { ssr: false });

interface AIOptimizerProps {
  results: CalculationResult[];
  context?: string;
}

export function AIOptimizer({ results, context }: AIOptimizerProps) {
  const {
    activeCalculator,
    aiAnalyses,
    setAiAnalysis,
    analyzingTabs,
    setAnalyzingTab,
  } = useStore();
  const [expanded, setExpanded] = useState(false);

  const analysis = aiAnalyses[activeCalculator];
  const isAnalyzing = analyzingTabs[activeCalculator] ?? false;

  async function handleOptimize() {
    if (!results.length) return;
    setAnalyzingTab(activeCalculator, true);
    setExpanded(true);

    const summary = results
      .map(
        (r) =>
          `${r.label}: ${r.value} ${r.unit}${r.description ? ` (${r.description})` : ""}`,
      )
      .join("\n");

    try {
      const res = await fetch("/api/ai/optimize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calculatorId: activeCalculator,
          results: summary,
          context,
        }),
      });

      if (!res.ok) throw new Error("API error");
      const data = (await res.json()) as { content: string };
      setAiAnalysis(activeCalculator, data.content);
    } catch (err) {
      setAiAnalysis(
        activeCalculator,
        "Unable to get AI analysis right now. Please try again.",
      );
    } finally {
      setAnalyzingTab(activeCalculator, false);
    }
  }

  return (
    <div className="bg-[--color-surface] rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
      {/* Trigger row */}
      <div className="px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[--color-ink]">
              AI Material Optimizer
            </p>
            <p className="text-[11px] text-[--color-ink-dim]">
              Cost savings &amp; best practices
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {analysis && (
            <button
              onClick={() => setExpanded((e) => !e)}
              className="text-[--color-ink-dim] hover:text-[--color-ink] p-1 transition-colors"
              aria-label={expanded ? "Collapse analysis" : "Expand analysis"}
            >
              {expanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>
          )}
          <button
            onClick={handleOptimize}
            disabled={isAnalyzing || !results.length}
            className="flex items-center gap-1.5 bg-gradient-to-r from-violet-500 to-purple-600
              hover:from-violet-600 hover:to-purple-700
              text-white text-xs font-bold px-3 py-2 rounded-lg transition-all
              disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Analyzing…
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" /> Optimize
              </>
            )}
          </button>
        </div>
      </div>

      {/* Analysis content */}
      {expanded && analysis && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div
            className="mt-4 prose prose-sm max-w-none text-[--color-ink]
            prose-headings:text-[--color-ink] prose-headings:font-display prose-headings:font-bold
            prose-strong:text-[--color-ink] prose-li:text-[--color-ink-mid]
            prose-a:text-[--color-orange-brand]"
          >
            <ReactMarkdown>{analysis.content}</ReactMarkdown>
          </div>
          <p className="text-[10px] text-[--color-ink-dim] mt-3">
            AI suggestions are estimates. Always verify with local codes and a
            licensed contractor.
          </p>
        </div>
      )}

      {/* Loading skeleton */}
      {isAnalyzing && expanded && !analysis && (
        <div className="px-5 pb-5 border-t border-gray-100">
          <div className="mt-4 space-y-2 animate-pulse">
            {[80, 100, 60, 90, 70].map((w, i) => (
              <div
                key={i}
                className="h-3 bg-gray-100 rounded"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
