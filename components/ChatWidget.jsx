"use client";

import { useState, useRef, useEffect } from "react";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I can check an existing order, share our product prices, or help you place a new order. What can I help with?" }
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen]);

  async function sendMessage(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isSending) return;

    const nextMessages = [...messages, { role: "user", content: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setIsSending(true);

    try {
      const history = nextMessages
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(0, -1) // backend appends the new user message itself
        .map((m) => ({ role: m.role, content: m.content }));

      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: trimmed, history }),
      });
      const data = await response.json();

      if (response.ok && data.reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, something went wrong. Please try again or use the contact form." }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "I couldn't reach the server just now — please try again in a moment." }]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="fixed bottom-5 right-5 z-[1000] font-body flex flex-col items-end">
      {isOpen && (
        <div className="w-[340px] h-[460px] bg-ni-surface border border-ni-border/60 rounded-2xl shadow-premium flex flex-col mb-3 overflow-hidden animate-scale-up">
          <div className="bg-ni-rust text-white px-4 py-3.5 flex justify-between items-center">
            <span className="font-bold text-sm">Nectar Ingredients</span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="bg-transparent border-none text-white text-xl cursor-pointer leading-none hover:opacity-80 transition-opacity"
            >
              ×
            </button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 bg-ni-surface2/30">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[80%] px-3.5 py-2 rounded-xl text-sm leading-relaxed whitespace-pre-wrap transition-all ${
                  m.role === "user"
                    ? "self-end bg-ni-rust text-white rounded-br-none"
                    : "self-start bg-ni-surface2 text-ni-primary rounded-bl-none border border-ni-border/10"
                }`}
              >
                {m.content}
              </div>
            ))}
            {isSending && (
              <div className="self-start text-ni-muted text-xs px-3 py-1">Typing…</div>
            )}
          </div>

          <form onSubmit={sendMessage} className="flex border-t border-ni-border/20 p-2 gap-2 bg-ni-surface">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              disabled={isSending}
              className="flex-1 bg-ni-surface2 border border-ni-border2/30 rounded-lg px-2.5 py-2 text-sm text-ni-primary placeholder:text-ni-muted outline-none focus:ring-2 focus:ring-ni-rust/50 focus:border-ni-rust transition-all"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className={`bg-ni-rust text-white border-none rounded-lg px-3.5 text-sm active:scale-[0.97] transition-all cursor-pointer ${
                isSending || !input.trim()
                  ? "opacity-60 cursor-default"
                  : "hover:bg-ni-rust-lt"
              }`}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="w-14 h-14 rounded-full bg-ni-rust text-white border-none flex items-center justify-center text-2xl shadow-lg hover:shadow-hover hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer"
        style={{
          boxShadow: "0 8px 20px var(--glow-color-strong)",
        }}
      >
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
}
