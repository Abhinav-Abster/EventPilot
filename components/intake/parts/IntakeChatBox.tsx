import React from "react";
import { Send, Bot, User, RefreshCw } from "lucide-react";

export interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
}

interface IntakeChatBoxProps {
  messages: ChatMessage[];
  inputMessage: string;
  setInputMessage: (msg: string) => void;
  isProcessing: boolean;
  onSendMessage: () => void;
}

/**
 * Text area and submission controls for free-form conversational event requirements.
 */
export function IntakeChatBox({
  messages,
  inputMessage,
  setInputMessage,
  isProcessing,
  onSendMessage,
}: IntakeChatBoxProps) {
  return (
    <div className="lg:col-span-7 border-4 border-black bg-white shadow-hard-8 flex flex-col h-[650px] overflow-hidden">
      {/* Bauhaus Blue Header */}
      <div className="px-6 py-4 border-b-4 border-black bg-bauhausBlue text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bot size={20} strokeWidth={2.5} className="text-bauhausYellow" />
          <div>
            <h2 className="font-display font-black text-sm uppercase tracking-wider text-white">
              INTAKE TERMINAL
            </h2>
            <span className="font-mono text-micro text-bauhausYellow uppercase font-bold tracking-wider block">
              DETERMINISTIC CONVERSATIONAL AGENT
            </span>
          </div>
        </div>
        <span className="font-mono text-micro font-black uppercase bg-bauhausRed text-white border-2 border-black px-2.5 py-1 shadow-hard-2">
          CONNECTED
        </span>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-bauhausCanvas">
        {messages.map((m) => {
          const isUser = m.sender === "user";
          return (
            <div
              key={m.id}
              className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 flex items-center justify-center shrink-0 border-2 border-black font-mono text-xs shadow-hard-2 ${
                  isUser ? "bg-bauhausYellow text-black" : "bg-bauhausBlue text-white"
                }`}
              >
                {isUser ? (
                  <User size={16} strokeWidth={2.5} />
                ) : (
                  <Bot size={16} strokeWidth={2.5} />
                )}
              </div>
              <div
                className={`p-4 max-w-[85%] text-xs sm:text-sm leading-relaxed border-2 border-black shadow-hard-4 ${
                  isUser
                    ? "bg-bauhausRed text-white font-medium"
                    : "bg-white text-black font-medium"
                }`}
              >
                <p className="leading-relaxed">{m.text}</p>
                <div
                  className={`text-micro font-mono mt-2 uppercase font-black ${
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
            onSendMessage();
          }}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="State parameters (e.g. 60 guests in Pune, ₹40,000 budget, anime theme, vegetarian)..."
            className="flex-1 px-4 py-3 bg-bauhausCanvas border-2 border-black text-xs sm:text-sm font-bold text-black focus:outline-none focus:bg-white shadow-hard-2"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isProcessing}
            className="btn-bauhaus px-5 py-3 bg-bauhausRed hover:bg-bauhausRed/90 text-white border-2 border-black shadow-hard-3 disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={16} strokeWidth={2.5} />
          </button>
        </form>
      </div>
    </div>
  );
}
