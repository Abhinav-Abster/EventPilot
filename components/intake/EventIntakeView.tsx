"use client";

import React, { useState } from "react";
import {
  Send,
  Sparkles,
  Bot,
  User,
  CheckCircle2,
  Calendar,
  Users,
  Wallet,
  MapPin,
  ArrowRight,
  RefreshCw,
  Plus,
  Trash2,
} from "lucide-react";
import { usePlan } from "../../lib/persistence/PlanContext";
import { processEventIntake, generateFullEventPlan } from "../../lib/ai/aiService";
import { EventProfile, DietaryPreference, VenueType } from "../../lib/types/event";
import { formatINR, paiseToRupees, rupeesToPaise } from "../../lib/budget/moneyUtils";
import { NavTab } from "../layout/Navbar";

interface EventIntakeViewProps {
  onNavigate: (tab: NavTab) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

export function EventIntakeView({ onNavigate }: EventIntakeViewProps) {
  const { plan, updateProfile, setFullPlan } = usePlan();

  const [inputMessage, setInputMessage] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "assistant",
      text: "Hello! I am EventPilot, your AI event planning assistant. Describe the celebration you are envisioning in natural language — including your guest count, budget in ₹, city, theme, and dietary needs. I will extract your constraints and construct a deterministic plan.",
      timestamp: "Just now",
    },
  ]);

  const [stagedProfile, setStagedProfile] = useState<Partial<EventProfile>>({
    ...plan.profile,
  });

  const starterPrompts = [
    {
      title: "Sister's Anime Birthday (Primary Persona)",
      query:
        "I'm planning my sister's birthday in Pune for 60 people. My budget is ₹40,000. She loves anime, and I'd like an outdoor evening party with vegetarian food.",
    },
    {
      title: "Intimate Eco Wedding",
      query:
        "Planning an eco-friendly intimate wedding in Pune for 100 guests with a budget of ₹3,00,000. Vegetarian buffet and day-time outdoor lawn.",
    },
    {
      title: "Diwali Community Gathering",
      query:
        "Organizing a Diwali community cultural evening for 150 society members in Pune with ₹75,000 budget. Pure veg snacks, stage performances, and rangoli.",
    },
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: "msg-" + Date.now(),
      sender: "user",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsProcessing(true);

    try {
      const result = await processEventIntake(text, stagedProfile);

      const assistantMsg: ChatMessage = {
        id: "msg-" + (Date.now() + 1),
        sender: "assistant",
        text: result.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setStagedProfile((prev) => ({ ...prev, ...result.extractedProfile }));
    } catch (e) {
      console.error("Intake processing failed:", e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGeneratingPlan(true);
    try {
      const result = await generateFullEventPlan(stagedProfile);
      setFullPlan(result.plan);
      onNavigate("dashboard");
    } catch (e) {
      console.error("Plan generation failed:", e);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  return (
    <div className="space-y-8 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold font-display text-forest-900">
          Conversational Event Intake & Profile Builder
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Describe your vision naturally. EventPilot extracts structured parameters with verified Zod validation and asks only relevant clarifying questions.
        </p>
      </div>

      {/* Starter Prompts */}
      <div className="space-y-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          Try Quick Examples:
        </span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {starterPrompts.map((starter, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(starter.query)}
              className="text-left p-3.5 bg-white border border-sand-200 hover:border-forest-800 hover:shadow-sm rounded-xl transition group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-forest-900 group-hover:text-forest-800">
                  {starter.title}
                </span>
                <Sparkles className="w-3.5 h-3.5 text-gold-500" />
              </div>
              <p className="text-[11px] text-stone-500 line-clamp-2">
                {`"${starter.query}"`}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Chat vs Structured Extraction Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Chat Interface Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-sand-200 shadow-sm flex flex-col h-[600px] overflow-hidden">
          {/* Chat Header */}
          <div className="px-6 py-4 bg-sand-50 border-b border-sand-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-forest-900 flex items-center justify-center text-white">
                <Bot className="w-4 h-4 text-gold-400" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-forest-900">EventPilot Intake Assistant</h3>
                <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Deterministic Schema Parsing Active
                </span>
              </div>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {messages.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div
                  key={m.id}
                  className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-semibold ${
                      isUser
                        ? "bg-sand-200 text-stone-800"
                        : "bg-forest-900 text-gold-400"
                    }`}
                  >
                    {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div
                    className={`p-4 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? "bg-forest-900 text-white rounded-tr-xs"
                        : "bg-sand-50 border border-sand-200 text-stone-800 rounded-tl-xs"
                    }`}
                  >
                    {m.text}
                    <div
                      className={`text-[10px] mt-1.5 ${
                        isUser ? "text-sand-300 text-right" : "text-stone-400"
                      }`}
                    >
                      {m.timestamp}
                    </div>
                  </div>
                </div>
              );
            })}
            {isProcessing && (
              <div className="flex items-center gap-2 text-stone-400 text-xs italic pl-10">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Extracting requirements and constraints...</span>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="p-4 bg-sand-50 border-t border-sand-200">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type event details (e.g., '60 guests in Pune, ₹40,000 budget, anime theme, pure veg')..."
                className="flex-1 px-4 py-2.5 bg-white border border-sand-300 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:border-forest-900 text-stone-900"
              />
              <button
                type="submit"
                disabled={!inputMessage.trim() || isProcessing}
                className="p-2.5 bg-forest-900 hover:bg-forest-850 disabled:bg-stone-300 text-white rounded-xl transition"
                aria-label="Send message"
              >
                <Send className="w-4 h-4 text-gold-400" />
              </button>
            </form>
          </div>
        </div>

        {/* Structured Profile Column */}
        <div className="lg:col-span-5 bg-white rounded-3xl border border-sand-200 shadow-sm p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-sand-200">
            <div>
              <h3 className="text-sm font-bold text-forest-900 font-display">
                Structured Event Profile
              </h3>
              <p className="text-[11px] text-stone-500">
                Extracted fields verified with Zod schemas
              </p>
            </div>
            <span className="text-[10px] bg-sand-100 text-stone-700 px-2 py-0.5 rounded font-mono">
              Live Preview
            </span>
          </div>

          {/* Form Fields */}
          <div className="space-y-3.5 text-xs">
            <div>
              <label className="block text-stone-600 font-medium mb-1">
                Event Name
              </label>
              <input
                type="text"
                value={stagedProfile.name || ""}
                onChange={(e) =>
                  setStagedProfile({ ...stagedProfile, name: e.target.value })
                }
                className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-600 font-medium mb-1 flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-gold-600" />
                  <span>Date</span>
                </label>
                <input
                  type="date"
                  value={stagedProfile.date || ""}
                  onChange={(e) =>
                    setStagedProfile({ ...stagedProfile, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1 flex items-center gap-1">
                  <Users className="w-3 h-3 text-gold-600" />
                  <span>Guest Count</span>
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
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-600 font-medium mb-1 flex items-center gap-1">
                  <Wallet className="w-3 h-3 text-gold-600" />
                  <span>Total Budget (₹)</span>
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
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gold-600" />
                  <span>City / Location</span>
                </label>
                <input
                  type="text"
                  value={stagedProfile.location?.city || "Pune"}
                  onChange={(e) =>
                    setStagedProfile({
                      ...stagedProfile,
                      location: {
                        ...(stagedProfile.location || { venueType: "outdoor" }),
                        city: e.target.value,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-stone-600 font-medium mb-1">
                  Venue Setting
                </label>
                <select
                  value={stagedProfile.location?.venueType || "outdoor"}
                  onChange={(e) =>
                    setStagedProfile({
                      ...stagedProfile,
                      location: {
                        ...(stagedProfile.location || { city: "Pune" }),
                        venueType: e.target.value as VenueType,
                      },
                    })
                  }
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs bg-white"
                >
                  <option value="outdoor">Outdoor Lawn</option>
                  <option value="indoor">Indoor Hall</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
              <div>
                <label className="block text-stone-600 font-medium mb-1">
                  Dietary Mandate
                </label>
                <select
                  value={stagedProfile.dietaryPreferences?.[0] || "vegetarian"}
                  onChange={(e) =>
                    setStagedProfile({
                      ...stagedProfile,
                      dietaryPreferences: [e.target.value as DietaryPreference],
                    })
                  }
                  className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs bg-white"
                >
                  <option value="vegetarian">100% Vegetarian</option>
                  <option value="non-vegetarian">Non-Vegetarian</option>
                  <option value="jain">Jain Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-stone-600 font-medium mb-1">
                Theme & Aesthetic
              </label>
              <input
                type="text"
                value={stagedProfile.theme || ""}
                onChange={(e) =>
                  setStagedProfile({ ...stagedProfile, theme: e.target.value })
                }
                className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
              />
            </div>

            {/* Protected Must-Haves */}
            <div>
              <label className="block text-stone-600 font-medium mb-1">
                Protected Must-Haves (Non-Negotiable)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {(stagedProfile.mustHaves || []).map((mh, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-md"
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
                      className="text-emerald-700 hover:text-rose-600"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Press Enter to add must-have constraint..."
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
                className="w-full px-3 py-2 border border-sand-300 rounded-lg text-xs"
              />
            </div>
          </div>

          {/* Action to Generate Plan */}
          <div className="pt-3 border-t border-sand-200">
            <button
              onClick={handleGeneratePlan}
              disabled={isGeneratingPlan}
              className="w-full py-3 bg-forest-900 hover:bg-forest-850 disabled:bg-stone-300 text-white font-semibold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {isGeneratingPlan ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-gold-400" />
                  <span>Synthesizing Master Plan & Budget...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-gold-400" />
                  <span>Generate Master Plan</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
