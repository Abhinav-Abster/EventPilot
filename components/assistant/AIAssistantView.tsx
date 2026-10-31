"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  Check,
  ArrowRight,
  RefreshCw,
  MessageSquare,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { requestReplanning } from "../../lib/ai/client";
import { ReplanningProposal } from "../../lib/types/event";

interface AssistantMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  proposal?: ReplanningProposal;
  timestamp: string;
}

export function AIAssistantView() {
  const { plan, setActiveProposal, applyProposal, lastAppliedProposalId } = usePlan();

  const [inputQuery, setInputQuery] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "init",
      sender: "assistant",
      text: "The adaptive replanning engine is active. State any real-world disruption or constraint delta (e.g., 'Budget reduced to ₹30,000', '20 more guests expected', or 'Shift party indoors'). Downstream impacts, non-negotiables, and side-by-side diffs will be computed deterministically.",
      timestamp: "READY",
    },
  ]);

  const quickScenarios = [
    {
      title: "BUDGET CAP: ₹30,000",
      query: "My budget is now ₹30,000.",
    },
    {
      title: "GUEST CENSUS: +20 PAX",
      query: "We have 20 additional guests.",
    },
    {
      title: "INDOOR RELOCATION",
      query: "Move the party indoors due to rain forecast.",
    },
    {
      title: "CATERER CANCELLATION",
      query: "The caterer cancelled at the last minute.",
    },
    {
      title: "PRESERVE DECOR MANDATE",
      query: "Keep the decorations but reduce other expenses.",
    },
    {
      title: "POSTPONE BY 7 DAYS",
      query: "The event is now next Saturday.",
    },
  ];

  const handleSendQuery = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || isEvaluating) return;

    const userMsg: AssistantMessage = {
      id: "u-" + Date.now(),
      sender: "user",
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery("");
    setIsEvaluating(true);
    setError(null);

    try {
      const result = await requestReplanning(q, plan);

      if (result.proposals.length > 0) {
        const primaryProposal = result.proposals[0];
        const assistantMsg: AssistantMessage = {
          id: "a-" + Date.now(),
          sender: "assistant",
          text: `Analysis complete: "${result.explanation}". Generated deterministic replanning proposal with verified constraint adjustments.`,
          proposal: primaryProposal,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setActiveProposal(primaryProposal);
      } else {
        const assistantMsg: AssistantMessage = {
          id: "a-" + Date.now(),
          sender: "assistant",
          text: "The requested adjustment introduced no binding constraint conflicts with current allocations.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to analyze the requested change.");
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Bauhaus Constructivist Header */}
      <div className="space-y-4 border-b-4 border-black pb-8">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-black">
          <span className="w-3.5 h-3.5 rounded-full bg-[#D02020] border-2 border-black inline-block" />
          <span className="w-3.5 h-3.5 bg-[#1040C0] border-2 border-black inline-block" />
          <span className="w-3.5 h-3.5 bg-[#F0C020] border-2 border-black inline-block shape-triangle" />
          <span className="font-bold">SYSTEM MODULE 06 // ADAPTIVE REPLANNING ENGINE</span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tighter uppercase text-black leading-none">
          REPLANNING TERMINAL
        </h1>
        <p className="font-sans font-medium text-base text-black max-w-3xl leading-relaxed">
          Evaluate what-if scenarios in real-time. Trade-offs and resource adjustments are tested against non-negotiable architectural constraints before any plan modifications are committed.
        </p>
      </div>

      {error && (
        <div role="alert" className="border-4 border-black bg-[#D02020] text-white p-4 text-xs font-mono font-bold shadow-[4px_4px_0px_0px_black] uppercase tracking-wider">
          SYSTEM ERROR NOTICE: {error}
        </div>
      )}

      {/* Quick Scenario Chips */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 bg-black inline-block" />
          <span className="font-mono text-xs uppercase tracking-widest font-bold text-black">
            DISRUPTION SCENARIO PRESETS:
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickScenarios.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(sc.query)}
              className="text-left p-3.5 border-2 border-black bg-white shadow-[4px_4px_0px_0px_black] hover:bg-[#F0C020] hover:text-black btn-bauhaus font-mono text-xs group transition-colors duration-200"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold uppercase tracking-wider text-[11px] block truncate">
                  {sc.title}
                </span>
                <span className={`w-2 h-2 border border-black ${idx % 3 === 0 ? 'bg-[#D02020] rounded-full' : idx % 3 === 1 ? 'bg-[#1040C0]' : 'bg-[#F0C020] shape-triangle'}`} />
              </div>
              <span className="font-sans text-[11px] text-gray-700 group-hover:text-black block truncate">
                &ldquo;{sc.query}&rdquo;
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversation Stream Window */}
      <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_black] flex flex-col min-h-[640px] overflow-hidden">
        {/* Stream Header Panel */}
        <div className="px-6 py-4 bg-[#1040C0] border-b-4 border-black text-white flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-widest">
            <Bot size={18} strokeWidth={2.5} />
            <span>DIRECTIVE ADAPTATION FEED</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#F0C020] border-2 border-black inline-block" />
            <span className="font-mono text-[10px] uppercase font-bold tracking-widest">ENGINE OPERATIONAL</span>
          </div>
        </div>

        {/* Stream Messages */}
        <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto bg-[#F0F0F0]">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-4 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-9 h-9 flex items-center justify-center shrink-0 border-2 border-black font-mono text-xs shadow-[3px_3px_0px_0px_black] ${
                    isUser ? "bg-[#D02020] text-white rounded-full" : "bg-[#121212] text-white"
                  }`}
                >
                  {isUser ? <MessageSquare size={16} strokeWidth={2} /> : <Bot size={16} strokeWidth={2} />}
                </div>

                <div className="space-y-4 max-w-2xl flex-1">
                  <div
                    className={`p-5 border-2 border-black shadow-[4px_4px_0px_0px_black] text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-[#121212] text-white ml-auto"
                        : "bg-white text-black font-sans"
                    }`}
                  >
                    <p className="font-sans font-medium leading-relaxed">{msg.text}</p>
                    <div
                      className={`text-[10px] font-mono mt-3 uppercase tracking-widest font-bold ${
                        isUser ? "text-gray-300 text-right" : "text-gray-600"
                      }`}
                    >
                      TIMESTAMP // {msg.timestamp}
                    </div>
                  </div>

                  {/* Embedded Replanning Proposal Card */}
                  {msg.proposal && (
                    <div className="border-4 border-black bg-white p-6 space-y-5 shadow-[6px_6px_0px_0px_black]">
                      <div className="flex items-center justify-between pb-3 border-b-2 border-black">
                        <div>
                          <span className="font-mono text-[10px] uppercase tracking-widest bg-[#F0C020] text-black border border-black px-2 py-0.5 font-bold">
                            CALCULATED PROPOSAL
                          </span>
                          <h2 className="font-display font-black text-xl text-black mt-2 uppercase tracking-tight">
                            {msg.proposal.title}
                          </h2>
                        </div>
                        <span className="font-mono text-xs uppercase tracking-widest bg-black text-white px-3 py-1 font-bold">
                          {msg.proposal.impact.feasibilityScore}% FEASIBLE
                        </span>
                      </div>

                      <p className="font-sans font-medium text-xs sm:text-sm text-black leading-relaxed">
                        {msg.proposal.summary}
                      </p>

                      {/* Preserved Requirements */}
                      {msg.proposal.impact.preservedConstraints.length > 0 && (
                        <div className="p-4 border-2 border-black bg-[#F0C020]/20 space-y-2 font-mono text-xs">
                          <span className="text-[11px] font-bold text-black flex items-center gap-1.5 uppercase tracking-wider">
                            <ShieldCheck size={16} strokeWidth={2.5} className="text-[#1040C0]" />
                            PRESERVED NON-NEGOTIABLES:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {msg.proposal.impact.preservedConstraints.map((c, i) => (
                              <span
                                key={i}
                                className="text-[10px] border-2 border-black bg-white px-2.5 py-1 text-black uppercase font-bold shadow-[2px_2px_0px_0px_black]"
                              >
                                [✓] {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Diffs Preview */}
                      <div className="space-y-2">
                        <span className="font-mono text-[11px] uppercase tracking-wider font-bold text-black block">
                          MATERIAL MODIFICATIONS:
                        </span>
                        <div className="divide-y-2 divide-black border-2 border-black text-xs font-mono">
                          {msg.proposal.diffs.slice(0, 3).map((diff, i) => (
                            <div key={i} className="p-3 bg-white">
                              <span className="font-bold text-black uppercase block">
                                {diff.label}
                              </span>
                              <div className="flex items-center gap-3 text-xs mt-1">
                                <span className="line-through text-gray-500 font-bold">
                                  {diff.before}
                                </span>
                                <ArrowRight size={14} strokeWidth={2} />
                                <span className="font-bold text-[#1040C0]">
                                  {diff.after}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-3 pt-4 border-t-2 border-black font-mono">
                        {lastAppliedProposalId === msg.proposal.id ? (
                          <span className="inline-flex items-center gap-2 px-5 py-2.5 text-xs uppercase tracking-widest font-black bg-[#121212] text-white border-2 border-black shadow-[4px_4px_0px_0px_black]">
                            <Check size={16} strokeWidth={3} className="text-[#F0C020]" /> APPLIED TO ACTIVE PLAN
                          </span>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => setActiveProposal(msg.proposal!)}
                              className="px-4 py-2.5 text-xs uppercase tracking-wider font-bold border-2 border-black bg-white text-black shadow-[4px_4px_0px_0px_black] btn-bauhaus hover:bg-gray-100"
                            >
                              VIEW COMPARISON
                            </button>
                            <button
                              type="button"
                              onClick={() => applyProposal(msg.proposal!)}
                              className="px-6 py-2.5 text-xs uppercase tracking-widest font-black bg-[#D02020] text-white border-2 border-black shadow-[4px_4px_0px_0px_black] btn-bauhaus hover:bg-[#D02020]/90"
                            >
                              ACCEPT & APPLY
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isEvaluating && (
            <div className="flex items-center gap-3 text-black font-mono text-xs pl-12 uppercase tracking-widest font-bold">
              <RefreshCw size={16} className="animate-spin text-[#1040C0]" />
              <span>CALCULATING TRADE-OFFS & CONSTRAINTS...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t-4 border-black bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-3"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Hypothetical disruption (e.g. 'Budget is now ₹30,000' or 'Move party indoors')..."
              className="flex-1 px-4 py-3 bg-white border-2 border-black text-xs sm:text-sm font-sans font-medium focus:outline-none focus:ring-2 focus:ring-[#1040C0]"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isEvaluating}
              className="px-6 py-3 bg-[#1040C0] text-white border-2 border-black shadow-[4px_4px_0px_0px_black] btn-bauhaus font-mono text-xs uppercase tracking-widest font-bold disabled:opacity-40 flex items-center gap-2 shrink-0 hover:bg-[#1040C0]/90"
            >
              <Sparkles size={16} strokeWidth={2} />
              <span>SOLVE</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
