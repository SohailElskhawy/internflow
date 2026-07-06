"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { Bot, X, Send, Sparkles, User, MessageSquare } from "lucide-react";

interface Message {
  id: string;
  sender: "user" | "ai";
  text: string;
  suggestedNext?: string[];
}

const QuickPromptButton: React.FC<{ promptText: string; onClick: (text: string) => void }> = React.memo(
  ({ promptText, onClick }) => {
    const handleClick = useCallback(() => {
      onClick(promptText);
    }, [promptText, onClick]);

    return (
      <button
        onClick={handleClick}
        className="text-[11px] px-2.5 py-1 bg-muted/60 hover:bg-muted border rounded-full text-foreground transition shrink-0"
      >
        {promptText}
      </button>
    );
  }
);
QuickPromptButton.displayName = "QuickPromptButton";

export const AiCareerAdvisorChat: React.FC = React.memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      sender: "ai",
      text: "Hello! I'm your InternFlow AI Career Coach. Ask me how to prepare for interviews, improve your CV, or explain technical topics like JWT or Docker!",
      suggestedNext: ["What should I improve on my CV?", "Explain JWT", "How to prepare for interviews?"],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, scrollToBottom]);

  const sendMessage = useCallback(
    async (textToSend?: string) => {
      const text = (textToSend || input).trim();
      if (!text || loading) return;

      const userMsg: Message = {
        id: Date.now().toString(),
        sender: "user",
        text,
      };

      setMessages((prev) => [...prev, userMsg]);
      if (!textToSend) setInput("");
      setLoading(true);

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: text }),
        });
        const json = await res.json();

        if (json.success && json.data) {
          const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: json.data.reply,
            suggestedNext: json.data.suggestedNextQuestions,
          };
          setMessages((prev) => [...prev, aiMsg]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              id: (Date.now() + 1).toString(),
              sender: "ai",
              text: "Sorry, I ran into an error processing your query. Please try again!",
            },
          ]);
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: (Date.now() + 1).toString(),
            sender: "ai",
            text: "Network error. Please check your connection.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [input, loading]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendMessage();
      }
    },
    [sendMessage]
  );

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 p-3.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-105 transition flex items-center gap-2 font-medium text-xs"
        >
          <Sparkles className="w-5 h-5 animate-pulse" />
          <span>Ask AI Advisor</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-card border rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="p-4 bg-primary text-primary-foreground flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 bg-white/20 rounded-lg">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">AI Career Advisor</h4>
                <p className="text-[11px] opacity-90">Powered by Gemini AI</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-md">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-muted/10">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-2 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.sender === "ai" && (
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[82%] p-3 rounded-xl leading-relaxed whitespace-pre-wrap ${
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground font-medium rounded-br-none"
                      : "bg-card border shadow-xs text-foreground rounded-bl-none"
                  }`}
                >
                  {msg.text}
                  {msg.suggestedNext && msg.suggestedNext.length > 0 && (
                    <div className="mt-3 pt-2 border-t flex flex-wrap gap-1.5">
                      {msg.suggestedNext.map((sug, i) => (
                        <QuickPromptButton key={i} promptText={sug} onClick={sendMessage} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2 text-muted-foreground text-xs p-2">
                <Sparkles className="w-4 h-4 animate-spin text-primary" />
                <span>AI is typing response...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-3 border-t bg-card flex items-center gap-2 shrink-0">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask career advice, JWT, CV..."
              className="flex-1 text-xs p-2.5 rounded-xl border bg-muted/30 focus:ring-1 focus:ring-primary outline-none"
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="p-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 disabled:opacity-50 transition shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
});

AiCareerAdvisorChat.displayName = "AiCareerAdvisorChat";
