"use client";

import React, { useState, useRef, useEffect } from "react";

function formatChatMessage(text) {
  if (!text) return null;

  // Clean up any raw markdown header hashes or horizontal dividers
  const cleanText = text
    .replace(/^---+$/gm, "")
    .replace(/^#+\s*/gm, "");

  const lines = cleanText.split("\n");

  return lines.map((line, lineIndex) => {
    let processedLine = line;

    // Format markdown table rows (| key | value |) into clean bullet key-value pairs
    if (processedLine.trim().startsWith("|") && processedLine.trim().endsWith("|")) {
      const cells = processedLine
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);

      // Skip table header divider row (e.g., |---|---|)
      if (cells.every((c) => /^[-:]+$/.test(c))) {
        return null;
      }

      if (cells.length >= 2) {
        processedLine = `• **${cells[0]}:** ${cells.slice(1).join(" — ")}`;
      }
    }

    // Parse **bold text** into <strong> elements
    const parts = processedLine.split(/(\*\*[^*]+\*\*)/g);

    const formattedLine = parts.map((part, partIndex) => {
      if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
        return (
          <strong key={partIndex} className="font-bold text-neutral-900 dark:text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });

    return (
      <React.Fragment key={lineIndex}>
        {lineIndex > 0 && <br />}
        {formattedLine}
      </React.Fragment>
    );
  });
}

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hi there! 👋 Welcome to Nectar Ingredients! 🌿\n\nI can help you:\n- 📦 Check the status of an existing order\n- 🍅 Explore our product specs & prices\n- 🛒 Place a new bulk ingredient order\n\nWhat do you need today? 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef(null);
  const widgetRef = useRef(null);
  const inputRef = useRef(null);

  // Auto focus input whenever chat opens
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Re-focus input whenever sending finishes or messages update while open
  useEffect(() => {
    if (isOpen && !isSending) {
      inputRef.current?.focus();
    }
  }, [isOpen, isSending, messages]);

  // Scroll to bottom of chat when new messages arrive
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isOpen]);

  // Close chatbot when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
        inputRef.current?.blur();
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  // Isolate scroll so wheel scrolling in chatbot doesn't scroll the website
  useEffect(() => {
    const scrollEl = scrollRef.current;
    if (!scrollEl || !isOpen) return;

    const handleWheel = (e) => {
      const { scrollTop, scrollHeight, clientHeight } = scrollEl;
      const isDeltaDown = e.deltaY > 0;

      // Prevent parent window scrolling when at top or bottom boundary
      if (
        (isDeltaDown && scrollTop + clientHeight >= scrollHeight - 1) ||
        (!isDeltaDown && scrollTop <= 0)
      ) {
        e.preventDefault();
      }
      e.stopPropagation();
    };

    scrollEl.addEventListener("wheel", handleWheel, { passive: false });
    return () => scrollEl.removeEventListener("wheel", handleWheel);
  }, [isOpen]);

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
        .slice(0, -1)
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
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Sorry, something went wrong. 😅 Please try again or use the contact form. 📩" },
        ]);
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "I couldn't reach the server just now 📡 — please try again in a moment! 🙏" },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div ref={widgetRef} className="fixed bottom-5 right-5 z-[1000] font-body flex flex-col items-end">
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] h-[480px] bg-white dark:bg-[#1A1A1D] border border-neutral-200 dark:border-neutral-800 rounded-2xl shadow-2xl flex flex-col mb-3 overflow-hidden animate-scale-up">
          {/* Chatbot Header */}
          <div className="bg-[#BC4B20] text-white px-4 py-3.5 flex justify-between items-center shadow-md">
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <div>
                <span className="font-bold text-sm block leading-none">Nectar Ingredients</span>
                <span className="text-[10px] text-white/80">AI Assistant · Online 🟢</span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close chat"
              className="w-7 h-7 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white text-lg cursor-pointer transition-colors"
            >
              ×
            </button>
          </div>

          {/* Messages area with isolated scroll */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-3.5 flex flex-col gap-2.5 bg-neutral-50 dark:bg-[#141416] overscroll-contain"
            style={{ overscrollBehavior: "contain" }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={`max-w-[85%] px-3.5 py-2.5 rounded-2xl text-xs sm:text-sm leading-relaxed transition-all shadow-sm ${
                  m.role === "user"
                    ? "self-end bg-[#BC4B20] text-white rounded-br-none"
                    : "self-start bg-white dark:bg-[#202024] text-neutral-800 dark:text-neutral-100 rounded-bl-none border border-neutral-200/80 dark:border-neutral-700/60"
                }`}
              >
                {formatChatMessage(m.content)}
              </div>
            ))}
            {isSending && (
              <div className="self-start text-neutral-500 text-xs px-3 py-1.5 flex items-center gap-1.5">
                <span className="animate-pulse">💬 Typing response...</span>
              </div>
            )}
          </div>

          {/* Chatbot Input form */}
          <form onSubmit={sendMessage} className="flex border-t border-neutral-200 dark:border-neutral-800 p-2.5 gap-2 bg-white dark:bg-[#1A1A1D]">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              disabled={isSending}
              className="flex-1 bg-neutral-100 dark:bg-[#242428] border border-neutral-300 dark:border-neutral-700 rounded-full px-4 py-2 text-xs sm:text-sm text-neutral-900 dark:text-white placeholder:text-neutral-500 outline-none focus:ring-2 focus:ring-[#BC4B20]/50 transition-all"
            />
            <button
              type="submit"
              disabled={isSending || !input.trim()}
              className={`bg-[#BC4B20] text-white border-none rounded-full px-4 py-2 text-xs font-bold uppercase tracking-wider active:scale-[0.97] transition-all cursor-pointer shadow-sm ${
                isSending || !input.trim()
                  ? "opacity-50 cursor-default"
                  : "hover:bg-[#D45E30]"
              }`}
            >
              Send 🚀
            </button>
          </form>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        className="w-14 h-14 rounded-full bg-[#BC4B20] text-white border-none flex items-center justify-center text-2xl shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer"
        style={{
          boxShadow: "0 8px 24px rgba(188, 75, 32, 0.4)",
        }}
      >
        {isOpen ? "×" : "💬"}
      </button>
    </div>
  );
}
