"use client";

import { useState, useRef, useEffect } from "react";

const CHATBOT_ENDPOINT = process.env.NEXT_PUBLIC_SUPABASE_CHATBOT_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

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

      const response = await fetch(CHATBOT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
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
    <div style={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000, fontFamily: "inherit" }}>
      {isOpen && (
        <div
          style={{
            width: 340,
            height: 460,
            background: "#fffaf3",
            border: "1px solid #eadfd0",
            borderRadius: 16,
            boxShadow: "0 12px 32px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            marginBottom: 12,
            overflow: "hidden",
          }}
        >
          <div style={{ background: "#b5541f", color: "#fff", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600 }}>Nectar Ingredients</span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              style={{ background: "none", border: "none", color: "#fff", fontSize: 18, cursor: "pointer", lineHeight: 1 }}
            >
              ×
            </button>
          </div>

          <div ref={scrollRef} style={{ flex: 1, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                  background: m.role === "user" ? "#b5541f" : "#f1e8dc",
                  color: m.role === "user" ? "#fff" : "#3a2f22",
                  padding: "8px 12px",
                  borderRadius: 12,
                  maxWidth: "80%",
                  fontSize: 14,
                  lineHeight: 1.4,
                  whiteSpace: "pre-wrap",
                }}
              >
                {m.content}
              </div>
            ))}
            {isSending && (
              <div style={{ alignSelf: "flex-start", color: "#8a7a63", fontSize: 13, padding: "4px 12px" }}>Typing…</div>
            )}
          </div>

          <form onSubmit={sendMessage} style={{ display: "flex", borderTop: "1px solid #eadfd0", padding: 8, gap: 8 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message…"
              disabled={isSending}
              style={{ flex: 1, border: "1px solid #eadfd0", borderRadius: 8, padding: "8px 10px", fontSize: 14, outline: "none" }}
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              style={{
                background: "#b5541f",
                color: "#fff",
                border: "none",
                borderRadius: 8,
                padding: "0 14px",
                fontSize: 14,
                cursor: isSending ? "default" : "pointer",
                opacity: isSending || !input.trim() ? 0.6 : 1,
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        style={{
          width: 56,
          height: 56,
          borderRadius: "50%",
          background: "#b5541f",
          color: "#fff",
          border: "none",
          boxShadow: "0 8px 20px rgba(181,84,31,0.4)",
          cursor: "pointer",
          fontSize: 24,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: "auto",
        }}
      >
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
}
