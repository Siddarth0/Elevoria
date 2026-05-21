"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import {
  Bot,
  CalendarClock,
  FileText,
  ListChecks,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import {
  useGenerateSubtasks,
  useSuggestDeadline,
  useSummarizeDocument,
} from "@/hooks/use-ai-tools";

type Tool = "summarize" | "subtasks" | "deadline";

type Message = {
  id: string;
  role: "user" | "assistant";
  tool: Tool;
  text: string;
  pending?: boolean;
};

const TOOLS: {
  id: Tool;
  label: string;
  icon: typeof FileText;
  color: string;
  placeholder: string;
  starters: string[];
}[] = [
  {
    id: "summarize",
    label: "Summarize",
    icon: FileText,
    color: "var(--accent-3)",
    placeholder: "Paste planning notes, meeting context, or a long brief...",
    starters: [
      "Summarize this week's standup notes",
      "Boil down a long product brief",
    ],
  },
  {
    id: "subtasks",
    label: "Subtasks",
    icon: ListChecks,
    color: "var(--accent)",
    placeholder: "Describe a task — I'll break it into a checklist...",
    starters: [
      "Break down 'Ship onboarding v2'",
      "Subtasks for migrating to Postgres",
    ],
  },
  {
    id: "deadline",
    label: "Deadline",
    icon: CalendarClock,
    color: "var(--accent-2)",
    placeholder: "Describe a task — I'll suggest a realistic deadline...",
    starters: [
      "When should 'Redesign settings page' ship?",
      "Estimate a deadline for an API rewrite",
    ],
  },
];

const TOOL_LABEL: Record<Tool, string> = {
  summarize: "Summary",
  subtasks: "Subtasks",
  deadline: "Deadline",
};

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

export default function AiAssistant() {
  const pathname = usePathname();
  const workspaceId = useMemo(() => {
    const match = pathname?.match(/\/workspace\/([^/]+)/);
    return match?.[1] ?? null;
  }, [pathname]);

  const [open, setOpen] = useState(false);
  const [tool, setTool] = useState<Tool>("subtasks");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const summarize = useSummarizeDocument();
  const subtasks = useGenerateSubtasks();
  const deadline = useSuggestDeadline();

  const activeTool = TOOLS.find((t) => t.id === tool)!;
  const isPending =
    summarize.isPending || subtasks.isPending || deadline.isPending;

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, open]);

  useEffect(() => {
    if (open) {
      // small delay so the focus ring lands after the open transition starts
      const t = setTimeout(() => inputRef.current?.focus(), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!workspaceId) return null;

  const send = async (override?: string) => {
    const text = (override ?? input).trim();
    if (!text || isPending) return;

    const userMsg: Message = {
      id: newId(),
      role: "user",
      tool,
      text,
    };
    const pendingMsg: Message = {
      id: newId(),
      role: "assistant",
      tool,
      text: "",
      pending: true,
    };

    setMessages((m) => [...m, userMsg, pendingMsg]);
    setInput("");

    try {
      let result = "";
      if (tool === "summarize") {
        result = await summarize.mutateAsync({ content: text, workspaceId });
      } else if (tool === "subtasks") {
        result = await subtasks.mutateAsync({
          description: text,
          workspaceId,
        });
      } else {
        result = await deadline.mutateAsync({
          description: text,
          workspaceId,
        });
      }

      setMessages((m) =>
        m.map((msg) =>
          msg.id === pendingMsg.id
            ? { ...msg, text: result, pending: false }
            : msg,
        ),
      );
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setMessages((m) =>
        m.map((msg) =>
          msg.id === pendingMsg.id
            ? {
                ...msg,
                text:
                  err.response?.data?.message ||
                  "Hmm — I couldn't process that. Try again.",
                pending: false,
              }
            : msg,
        ),
      );
    }
  };

  return (
    <>
      {/* Floating Orb */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`ai-fab ${open ? "ai-fab--hidden" : ""}`}
        aria-label="Open workspace assistant"
        aria-expanded={open}
      >
        <span className="ai-fab__halo" aria-hidden />
        <span className="ai-fab__ring" aria-hidden />
        <Sparkles className="ai-fab__icon" />
      </button>

      {/* Panel */}
      <div
        className={`ai-panel ${open ? "ai-panel--open" : ""}`}
        role="dialog"
        aria-label="Workspace AI assistant"
        aria-hidden={!open}
      >
        <div className="ai-panel__head">
          <div className="ai-panel__brand">
            <span className="ai-panel__brand-dot" aria-hidden />
            <div>
              <p className="ai-panel__eyebrow">Atelier · AI</p>
              <h3 className="ai-panel__title">
                Workspace <em>assistant</em>
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="ai-panel__close"
            aria-label="Minimise assistant"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="ai-panel__tools">
          {TOOLS.map((t) => {
            const Icon = t.icon;
            const active = tool === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTool(t.id)}
                className={`ai-tool ${active ? "ai-tool--active" : ""}`}
                style={
                  active
                    ? ({ ["--tool-color" as string]: t.color } as React.CSSProperties)
                    : undefined
                }
              >
                <Icon className="h-3.5 w-3.5" />
                {t.label}
              </button>
            );
          })}
        </div>

        <div ref={scrollRef} className="ai-panel__thread">
          {messages.length === 0 ? (
            <div className="ai-empty">
              <span className="ai-empty__rings" aria-hidden />
              <h4 className="ai-empty__title">
                Three tools, <em>one quiet chat.</em>
              </h4>
              <p className="ai-empty__body">
                Pick a tool above, drop in some context, and I&apos;ll respond
                inline. Everything stays scoped to this workspace.
              </p>
              <div className="ai-empty__chips">
                {activeTool.starters.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => {
                      setInput(s);
                      inputRef.current?.focus();
                    }}
                    className="ai-empty__chip"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="ai-thread">
              {messages.map((m) => (
                <li key={m.id} className={`ai-bubble ai-bubble--${m.role}`}>
                  {m.role === "assistant" && (
                    <div className="ai-bubble__avatar" aria-hidden>
                      <Bot className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className="ai-bubble__content">
                    {m.role === "assistant" && !m.pending && (
                      <span className="ai-bubble__tag">{TOOL_LABEL[m.tool]}</span>
                    )}
                    {m.pending ? (
                      <div className="ai-typing" aria-label="Thinking">
                        <span />
                        <span />
                        <span />
                      </div>
                    ) : (
                      <p>{m.text}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="ai-panel__input">
          <span className="ai-panel__hint">
            <kbd>↵</kbd> send · <kbd>⇧↵</kbd> newline
          </span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={activeTool.placeholder}
            rows={2}
            className="ai-input"
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => send()}
            disabled={!input.trim() || isPending}
            className="ai-send"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
