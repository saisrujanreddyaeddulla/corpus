"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Loader2 } from "lucide-react";

type Citation = { index: number; documentName: string; pageNumber: number | null; snippet: string };
type Message = { role: "user" | "assistant"; content: string; citations?: Citation[] };

function renderLineWithCitations(
  text: string,
  citations: Citation[] | undefined,
  onCite: (c: Citation) => void,
  keyPrefix: string
) {
  if (!citations || citations.length === 0) return text;
  const parts = text.split(/(\[\d+\])/g);
  return parts.map((part, i) => {
    const match = part.match(/^\[(\d+)\]$/);
    if (!match) return <span key={`${keyPrefix}-${i}`}>{part}</span>;
    const citation = citations.find((c) => c.index === Number(match[1]));
    if (!citation) return <span key={`${keyPrefix}-${i}`}>{part}</span>;
    return (
      <button key={`${keyPrefix}-${i}`} className="citation-chip" onClick={() => onCite(citation)}>
        {match[1]}
      </button>
    );
  });
}

function renderMessageContent(
  text: string,
  citations: Citation[] | undefined,
  onCite: (c: Citation) => void
) {
  const lines = text.split("\n").filter((line) => line.trim() !== "");
  return lines.map((line, idx) => {
    const trimmed = line.trim();
    const isBullet = trimmed.startsWith("- ") || trimmed.startsWith("* ");
    const content = isBullet ? trimmed.slice(2) : trimmed;
    const marginClass = idx === lines.length - 1 ? "" : "mb-2";
    return (
      <div key={idx} className={`${isBullet ? "flex gap-2" : ""} ${marginClass}`}>
        {isBullet && <span className="text-gold-light flex-shrink-0">•</span>}
        <span>{renderLineWithCitations(content, citations, onCite, String(idx))}</span>
      </div>
    );
  });
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const conversationId = useRef<string | undefined>(undefined);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const question = input.trim();
    if (!question || loading) return;
    setInput("");
    setError(null);
    setMessages((m) => [...m, { role: "user", content: question }]);
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question, conversationId: conversationId.current }),
    });

    if (!res.ok || !res.body) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    conversationId.current = res.headers.get("X-Conversation-Id") ?? conversationId.current;
    const citations: Citation[] = JSON.parse(decodeURIComponent(res.headers.get("X-Citations") ?? "[]"));

    setMessages((m) => [...m, { role: "assistant", content: "", citations }]);

    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      setMessages((m) => {
        const updated = [...m];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          content: updated[updated.length - 1].content + chunk,
        };
        return updated;
      });
    }
    setLoading(false);
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-8 py-8 space-y-6">
        {messages.length === 0 && (
          <p className="text-paper-faint text-sm">Ask a question about any document you've uploaded.</p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={msg.role === "user" ? "text-right" : ""}>
            <div
              className={`inline-block max-w-xl text-left rounded-lg px-4 py-3 text-sm leading-relaxed ${
                msg.role === "user" ? "bg-teal/15 text-paper" : "bg-ink-card text-paper"
              }`}
            >
              {msg.role === "assistant"
                ? renderMessageContent(msg.content, msg.citations, setActiveCitation)
                : msg.content}
              {msg.role === "assistant" && loading && i === messages.length - 1 && (
                <Loader2 size={12} className="inline-block animate-spin ml-2 text-paper-faint" />
              )}
            </div>
          </div>
        ))}
        {error && <p className="text-sm" style={{ color: "#C1502E" }}>{error}</p>}
        <div ref={bottomRef} />
      </div>

      {activeCitation && (
        <div className="mx-8 mb-4 border border-gold/30 bg-gold/5 rounded-lg p-4 relative">
          <button
            onClick={() => setActiveCitation(null)}
            className="absolute top-2 right-3 text-paper-faint hover:text-paper text-xs"
          >
            close
          </button>
          <p className="font-mono text-xs text-gold-light mb-1">
            {activeCitation.documentName}
            {activeCitation.pageNumber ? `, page ${activeCitation.pageNumber}` : ""}
          </p>
          <p className="text-paper-dim text-sm">{activeCitation.snippet}…</p>
        </div>
      )}

      <div className="border-t border-white/10 p-4 flex items-center gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a question about your documents…"
          className="flex-1 bg-ink-card border border-white/10 rounded-md px-4 py-2.5 text-sm text-paper outline-none focus:border-gold/50"
        />
        <button
          onClick={handleSend}
          disabled={loading || !input.trim()}
          className="bg-gold text-ink rounded-md p-2.5 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110 transition-all"
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}