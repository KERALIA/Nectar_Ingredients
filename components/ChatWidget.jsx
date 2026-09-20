"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";

// ============================================================================
// LUXURY BESPOKE SVG VECTOR ICONS
// ============================================================================

function IconRefresh({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  );
}

function IconClose({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

function IconMic({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

function IconSend({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function IconCopy({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </svg>
  );
}

function IconCheck({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function IconVolume({ className = "w-3.5 h-3.5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
    </svg>
  );
}

function IconFileText({ className = "w-4 h-4" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
  );
}

function IconLuxuryChat({ className = "w-7 h-7" }) {
  return (
    <svg className={className} viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M14 3.5C8.2 3.5 3.5 7.75 3.5 13C3.5 15.55 4.6 17.85 6.45 19.55C6.05 21.25 5.15 22.75 3.9 23.9C3.6 24.18 3.8 24.68 4.2 24.62C6.65 24.25 8.85 23.2 10.5 21.7C11.62 22.32 12.8 22.5 14 22.5C19.8 22.5 24.5 18.25 24.5 13C24.5 7.75 19.8 3.5 14 3.5Z"
        fill="currentColor"
        fillOpacity="0.22"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="9.5" cy="13" r="1.5" fill="currentColor" />
      <circle cx="14" cy="13" r="1.5" fill="currentColor" />
      <circle cx="18.5" cy="13" r="1.5" fill="currentColor" />
    </svg>
  );
}

// ============================================================================
// RICH MARKDOWN & BESPOKE DATASHEET CARD PARSER
// ============================================================================

function parseInlineTokens(text, isUser = false) {
  if (!text) return text;

  // Split by markdown bold (**text**) and markdown links ([label](url))
  const tokenRegex = /(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    // Handle **bold**
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) {
      const boldContent = part.slice(2, -2);
      return (
        <strong
          key={index}
          className={`font-semibold tracking-tight font-heading ${
            isUser ? "text-white font-bold" : "text-neutral-900 dark:text-neutral-50"
          }`}
        >
          {parseInlineTokens(boldContent, isUser)}
        </strong>
      );
    }

    // Handle [label](url)
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const [, label, url] = linkMatch;
      const isPdf = url.toLowerCase().endsWith(".pdf") || url.includes("Certificates_of_ananalysis") || url.includes("Brochure");
      const isWhatsApp = url.includes("wa.me") || url.includes("whatsapp");
      const isEmail = url.startsWith("mailto:");

      // Professional Laboratory / Brochure PDF Download Card
      if (isPdf && !isUser) {
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            download
            className="my-2.5 flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-[#FAF6F0] dark:bg-[#231E1A] border border-[#E5DAC8] dark:border-[#3D322A] hover:border-[#BC4B20]/60 dark:hover:border-[#BC4B20]/60 hover:bg-[#F4ECE0] dark:hover:bg-[#2A241F] transition-all shadow-xs group cursor-pointer text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-lg bg-[#BC4B20]/15 dark:bg-[#BC4B20]/25 flex items-center justify-center text-[#BC4B20] dark:text-amber-400 shrink-0 shadow-2xs">
                <IconFileText className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="text-[13.5px] font-semibold font-heading text-neutral-900 dark:text-neutral-100 truncate group-hover:text-[#BC4B20] transition-colors">
                  {label}
                </div>
                <div className="text-[11px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider font-mono mt-0.5">
                  Verified Batch PDF
                </div>
              </div>
            </div>
            <span className="text-[12px] font-bold text-[#BC4B20] dark:text-amber-400 shrink-0 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
              Download →
            </span>
          </a>
        );
      }

      // Professional WhatsApp Action Card
      if (isWhatsApp && !isUser) {
        return (
          <a
            key={index}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="my-2 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-medium text-[13.5px] hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 transition-all shadow-xs"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold font-heading">{label}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-normal">Direct WhatsApp</span>
          </a>
        );
      }

      // Professional Email Card
      if (isEmail && !isUser) {
        return (
          <a
            key={index}
            href={url}
            className="my-1.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 text-[#BC4B20] dark:text-amber-400 font-medium text-[13.5px] hover:bg-neutral-200/70 transition-all"
          >
            <span>✉</span>
            <span className="underline">{label}</span>
          </a>
        );
      }

      // Standard link
      const isExternal = url.startsWith("http://") || url.startsWith("https://");
      return (
        <a
          key={index}
          href={url}
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className={`font-semibold underline hover:opacity-80 transition-opacity ${
            isUser ? "text-white" : "text-[#BC4B20] dark:text-amber-400"
          }`}
        >
          {label}
        </a>
      );
    }

    return part;
  });
}

function FormattedChatMessage({ text, isStreaming = false, isUser = false }) {
  if (!text && !isStreaming) return null;

  // Clean raw markdown header hashes and dividers
  const cleanText = (text || "")
    .replace(/^---+$/gm, "")
    .replace(/^#+\s*/gm, "");

  const lines = cleanText.split("\n");

  return (
    <div
      className={`space-y-1.5 text-[14.5px] sm:text-[15px] leading-relaxed font-body tracking-normal ${
        isUser ? "text-white font-medium break-words" : "text-neutral-800 dark:text-neutral-200"
      }`}
    >
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        const isLastLine = idx === lines.length - 1;

        // Empty line spacer
        if (!trimmed) {
          return <div key={idx} className="h-1.5" />;
        }

        // Bullet point formatting (•, -, *)
        if (trimmed.startsWith("•") || trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          const bulletContent = trimmed.replace(/^([•\-*]\s*)/, "");
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-0.5 my-1">
              <span
                className={`w-1.5 h-1.5 rounded-full shrink-0 mt-2 select-none ${
                  isUser ? "bg-white" : "bg-[#BC4B20] dark:bg-amber-400"
                }`}
              />
              <div className="flex-1">
                {parseInlineTokens(bulletContent, isUser)}
                {isStreaming && isLastLine && <span className="animate-chatgpt-cursor" />}
              </div>
            </div>
          );
        }

        // Numbered list item (e.g. 1., 2.)
        const numMatch = trimmed.match(/^(\d+️⃣|\d+\.)\s+(.+)$/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-0.5 my-1.5">
              <span
                className={`font-semibold font-heading text-xs shrink-0 select-none mt-0.5 px-1.5 py-0.5 rounded-md ${
                  isUser ? "bg-white/20 text-white" : "bg-[#BC4B20]/10 dark:bg-amber-400/15 text-[#BC4B20] dark:text-amber-400"
                }`}
              >
                {numMatch[1]}
              </span>
              <div className="flex-1">
                {parseInlineTokens(numMatch[2], isUser)}
                {isStreaming && isLastLine && <span className="animate-chatgpt-cursor" />}
              </div>
            </div>
          );
        }

        // Normal paragraph line
        return (
          <div key={idx} className="break-words">
            {parseInlineTokens(line, isUser)}
            {isStreaming && isLastLine && <span className="animate-chatgpt-cursor" />}
          </div>
        );
      })}
      {isStreaming && lines.length === 0 && <span className="animate-chatgpt-cursor" />}
    </div>
  );
}

// ============================================================================
// EXECUTIVE STARTER PROMPTS
// ============================================================================

const EXECUTIVE_STARTERS = [
  { label: "Product Specifications & Mesh Sizes", query: "What are the technical specifications and mesh sizes for your vegetable powders?" },
  { label: "Laboratory COA Certificates", query: "Can I download your batch Certificates of Analysis and lab reports?" },
  { label: "Download Company Brochure PDF", query: "Download company brochure" },
  { label: "Track Active Order / Sample Dispatch", query: "How do I track my active sample or dispatch status?" },
  { label: "Direct Commercial Pricing & Wholesale MOQs", query: "How can I contact Mehul Patel for commercial pricing and wholesale MOQs?" },
];

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! 👋 Welcome to **Nectar Intelligence** — your technical & commercial assistant for pure dehydrated powders.\n\nHow can I help you today? Feel free to ask about product specifications, custom formulation advice, batch test reports, or track your sample dispatch! 🌿",
      time: "Just now",
      isStreaming: false,
    },
  ]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [isSpeakingIndex, setIsSpeakingIndex] = useState(null);
  const [voiceError, setVoiceError] = useState("");

  const scrollRef = useRef(null);
  const widgetRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const streamingTimerRef = useRef(null);

  // Auto-grow textarea to match content perfectly without overflowing container
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const scrollH = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(scrollH, 22), 96)}px`;
    }
  }, [input]);

  // Check Web Speech API support
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setSpeechSupported(true);
      }
    }
  }, []);

  // Voice recording toggle with continuous listening & real-time streaming
  const toggleVoiceInput = () => {
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setVoiceError("Voice input is not supported in this browser.");
      setTimeout(() => setVoiceError(""), 4000);
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          console.warn("Stop speech error:", e);
        }
      }
      setIsListening(false);
      textareaRef.current?.focus();
      return;
    }

    try {
      setVoiceError("");
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";

      const prefixText = (input || "").trim();

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = 0; i < event.results.length; i++) {
          const result = event.results[i];
          if (result && result[0]) {
            if (result.isFinal) {
              finalTranscript += result[0].transcript + " ";
            } else {
              interimTranscript += result[0].transcript;
            }
          }
        }

        const combined = (prefixText ? prefixText + " " : "") + finalTranscript + interimTranscript;
        if (combined.trim()) {
          setInput(combined.trimStart());
        }
      };

      recognition.onerror = (event) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error === "not-allowed" || event.error === "permission-denied") {
          setVoiceError("Microphone permission required: please allow access in your browser bar.");
          setIsListening(false);
        } else if (event.error === "network") {
          setVoiceError("Speech recognition network service unavailable in browser.");
          setIsListening(false);
        } else if (event.error !== "no-speech") {
          setIsListening(false);
        }
      };

      recognition.onend = () => {
        setIsListening(false);
        textareaRef.current?.focus();
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.warn("Speech recognition start error:", err);
      setIsListening(false);
      setVoiceError("Could not start microphone. Please verify browser permissions.");
      setTimeout(() => setVoiceError(""), 4000);
    }
  };

  // Text-to-Speech (Read Aloud)
  const toggleSpeak = (text, index) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;

    if (isSpeakingIndex === index) {
      window.speechSynthesis.cancel();
      setIsSpeakingIndex(null);
    } else {
      window.speechSynthesis.cancel();
      const cleanUtterance = text.replace(/[*#•_-]/g, " ").replace(/\[([^\]]+)\]\([^)]+\)/g, "$1");
      const utterance = new SpeechSynthesisUtterance(cleanUtterance);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeakingIndex(null);
      utterance.onerror = () => setIsSpeakingIndex(null);
      setIsSpeakingIndex(index);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Copy assistant response to clipboard
  const handleCopy = (text, index) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  // Clear chat / Start fresh conversation
  const handleClearChat = () => {
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (streamingTimerRef.current) clearInterval(streamingTimerRef.current);
    setMessages([
      {
        role: "assistant",
        content:
          "**New session initialized.**\n\nHow may I assist you with product specifications, analytical certificates, or sample inquiries today?",
        time: "Just now",
        isStreaming: false,
      },
    ]);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "20px";
      textareaRef.current.focus();
    }
  };

  // Auto-resize textarea smoothly without scrollbars or clipping
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      const targetH = Math.min(Math.max(textareaRef.current.scrollHeight, 20), 100);
      textareaRef.current.style.height = `${targetH}px`;
    }
  }, [input]);

  // Persistent Auto-Focus when opened or after interactions
  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => textareaRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Smart scroll: follows stream and aligns to top of assistant response
  useEffect(() => {
    if (!scrollRef.current) return;

    if (isSending) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
    } else if (messages.length > 1) {
      const lastMsg = messages[messages.length - 1];
      if (lastMsg.role === "assistant") {
        const lastEl = document.getElementById(`chat-msg-${messages.length - 1}`);
        if (lastEl && scrollRef.current) {
          const containerTop = scrollRef.current.getBoundingClientRect().top;
          const msgTop = lastEl.getBoundingClientRect().top;
          const targetScroll = scrollRef.current.scrollTop + (msgTop - containerTop) - 12;
          scrollRef.current.scrollTo({ top: Math.max(0, targetScroll), behavior: "smooth" });
        }
      }
    }
  }, [messages, isSending]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (widgetRef.current && !widgetRef.current.contains(e.target)) {
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

  // High-performance streaming typewriter
  const streamResponse = (fullReply) => {
    const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setMessages((prev) => [
      ...prev,
      {
        role: "assistant",
        content: "",
        time: nowTime,
        isStreaming: true,
      },
    ]);

    let currentIndex = 0;
    const totalChars = fullReply.length;
    const step = totalChars > 400 ? 12 : totalChars > 200 ? 8 : 6;
    const tickInterval = 8;

    if (streamingTimerRef.current) clearInterval(streamingTimerRef.current);

    streamingTimerRef.current = setInterval(() => {
      currentIndex += step;
      if (currentIndex >= totalChars) {
        clearInterval(streamingTimerRef.current);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: fullReply,
              isStreaming: false,
            };
          }
          return updated;
        });
        setTimeout(() => textareaRef.current?.focus(), 50);
      } else {
        const slice = fullReply.slice(0, currentIndex);
        setMessages((prev) => {
          const updated = [...prev];
          const lastIdx = updated.length - 1;
          if (lastIdx >= 0 && updated[lastIdx].role === "assistant") {
            updated[lastIdx] = {
              ...updated[lastIdx],
              content: slice,
              isStreaming: true,
            };
          }
          return updated;
        });
      }
    }, tickInterval);
  };

  // Submit message to backend
  const submitMessage = useCallback(
    async (textToSend) => {
      const trimmed = (textToSend || "").trim();
      if (!trimmed || isSending) return;

      const nowTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const nextMessages = [...messages, { role: "user", content: trimmed, time: nowTime, isStreaming: false }];
      setMessages(nextMessages);
      setInput("");
      setIsSending(true);

      setTimeout(() => textareaRef.current?.focus(), 20);

      if (textareaRef.current) {
        textareaRef.current.style.height = "20px";
      }

      try {
        const validHistory = nextMessages
          .filter((m) => m.role === "user" || m.role === "assistant")
          .slice(0, -1);
        const firstUserIdx = validHistory.findIndex((m) => m.role === "user");
        const history = firstUserIdx !== -1 ? validHistory.slice(firstUserIdx) : [];

        const response = await fetch("/api/chatbot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: trimmed, history }),
        });
        const data = await response.json();

        setIsSending(false);

        if (response.ok && data.reply) {
          streamResponse(data.reply);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "I was unable to complete that inquiry. Please reach out to Mehul Patel directly at [+91 98798 38281](https://wa.me/919879838281).",
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              isStreaming: false,
            },
          ]);
          setTimeout(() => textareaRef.current?.focus(), 50);
        }
      } catch (err) {
        setIsSending(false);
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Network connectivity error. Please try again or contact our commercial desk at [nectaringredients@gmail.com](mailto:nectaringredients@gmail.com).",
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            isStreaming: false,
          },
        ]);
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    },
    [messages, isSending]
  );

  // Handle Enter / Shift+Enter in textarea
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submitMessage(input);
    }
  };

  // Custom trigger events & mutual dismiss with SampleBasket
  useEffect(() => {
    const handleOpenEvent = (e) => {
      setIsOpen(true);
      const initialMessage = e?.detail?.message;
      if (initialMessage) {
        setInput(initialMessage);
        setTimeout(() => submitMessage(initialMessage), 150);
      }
    };
    const handleCloseEvent = () => {
      setIsOpen(false);
    };

    window.addEventListener("open-nectar-chat", handleOpenEvent);
    window.addEventListener("close-nectar-chat", handleCloseEvent);
    return () => {
      window.removeEventListener("open-nectar-chat", handleOpenEvent);
      window.removeEventListener("close-nectar-chat", handleCloseEvent);
    };
  }, [submitMessage]);

  useEffect(() => {
    if (isOpen && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("close-sample-basket"));
    }
  }, [isOpen]);

  return (
    <div ref={widgetRef} className="fixed bottom-5 right-5 z-[1000] font-body flex flex-col items-end selection:bg-[#BC4B20]/20">
      {isOpen && (
        <div className="w-[calc(100vw-2rem)] sm:w-[430px] h-[620px] max-h-[86vh] bg-white dark:bg-[#151210] border border-[#E2D8C7] dark:border-[#352C24] rounded-3xl shadow-[0_20px_60px_-10px_rgba(0,0,0,0.35)] flex flex-col mb-3.5 overflow-hidden transition-all animate-in fade-in zoom-in-95 duration-200 font-body">
          {/* ================================================================ */}
          {/* 100% OPAQUE EXECUTIVE HEADER WITH SPACIOUS PADDING */}
          {/* ================================================================ */}
          <div className="bg-white dark:bg-[#181512] border-b border-[#E8DFC8] dark:border-[#352C24] px-6 py-4 flex justify-between items-center select-none shadow-2xs">
            <div className="flex items-center gap-3">
              {/* Official Nectar Logo Image (Borderless & Spacious) */}
              <div className="relative w-8 h-8 flex-shrink-0 flex items-center justify-center">
                <Image
                  src="/Nectar_Logo.png"
                  alt="Nectar Ingredients Logo"
                  width={32}
                  height={32}
                  className="object-contain w-8 h-8"
                  priority
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-[15px] text-neutral-900 dark:text-neutral-50 tracking-tight block leading-none">
                    Nectar Intelligence
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
                </div>
                <span className="text-[11.5px] text-neutral-500 dark:text-neutral-400 font-medium block mt-0.5">
                  B2B Technical & Commercial Desk
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Refresh Session Button */}
              <button
                onClick={handleClearChat}
                title="Reset conversation"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-[#F5EFE6] dark:hover:bg-[#25201C] transition-all cursor-pointer"
                aria-label="New chat"
              >
                <IconRefresh className="w-4 h-4" />
              </button>

              {/* Geometric Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chat"
                title="Close chat"
                className="w-8 h-8 flex items-center justify-center rounded-lg text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-100 hover:bg-[#F5EFE6] dark:hover:bg-[#25201C] transition-all cursor-pointer"
              >
                <IconClose className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ================================================================ */}
          {/* 100% OPAQUE SOLID STATIC CHAT CANVAS WITH GENEROUS MARGINS */}
          {/* ================================================================ */}
          <div
            ref={scrollRef}
            data-lenis-prevent="true"
            className="flex-1 overflow-y-auto px-5 pt-5 pb-8 space-y-4 overscroll-contain [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-neutral-300 dark:[&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent bg-[#FAF8F5] dark:bg-[#141210]"
            style={{
              overscrollBehavior: "contain",
              touchAction: "pan-y",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                id={`chat-msg-${i}`}
                className={`flex flex-col ${m.role === "user" ? "items-end" : "items-start"} group/msg transition-all w-full`}
              >
                {/* Message Bubble with Generous Outer Margins */}
                <div
                  className={`transition-all shadow-xs ${
                    m.role === "user"
                      ? "w-fit max-w-[82%] min-w-[56px] px-4 py-2.5 bg-gradient-to-r from-[#BC4B20] to-[#CF5628] text-white rounded-2xl rounded-tr-xs font-medium text-[14.5px] sm:text-[15px] leading-snug shadow-[0_3px_12px_rgba(188,75,32,0.22)] [&_*]:!text-white text-left break-words"
                      : "w-full rounded-2xl p-4 sm:p-5 bg-white dark:bg-[#1E1916] text-neutral-900 dark:text-neutral-100 border border-[#E5DBCA] dark:border-[#382E26] shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
                  }`}
                >
                  <FormattedChatMessage text={m.content} isStreaming={m.isStreaming} isUser={m.role === "user"} />
                </div>

                {/* Minimalist Action Bar for Assistant Responses */}
                {m.role === "assistant" && !m.isStreaming && m.content && (
                  <div className="flex items-center gap-2.5 mt-1.5 px-1.5 text-[11.5px] text-neutral-400 dark:text-neutral-500 select-none font-medium">
                    <span>{m.time || "Just now"}</span>
                    <span>•</span>
                    <button
                      onClick={() => handleCopy(m.content, i)}
                      title="Copy text"
                      className="hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      {copiedIndex === i ? (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                          <IconCheck className="w-3.5 h-3.5" /> Copied
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <IconCopy className="w-3.5 h-3.5" /> Copy
                        </span>
                      )}
                    </button>
                    <span>•</span>
                    <button
                      onClick={() => toggleSpeak(m.content, i)}
                      title={isSpeakingIndex === i ? "Stop audio" : "Read aloud"}
                      className={`hover:text-neutral-700 dark:hover:text-neutral-300 transition-colors flex items-center gap-1 cursor-pointer ${
                        isSpeakingIndex === i ? "text-[#BC4B20] font-semibold" : ""
                      }`}
                    >
                      <IconVolume className="w-3.5 h-3.5" />
                      <span>{isSpeakingIndex === i ? "Stop" : "Listen"}</span>
                    </button>
                  </div>
                )}
              </div>
            ))}

            {/* Elegant Minimalist Thinking Indicator */}
            {isSending && (
              <div className="self-start bg-white dark:bg-[#1E1916] rounded-2xl rounded-tl-xs border border-[#E5DBCA] dark:border-[#382E26] px-4 py-3.5 flex items-center gap-3 transition-all shadow-xs">
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BC4B20] animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BC4B20] animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#BC4B20] animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-[13.5px] font-medium text-neutral-600 dark:text-neutral-300 font-body">
                  Retrieving product specifications & analytical data...
                </span>
              </div>
            )}

            {/* Executive Quick Prompts */}
            {messages.length <= 2 && !isSending && (
              <div className="pt-2 pb-1">
                <div className="text-[11px] font-bold font-heading uppercase tracking-wider text-neutral-400 dark:text-neutral-500 mb-2.5 px-1">
                  Frequently Inquired Specifications
                </div>
                <div className="flex flex-col gap-1.5">
                  {EXECUTIVE_STARTERS.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => submitMessage(item.query)}
                      className="w-full text-left px-4 py-3 rounded-xl bg-white dark:bg-[#1E1916] hover:bg-[#F2ECE1] dark:hover:bg-[#28221D] border border-[#E5DBCA] dark:border-[#382E26] text-neutral-800 dark:text-neutral-200 text-[13.5px] font-medium font-body transition-all active:scale-[0.99] shadow-2xs cursor-pointer flex items-center justify-between group"
                    >
                      <span className="group-hover:text-[#BC4B20] transition-colors">{item.label}</span>
                      <span className="text-neutral-400 group-hover:text-[#BC4B20] group-hover:translate-x-1 transition-all text-sm font-semibold">
                        →
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ================================================================ */}
          {/* BESPOKE TACTILE COMMAND DOCK WITH GENEROUS OUTER MARGINS */}
          {/* ================================================================ */}
          <div className="border-t border-[#EAE3D2]/80 dark:border-[#2C241D] px-4 pt-3 pb-2.5 bg-white/95 dark:bg-[#161310]/95 backdrop-blur-md flex flex-col gap-2">
            {/* Voice Error Notification Banner */}
            {voiceError && (
              <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs font-medium animate-in fade-in">
                <span>{voiceError}</span>
                <button onClick={() => setVoiceError("")} className="text-xs cursor-pointer ml-2 opacity-70 hover:opacity-100 font-bold">
                  ✕
                </button>
              </div>
            )}

            {/* Listening Indicator */}
            {isListening && (
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#FAF6F0] dark:bg-[#25201C] border border-[#E5DAC8] dark:border-[#3D322A] text-neutral-900 dark:text-neutral-100 text-xs font-medium animate-pulse">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#BC4B20] animate-ping" />
                  Recording audio... speak your question
                </span>
                <button onClick={toggleVoiceInput} className="text-xs font-semibold text-[#BC4B20] underline cursor-pointer">
                  Finish
                </button>
              </div>
            )}

            {/* Modern Trendy Floating Input Pill (Perfect One-Line Vertical Centering) */}
            <div
              onClick={() => textareaRef.current?.focus()}
              className="min-h-[46px] max-h-[120px] py-1.5 flex items-center gap-1.5 bg-[#F7F4EE] dark:bg-[#201B17] border border-[#E2D9C8] dark:border-[#332A23] rounded-2xl px-2.5 focus-within:border-[#BC4B20]/70 focus-within:shadow-[0_0_0_3px_rgba(188,75,32,0.12),0_4px_16px_rgba(188,75,32,0.08)] shadow-[0_1px_3px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,0.7)] dark:shadow-[0_1px_4px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.04)] transition-all duration-200 cursor-text"
            >
              {/* Microphone Button — Leveled & Vertically Centered */}
              {speechSupported && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleVoiceInput();
                  }}
                  title={isListening ? "Stop recording" : "Voice input"}
                  className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                    isListening
                      ? "bg-[#BC4B20] text-white shadow-xs"
                      : "text-neutral-400 hover:text-[#BC4B20] dark:hover:text-[#E86A38] hover:bg-[#BC4B20]/10 dark:hover:bg-[#BC4B20]/20"
                  }`}
                >
                  <IconMic className="w-4 h-4" />
                </button>
              )}

              {/* Textarea: Leveled in Same Center Line, Zero Inner Outlines */}
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask about specs, COA, bulk pricing..."
                className="chat-input-textarea flex-1 bg-transparent border-none resize-none m-0 py-1 px-1 text-[14px] sm:text-[14.5px] text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400/90 dark:placeholder:text-neutral-500 outline-none leading-[20px] font-body cursor-text overflow-y-auto focus:outline-none focus:ring-0 focus:border-none focus-visible:outline-none focus-visible:ring-0"
                style={{ minHeight: "20px", maxHeight: "96px", outline: "none", border: "none", boxShadow: "none", lineHeight: "20px" }}
              />

              {/* Modern Action Send Button — Leveled & Vertically Centered */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  submitMessage(input);
                }}
                disabled={isSending || !input.trim()}
                aria-label="Send inquiry"
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                  isSending || !input.trim()
                    ? "opacity-30 cursor-not-allowed text-neutral-400 bg-neutral-200/50 dark:bg-neutral-800"
                    : "bg-gradient-to-r from-[#BC4B20] to-[#CF562A] text-white shadow-[0_2px_8px_rgba(188,75,32,0.35)] hover:shadow-[0_4px_12px_rgba(188,75,32,0.45)] hover:scale-105 active:scale-95"
                }`}
              >
                <IconSend className="w-4 h-4" />
              </button>
            </div>

            {/* Micro-footer */}
            <div className="flex justify-between items-center px-1 text-[11px] text-neutral-400 dark:text-neutral-500 select-none font-medium">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[#FAF6F0] dark:bg-[#25201C] border border-[#E5DAC8] dark:border-[#3D322A] font-mono text-[10px]">Enter ↵</kbd> to submit</span>
              <span className="font-heading font-semibold text-neutral-500 dark:text-neutral-400">Nectar Ingredients · B2B</span>
            </div>
          </div>
        </div>
      )}

      {/* Prominent Executive Floating Launcher Button (60px x 60px) */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Close advisory chat" : "Open advisory chat"}
        style={{ width: "60px", height: "60px" }}
        className="group relative rounded-full bg-gradient-to-br from-[#C95328] via-[#BC4B20] to-[#9C3A14] text-white border-2 border-white/40 dark:border-white/20 flex items-center justify-center shadow-[0_12px_40px_rgba(188,75,32,0.5)] hover:scale-105 active:scale-95 transition-all cursor-pointer touch-manipulation shrink-0"
      >
        {isOpen ? (
          <IconClose className="w-6 h-6 transition-transform group-hover:rotate-90 duration-200" />
        ) : (
          <IconLuxuryChat className="w-7 h-7 transition-transform group-hover:scale-110 duration-200" />
        )}

        {/* Live status dot */}
        {!isOpen && (
          <span className="absolute 0 right-0 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-[#151210]" />
          </span>
        )}
      </button>
    </div>
  );
}
