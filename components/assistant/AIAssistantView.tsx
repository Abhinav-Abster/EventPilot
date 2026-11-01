"use client";

import React, { useState, useRef, useEffect } from "react";
import { Bot, RefreshCw, MessageSquare } from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { requestReplanning } from "../../lib/ai/client";
import { ReplanningProposal } from "../../lib/types/event";
import { AssistantScenarioPresets } from "./parts/AssistantScenarioPresets";
import { AssistantProposalCard } from "./parts/AssistantProposalCard";
import { AssistantInputBar } from "./parts/AssistantInputBar";

interface AssistantMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  proposal?: ReplanningProposal;
  timestamp: string;
}

/**
 * Main AI Assistant container providing conversational intake, intent replanning, and scenario presets.
 */
export function AIAssistantView() {
  const { plan, setActiveProposal, applyProposal, lastAppliedProposalId } = usePlan();

  const [inputQuery, setInputQuery] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: "init",
      sender: "assistant",
      text: "The adaptive replanning engine is active. State any real-world disruption or constraint delta (e.g., 'Budget reduced to ₹30,000', '20 more guests expected', or 'Shift party indoors'). Downstream impacts, non-negotiables, and side-by-side diffs will be computed deterministically.",
      timestamp: "READY",
    },
  ]);

  const handleSendQuery = async (queryToSend?: string) => {
    const q = queryToSend || inputQuery;
    if (!q.trim() || isEvaluating) return;

    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

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
      const result = await requestReplanning(q, plan, controller.signal);

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
      if (controller.signal.aborted) return;
      setError(e instanceof Error ? e.message : "Unable to analyze the requested change.");
    } finally {
      if (!controller.signal.aborted) {
        setIsEvaluating(false);
      }
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Bauhaus Constructivist Header */}
      <div className="space-y-4 border-b-4 border-black pb-8">
        <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-widest text-black">
          <span className="w-3.5 h-3.5 rounded-full bg-bauhausRed border-2 border-black inline-block" />
          <span className="w-3.5 h-3.5 bg-bauhausBlue border-2 border-black inline-block" />
          <span className="w-3.5 h-3.5 bg-bauhausYellow border-2 border-black inline-block shape-triangle" />
          <span className="font-bold">SYSTEM MODULE 06 // ADAPTIVE REPLANNING ENGINE</span>
        </div>
        <h1 className="font-display font-black text-4xl sm:text-6xl lg:text-7xl tracking-tighter uppercase text-black leading-none">
          REPLANNING TERMINAL
        </h1>
        <p className="font-sans font-medium text-base text-black max-w-3xl leading-relaxed">
          Evaluate what-if scenarios in real-time. Trade-offs and resource adjustments are tested
          against non-negotiable architectural constraints before any plan modifications are
          committed.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="border-4 border-black bg-bauhausRed text-white p-4 text-xs font-mono font-bold shadow-hard-4 uppercase tracking-wider"
        >
          SYSTEM ERROR NOTICE: {error}
        </div>
      )}

      <AssistantScenarioPresets onSelectScenario={handleSendQuery} />

      {/* Main Conversation Stream Window */}
      <div className="border-4 border-black bg-white shadow-hard-8 flex flex-col min-h-[640px] overflow-hidden">
        {/* Stream Header Panel */}
        <div className="px-6 py-4 bg-bauhausBlue border-b-4 border-black text-white flex items-center justify-between">
          <div className="flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-widest">
            <Bot size={18} strokeWidth={2.5} />
            <span>DIRECTIVE ADAPTATION FEED</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-bauhausYellow border-2 border-black inline-block" />
            <span className="font-mono text-micro uppercase font-bold tracking-widest">
              ENGINE OPERATIONAL
            </span>
          </div>
        </div>

        {/* Stream Messages */}
        <div className="flex-1 p-6 sm:p-8 space-y-6 overflow-y-auto bg-bauhausCanvas">
          {messages.map((msg) => {
            const isUser = msg.sender === "user";
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`w-9 h-9 flex items-center justify-center shrink-0 border-2 border-black font-mono text-xs shadow-hard-3 ${
                    isUser ? "bg-bauhausRed text-white rounded-full" : "bg-bauhausBlack text-white"
                  }`}
                >
                  {isUser ? (
                    <MessageSquare size={16} strokeWidth={2} />
                  ) : (
                    <Bot size={16} strokeWidth={2} />
                  )}
                </div>

                <div className="space-y-4 max-w-2xl flex-1">
                  <div
                    className={`p-5 border-2 border-black shadow-hard-4 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-bauhausBlack text-white ml-auto"
                        : "bg-white text-black font-sans"
                    }`}
                  >
                    <p className="font-sans font-medium leading-relaxed">{msg.text}</p>
                    <div
                      className={`text-micro font-mono mt-3 uppercase tracking-widest font-bold ${
                        isUser ? "text-gray-300 text-right" : "text-gray-600"
                      }`}
                    >
                      TIMESTAMP // {msg.timestamp}
                    </div>
                  </div>

                  {msg.proposal && (
                    <AssistantProposalCard
                      proposal={msg.proposal}
                      isApplied={lastAppliedProposalId === msg.proposal.id}
                      onViewComparison={() => setActiveProposal(msg.proposal!)}
                      onApply={() => applyProposal(msg.proposal!)}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {isEvaluating && (
            <div className="flex items-center gap-3 text-black font-mono text-xs pl-12 uppercase tracking-widest font-bold">
              <RefreshCw size={16} className="animate-spin text-bauhausBlue" />
              <span>CALCULATING TRADE-OFFS & CONSTRAINTS...</span>
            </div>
          )}
        </div>

        <AssistantInputBar
          inputQuery={inputQuery}
          onInputChange={setInputQuery}
          onSubmit={(e) => {
            e.preventDefault();
            handleSendQuery();
          }}
          isEvaluating={isEvaluating}
        />
      </div>
    </div>
  );
}
