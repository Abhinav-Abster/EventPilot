"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  Sparkles,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { executeReplanning } from "../../lib/ai/aiService";
import { ReplanningProposal } from "../../lib/types/event";
import { formatINR } from "../../lib/budget/moneyUtils";

interface AssistantMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  proposal?: ReplanningProposal;
  timestamp: string;
}

export function AIAssistantView() {
  const { plan, setActiveProposal, applyProposal, rejectProposal } = usePlan();

  const [inputQuery, setInputQuery] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "init",
      sender: "assistant",
      text: "I am ready to assist with real-time adaptive replanning. Try typing an adjustment such as 'My budget is now ₹30,000', 'We have 20 additional guests', or 'Move the party indoors'. I will calculate trade-offs and show an exact comparison.",
      timestamp: "Ready",
    },
  ]);

  const quickScenarios = [
    {
      title: "Budget Reduction to ₹30,000",
      query: "My budget is now ₹30,000.",
    },
    {
      title: "20 Additional Guests (+20 Pax)",
      query: "We have 20 additional guests.",
    },
    {
      title: "Relocate Indoors (Rain Protocol)",
      query: "Move the party indoors due to rain forecast.",
    },
    {
      title: "Caterer Cancellation Contingency",
      query: "The caterer cancelled at the last minute.",
    },
    {
      title: "Protect Decor, Cut Entertainment",
      query: "Keep the decorations but reduce other expenses.",
    },
    {
      title: "Reschedule by 7 Days",
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

    try {
      const result = await executeReplanning(q, plan);

      if (result.proposals.length > 0) {
        const primaryProposal = result.proposals[0];
        const assistantMsg: AssistantMessage = {
          id: "a-" + Date.now(),
          sender: "assistant",
          text: `I have analyzed your change request: "${result.explanation}". Here is the generated adaptive replanning proposal with deterministic impact calculations.`,
          proposal: primaryProposal,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        setActiveProposal(primaryProposal);
      } else {
        const assistantMsg: AssistantMessage = {
          id: "a-" + Date.now(),
          sender: "assistant",
          text: "I analyzed the request, but no material changes or conflicts were identified with current constraints.",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };
        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (e) {
      console.error("Replanning failed:", e);
    } finally {
      setIsEvaluating(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-forest-900">
          Adaptive Replanning & AI Assistant
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          EventPilot&apos;s core differentiator: change any real-world constraint and verify the downstream trade-offs before accepting.
        </p>
      </div>

      {/* Quick Test Chips */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          Simulate Adaptive Scenarios:
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {quickScenarios.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => handleSendQuery(sc.query)}
              className="text-left p-2.5 bg-white border border-sand-200 hover:border-forest-800 rounded-xl transition text-xs shadow-2xs group"
            >
              <span className="font-bold text-forest-900 block group-hover:text-forest-800 line-clamp-1">
                {sc.title}
              </span>
              <span className="text-[10px] text-stone-500 block truncate mt-0.5">
                {`"${sc.query}"`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Conversation Stream */}
      <div className="bg-white rounded-3xl border border-sand-200 shadow-sm flex flex-col min-h-[550px] overflow-hidden">
        {/* Stream Messages */}
        <div className="flex-1 p-6 space-y-6 overflow-y-auto">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3.5 ${
                  isUser ? "flex-row-reverse" : "flex-row"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                    isUser
                      ? "bg-sand-200 text-stone-800"
                      : "bg-forest-900 text-gold-400"
                  }`}
                >
                  {isUser ? <MessageSquare className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                <div className="space-y-3 max-w-2xl flex-1">
                  <div
                    className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-forest-900 text-white rounded-tr-xs ml-auto"
                        : "bg-sand-50 border border-sand-200 text-stone-800 rounded-tl-xs"
                    }`}
                  >
                    {msg.text}
                    <div
                      className={`text-[10px] mt-1 ${
                        isUser ? "text-sand-300 text-right" : "text-stone-400"
                      }`}
                    >
                      {msg.timestamp}
                    </div>
                  </div>

                  {/* Embedded Replanning Proposal Card */}
                  {msg.proposal && (
                    <div className="bg-white border-2 border-forest-800 rounded-2xl p-5 shadow-md space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-sand-200">
                        <div>
                          <span className="text-[10px] font-semibold uppercase bg-gold-100 text-gold-900 px-2 py-0.5 rounded">
                            Proposed Adaptation
                          </span>
                          <h4 className="text-sm font-bold text-forest-900 mt-1">
                            {msg.proposal.title}
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                          {msg.proposal.impact.feasibilityScore}% Feasible
                        </span>
                      </div>

                      <p className="text-xs text-stone-600 leading-normal">
                        {msg.proposal.summary}
                      </p>

                      {/* Preserved Requirements */}
                      {msg.proposal.impact.preservedConstraints.length > 0 && (
                        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                          <span className="text-[11px] font-bold text-emerald-900 flex items-center gap-1 mb-1.5">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                            Preserved Non-Negotiables:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.proposal.impact.preservedConstraints.map((c, i) => (
                              <span
                                key={i}
                                className="text-[10px] font-medium bg-white text-emerald-800 px-2 py-0.5 rounded border border-emerald-300"
                              >
                                ✓ {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Diffs Preview */}
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-bold text-stone-700 block uppercase">
                          Material Modifications:
                        </span>
                        <div className="divide-y divide-sand-100 border border-sand-200 rounded-xl overflow-hidden text-xs">
                          {msg.proposal.diffs.slice(0, 3).map((diff, i) => (
                            <div key={i} className="p-2.5 bg-sand-50/50">
                              <span className="font-semibold text-stone-800 block">
                                {diff.label}
                              </span>
                              <div className="flex items-center gap-2 font-mono text-[11px] mt-0.5">
                                <span className="line-through text-rose-700">
                                  {diff.before}
                                </span>
                                <ArrowRight className="w-3 h-3 text-stone-400" />
                                <span className="text-emerald-700 font-bold">
                                  {diff.after}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-sand-200">
                        <button
                          onClick={() => setActiveProposal(msg.proposal!)}
                          className="px-3 py-1.5 text-xs font-semibold text-forest-800 hover:bg-sand-100 rounded-lg transition"
                        >
                          View Full Diff & Warnings
                        </button>
                        <button
                          onClick={() => applyProposal(msg.proposal!)}
                          className="px-4 py-2 text-xs font-bold bg-forest-900 hover:bg-forest-850 text-white rounded-lg shadow-sm transition"
                        >
                          Accept & Apply Proposal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {isEvaluating && (
            <div className="flex items-center gap-2 text-stone-400 text-xs italic pl-11">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing constraint shifts and generating proposals...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-sand-50 border-t border-sand-200">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendQuery();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Describe your constraint adjustment (e.g. 'My budget is now ₹30,000' or 'Move the party indoors')..."
              className="flex-1 px-4 py-3 bg-white border border-sand-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-forest-900 text-stone-900 shadow-2xs"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isEvaluating}
              className="px-5 py-3 bg-forest-900 hover:bg-forest-850 disabled:bg-stone-300 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>Evaluate</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
