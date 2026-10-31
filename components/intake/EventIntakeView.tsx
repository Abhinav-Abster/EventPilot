"use client";

import React, { useState, useEffect, useRef } from "react";
import { Layers } from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { requestIntake, requestPlan } from "../../lib/ai/client";
import { EventProfile } from "../../lib/types/event";
import { NavTab } from "../layout/Navbar";
import { IntakeStarterPresets } from "./parts/IntakeStarterPresets";
import { IntakeChatBox, ChatMessage } from "./parts/IntakeChatBox";
import { IntakeProfileForm } from "./parts/IntakeProfileForm";

interface EventIntakeViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenEventManager?: () => void;
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: "m-1",
    sender: "assistant",
    text: "Welcome to EventPilot Bauhaus Atelier. State your event parameters in natural prose: guest census, budget limit in ₹, venue city, geometric aesthetic, and dietary mandates. Every variable will be verified deterministically against our Zod schema constraints.",
    timestamp: "00:00",
  },
];

export function EventIntakeView({ onNavigate, onOpenEventManager }: EventIntakeViewProps) {
  const { plan, setFullPlan } = usePlan();

  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [saveAsNewEvent, setSaveAsNewEvent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [stagedProfile, setStagedProfile] = useState<Partial<EventProfile>>({ ...plan.profile });

  const intakeAbortRef = useRef<AbortController | null>(null);
  const planAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      intakeAbortRef.current?.abort();
      planAbortRef.current?.abort();
    };
  }, []);

  useEffect(() => {
    setStagedProfile({ ...plan.profile });
  }, [plan.profile]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isProcessing) return;

    intakeAbortRef.current?.abort();
    const controller = new AbortController();
    intakeAbortRef.current = controller;

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsProcessing(true);
    setError(null);

    try {
      const result = await requestIntake(text, stagedProfile, controller.signal);

      const assistantMsg: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        sender: "assistant",
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStagedProfile((prev) => ({ ...prev, ...result.extractedProfile }));
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(e instanceof Error ? e.message : "Unable to process the event details.");
    } finally {
      if (!controller.signal.aborted) {
        setIsProcessing(false);
      }
    }
  };

  const handleGeneratePlan = async () => {
    planAbortRef.current?.abort();
    const controller = new AbortController();
    planAbortRef.current = controller;

    setIsGeneratingPlan(true);
    setError(null);
    try {
      const result = await requestPlan(stagedProfile, controller.signal);
      setFullPlan(result.plan, saveAsNewEvent);
      onNavigate("dashboard");
    } catch (e) {
      if (controller.signal.aborted) return;
      setError(e instanceof Error ? e.message : "Unable to generate the event plan.");
    } finally {
      if (!controller.signal.aborted) {
        setIsGeneratingPlan(false);
      }
    }
  };

  return (
    <div className="space-y-12 pb-12">
      {/* Editorial Bauhaus Header */}
      <div className="bg-white border-4 border-black p-6 sm:p-10 shadow-[8px_8px_0px_0px_black] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 font-mono text-xs uppercase tracking-widest font-black">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#D02020] border-2 border-black inline-block" />
            <span>MODULE 01 / CONVERSATIONAL INTAKE & SPECIFICATION</span>
          </div>
          {onOpenEventManager && (
            <button
              onClick={onOpenEventManager}
              className="btn-bauhaus flex items-center gap-2 px-3 py-1.5 border-2 border-black bg-[#F0C020] text-black font-black text-xs uppercase tracking-wider shadow-[3px_3px_0px_0px_black]"
            >
              <Layers size={14} strokeWidth={2.5} />
              <span>ACTIVE: {plan.profile.name}</span>
            </button>
          )}
        </div>

        <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tighter uppercase text-black">
          CONSTRUCTIVIST INTAKE
        </h1>

        <p className="font-medium text-base text-[#121212] max-w-3xl leading-relaxed">
          State your requirements in free prose. EventPilot converts your requirements into structured Zod schemas, identifying bound trade-offs and verifying safety constraints.
        </p>
      </div>

      {error && (
        <div role="alert" className="border-4 border-black bg-[#D02020] text-white p-5 font-mono text-xs font-black shadow-[6px_6px_0px_0px_black]">
          SYSTEM AUDIT EXCEPTION: {error}
        </div>
      )}

      <IntakeStarterPresets onSelectPrompt={handleSendMessage} />

      <div className="w-full border-t-4 border-black" />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <IntakeChatBox
          messages={messages}
          inputMessage={inputMessage}
          setInputMessage={setInputMessage}
          isProcessing={isProcessing}
          onSendMessage={() => handleSendMessage()}
        />

        <IntakeProfileForm
          stagedProfile={stagedProfile}
          onUpdateProfile={setStagedProfile}
          saveAsNewEvent={saveAsNewEvent}
          setSaveAsNewEvent={setSaveAsNewEvent}
          isGeneratingPlan={isGeneratingPlan}
          onGeneratePlan={handleGeneratePlan}
        />
      </div>
    </div>
  );
}
