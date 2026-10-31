"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  Calendar,
  Users,
  Wallet,
  MapPin,
  ArrowRight,
  RefreshCw,
  Layers,
  X,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { requestIntake, requestPlan } from "../../lib/ai/client";
import { EventProfile, DietaryPreference, VenueType } from "../../lib/types/event";
import { paiseToRupees, rupeesToPaise } from "../../lib/budget/moneyUtils";
import { DEFAULT_CITY } from "../../lib/config/constants";
import { NavTab } from "../layout/Navbar";

interface EventIntakeViewProps {
  onNavigate: (tab: NavTab) => void;
  onOpenEventManager?: () => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export function EventIntakeView({ onNavigate, onOpenEventManager }: EventIntakeViewProps) {
  const { plan, plans, setFullPlan } = usePlan();

  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const intakeAbortRef = useRef<AbortController | null>(null);
  const planAbortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      intakeAbortRef.current?.abort();
      planAbortRef.current?.abort();
    };
  }, []);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [saveAsNewEvent, setSaveAsNewEvent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "assistant",
      text: "Welcome to EventPilot Bauhaus Atelier. State your event parameters in natural prose: guest census, budget limit in ₹, venue city, geometric aesthetic, and dietary mandates. Every variable will be verified deterministically against our Zod schema constraints.",
      timestamp: "00:00",
    },
  ]);

  const [stagedProfile, setStagedProfile] = useState<Partial<EventProfile>>({
    ...plan.profile,
  });

  // Sync stagedProfile when active event switches
  useEffect(() => {
    setStagedProfile({ ...plan.profile });
  }, [plan.profile]);

  const starterPrompts = [
    {
      title: "PUNE BIRTHDAY SPECIFICATION",
      query:
        "I'm planning my sister's birthday in Pune for 60 people. My budget is ₹40,000. She loves anime, and I'd like an outdoor evening party with vegetarian food.",
      accent: "bg-[#D02020]",
    },
    {
      title: "ECO-MODERN MATRIMONIAL",
      query:
        "Planning an eco-friendly intimate wedding in Pune for 100 guests with a budget of ₹3,00,000. Vegetarian buffet and day-time outdoor lawn.",
      accent: "bg-[#1040C0]",
    },
    {
      title: "SOCIETY CULTURAL GALA",
      query:
        "Organizing a Diwali community cultural evening for 150 society members in Pune with ₹75,000 budget. Pure veg snacks, stage performances, and rangoli.",
      accent: "bg-[#F0C020]",
    },
  ];

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

      {/* Starter Prompts */}
      <div className="space-y-3">
        <span className="font-mono text-xs uppercase tracking-widest font-black text-black block">
          CURATED ARCHETYPES & PRESETS:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {starterPrompts.map((starter, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(starter.query)}
              className="card-bauhaus text-left p-6 bg-white border-4 border-black shadow-[6px_6px_0px_0px_black] hover:bg-[#FFF9C4] transition-all flex flex-col justify-between space-y-4 relative"
            >
              <span className={`w-3 h-3 ${starter.accent} border-2 border-black absolute top-4 right-4`} />
              <div className="border-b-2 border-black pb-2">
                <span className="font-display font-black text-sm uppercase tracking-tight text-black block">
                  {starter.title}
                </span>
                <span className="font-mono text-[10px] font-bold text-black/60 uppercase">
                  PRESET 0{idx + 1}
                </span>
              </div>
              <p className="font-medium text-xs leading-relaxed text-black/80">
                &ldquo;{starter.query}&rdquo;
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* 4px Heavy Divider */}
      <div className="w-full border-t-4 border-black" />

      {/* Main Grid: Interactive Dossier Chat vs Live Structured Ledger */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Chat Interface Column */}
        <div className="lg:col-span-7 border-4 border-black bg-white shadow-[8px_8px_0px_0px_black] flex flex-col h-[650px] overflow-hidden">
          {/* Bauhaus Blue Header */}
          <div className="px-6 py-4 border-b-4 border-black bg-[#1040C0] text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot size={20} strokeWidth={2.5} className="text-[#F0C020]" />
              <div>
                <h2 className="font-display font-black text-sm uppercase tracking-wider text-white">
                  INTAKE TERMINAL
                </h2>
                <span className="font-mono text-[10px] text-[#F0C020] uppercase font-bold tracking-wider block">
                  DETERMINISTIC CONVERSATIONAL AGENT
                </span>
              </div>
            </div>
            <span className="font-mono text-[10px] font-black uppercase bg-[#D02020] text-white border-2 border-black px-2.5 py-1 shadow-[2px_2px_0px_0px_black]">
              CONNECTED
            </span>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-[#F0F0F0]">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-8 h-8 flex items-center justify-center shrink-0 border-2 border-black font-mono text-xs shadow-[2px_2px_0px_0px_black] ${
                      isUser ? "bg-[#F0C020] text-black" : "bg-[#1040C0] text-white"
                    }`}
                  >
                    {isUser ? <User size={16} strokeWidth={2.5} /> : <Bot size={16} strokeWidth={2.5} />}
                  </div>
                  <div
                    className={`p-4 max-w-[85%] text-xs sm:text-sm leading-relaxed border-2 border-black shadow-[4px_4px_0px_0px_black] ${
                      isUser
                        ? "bg-[#D02020] text-white font-medium"
                        : "bg-white text-black font-medium"
                    }`}
                  >
                    <p className="leading-relaxed">{m.text}</p>
                    <div
                      className={`text-[10px] font-mono mt-2 uppercase font-black ${
                        isUser ? "text-white/80 text-right" : "text-black/60"
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
            {isProcessing && (
              <div className="flex items-center gap-2 text-black font-mono text-xs font-black pl-11 uppercase">
                <RefreshCw size={14} className="animate-spin" />
                <span>PARSING CONSTRAINTS...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t-4 border-black bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-3"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="State parameters (e.g. 60 guests in Pune, ₹40,000 budget, anime theme, vegetarian)..."
                className="flex-1 px-4 py-3 bg-[#F0F0F0] border-2 border-black text-xs sm:text-sm font-bold text-black focus:outline-none focus:bg-white shadow-[2px_2px_0px_0px_black]"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isProcessing}
                className="btn-bauhaus px-5 py-3 bg-[#D02020] hover:bg-[#D02020]/90 text-white border-2 border-black shadow-[3px_3px_0px_0px_black] disabled:opacity-40"
                aria-label="Send message"
              >
                <Send size={16} strokeWidth={2.5} />
              </button>
            </form>
          </div>
        </div>

        {/* Structured Profile Column (Live Dossier Ledger) */}
        <div className="lg:col-span-5 border-4 border-black bg-white shadow-[8px_8px_0px_0px_black] p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b-4 border-black bg-[#F0C020] -mx-6 -mt-6 sm:-mx-8 sm:-mt-8 p-6 text-black">
            <div>
              <h2 className="font-display font-black text-lg uppercase tracking-tight">
                STRUCTURED SPECIFICATION
              </h2>
              <p className="font-mono text-[11px] font-bold uppercase">
                VALIDATED SCHEMA PROFILES
              </p>
            </div>
            <span className="font-mono text-[10px] uppercase font-black bg-black text-white px-2.5 py-1 border border-black shadow-[2px_2px_0px_0px_black]">
              SYNCHRONIZED
            </span>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="block font-black uppercase tracking-wider mb-1 text-[11px] text-black">
                EVENT DESIGNATION / NAME
              </label>
              <input
                type="text"
                value={stagedProfile.name || ""}
                onChange={(e) =>
                  setStagedProfile({ ...stagedProfile, name: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-black uppercase tracking-wider mb-1 text-[11px] text-black flex items-center gap-1">
                  <Calendar size={13} strokeWidth={2.5} />
                  <span>DATE</span>
                </label>
                <input
                  type="date"
                  value={stagedProfile.date || ""}
                  onChange={(e) =>
                    setStagedProfile({ ...stagedProfile, date: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>
              <div>
                <label className="block font-black uppercase tracking-wider mb-1 text-[11px] text-black flex items-center gap-1">
                  <Users size={13} strokeWidth={2.5} />
                  <span>GUEST CENSUS</span>
                </label>
                <input
                  type="number"
                  min="1"
                  max="5000"
                  value={stagedProfile.guestCount || 60}
                  onChange={(e) =>
                    setStagedProfile({
                      ...stagedProfile,
                      guestCount: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-black uppercase tracking-wider mb-1 text-[11px] text-black flex items-center gap-1">
                  <Wallet size={13} strokeWidth={2.5} />
                  <span>BUDGET LIMIT (₹)</span>
                </label>
                <input
                  type="number"
                  step="500"
                  value={
                    stagedProfile.totalBudgetMinor
                      ? paiseToRupees(stagedProfile.totalBudgetMinor)
                      : 40000
                  }
                  onChange={(e) =>
                    setStagedProfile({
                      ...stagedProfile,
                      totalBudgetMinor: rupeesToPaise(parseFloat(e.target.value) || 0),
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-mono font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>
              <div>
                <label className="block font-black uppercase tracking-wider mb-1 text-[11px] text-black flex items-center gap-1">
                  <MapPin size={13} strokeWidth={2.5} />
                  <span>CITY LOCATION</span>
                </label>
                <input
                  type="text"
                  value={stagedProfile.location?.city || DEFAULT_CITY}
                  onChange={(e) =>
                    setStagedProfile({
                      ...stagedProfile,
                      location: {
                        ...(stagedProfile.location || { venueType: "outdoor" }),
                        city: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-black uppercase tracking-wider mb-1 text-[11px] text-black">
                  VENUE SETTING
                </label>
                <select
                  value={stagedProfile.location?.venueType || "outdoor"}
                  onChange={(e) =>
                    setStagedProfile({
                      ...stagedProfile,
                      location: {
                        ...(stagedProfile.location || { city: DEFAULT_CITY }),
                        venueType: e.target.value as VenueType,
                      },
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                >
                  <option value="outdoor">OUTDOOR LAWN</option>
                  <option value="indoor">INDOOR HALL</option>
                  <option value="hybrid">HYBRID</option>
                </select>
              </div>
              <div>
                <label className="block font-black uppercase tracking-wider mb-1 text-[11px] text-black">
                  DIETARY MANDATE
                </label>
                <select
                  value={stagedProfile.dietaryPreferences?.[0] || "vegetarian"}
                  onChange={(e) =>
                    setStagedProfile({
                      ...stagedProfile,
                      dietaryPreferences: [e.target.value as DietaryPreference],
                    })
                  }
                  className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
                >
                  <option value="vegetarian">100% VEGETARIAN</option>
                  <option value="non-vegetarian">NON-VEGETARIAN</option>
                  <option value="jain">JAIN VEGETARIAN</option>
                  <option value="vegan">VEGAN</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-black uppercase tracking-wider mb-1 text-[11px] text-black">
                AESTHETIC / THEME DIRECTIVE
              </label>
              <input
                type="text"
                value={stagedProfile.theme || ""}
                onChange={(e) =>
                  setStagedProfile({ ...stagedProfile, theme: e.target.value })
                }
                className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold text-black focus:bg-white focus:outline-none shadow-[2px_2px_0px_0px_black]"
              />
            </div>

            {/* Non-Negotiable Must-Haves */}
            <div className="space-y-2">
              <label className="block font-black uppercase tracking-wider text-[11px] text-black">
                PROTECTED MUST-HAVES (NON-NEGOTIABLES)
              </label>
              <div className="flex flex-wrap gap-2">
                {(stagedProfile.mustHaves || []).map((mh, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-2 text-xs font-black bg-[#D02020] text-white px-2.5 py-1 border-2 border-black shadow-[2px_2px_0px_0px_black]"
                  >
                    <span>{mh}</span>
                    <button
                      type="button"
                      onClick={() =>
                        setStagedProfile({
                          ...stagedProfile,
                          mustHaves: stagedProfile.mustHaves?.filter((_, i) => i !== idx),
                        })
                      }
                      className="hover:text-black font-black"
                    >
                      <X size={14} strokeWidth={3} />
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Press Enter to register constraint..."
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.currentTarget.value.trim()) {
                    e.preventDefault();
                    setStagedProfile({
                      ...stagedProfile,
                      mustHaves: [
                        ...(stagedProfile.mustHaves || []),
                        e.currentTarget.value.trim(),
                      ],
                    });
                    e.currentTarget.value = "";
                  }
                }}
                className="w-full px-3 py-2 bg-[#F0F0F0] border-2 border-black text-xs font-bold placeholder:text-black/50 shadow-[2px_2px_0px_0px_black] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Action to Generate Plan */}
          <div className="pt-4 border-t-4 border-black space-y-4">
            <label className="flex items-center gap-3 text-xs font-black uppercase tracking-wider cursor-pointer select-none">
              <input
                type="checkbox"
                checked={saveAsNewEvent}
                onChange={(e) => setSaveAsNewEvent(e.target.checked)}
                className="w-4 h-4 border-2 border-black accent-[#D02020]"
              />
              <span>
                SAVE AS NEW EVENT (PRESERVE CURRENT DOSSIER)
              </span>
            </label>

            <button
              onClick={handleGeneratePlan}
              disabled={isGeneratingPlan}
              className="btn-bauhaus w-full py-4 bg-[#D02020] hover:bg-[#D02020]/90 text-white font-mono text-xs uppercase tracking-widest font-black border-4 border-black shadow-[4px_4px_0px_0px_black] flex items-center justify-center gap-2"
            >
              {isGeneratingPlan ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>SYNTHESIZING CONSTRAINTS...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} strokeWidth={2.5} />
                  <span>
                    {saveAsNewEvent ? "SYNTHESIZE NEW EVENT DOSSIER" : "GENERATE MASTER EVENT PLAN"}
                  </span>
                  <ArrowRight size={16} strokeWidth={2.5} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
