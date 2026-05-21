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
import type {
  DeadlineResult,
  SubtasksResult,
  SummarizeResult,
} from "@/services/ai.service";

type Tool = "summarize" | "subtasks" | "deadline";

type AssistantPayload =
  | { kind: "summary"; data: SummarizeResult }
  | { kind: "subtasks"; data: SubtasksResult }
  | { kind: "deadline"; data: DeadlineResult }
  | { kind: "error"; message: string };

type Message = {
  id: string;
  role: "user" | "assistant";
  tool: Tool;
  text?: string;
  payload?: AssistantPayload;
  pending?: boolean;
};

const TOOLS: {
  id: Tool;
  label: string;
  icon: typeof FileText;
  color: string;
  placeholder: string;
}[] = [
  {
    id: "summarize",
    label: "Summarize",
    icon: FileText,
    color: "var(--accent-3)",
    placeholder: "Add a focus (optional) — e.g. 'what's blocking us this week?'",
  },
  {
    id: "subtasks",
    label: "Subtasks",
    icon: ListChecks,
    color: "var(--accent)",
    placeholder: "Add a focus (optional) — or just hit send to use the current scope.",
  },
  {
    id: "deadline",
    label: "Deadline",
    icon: CalendarClock,
    color: "var(--accent-2)",
    placeholder: "Add a focus (optional) — or just hit send to use the current scope.",
  },
];

const TOOL_LABEL: Record<Tool, string> = {
  summarize: "Summary",
  subtasks: "Subtasks",
  deadline: "Deadlines",
};

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00");
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function scopeBadge(scope: string, boardId: string | null) {
  if (scope === "task") return "On this task";
  if (scope === "board") return "On this board";
  if (scope === "workspace") return "Across the workspace";
  if (scope === "text") return "On your input";
  return boardId ? "On this board" : "Across the workspace";
}

export default function AiAssistant() {
  const pathname = usePathname();

  const { workspaceId, boardId } = useMemo(() => {
    const wsMatch = pathname?.match(/\/workspace\/([^/]+)/);
    const boardMatch = pathname?.match(/\/board\/([^/]+)/);
    return {
      workspaceId: wsMatch?.[1] ?? null,
      boardId: boardMatch?.[1] ?? null,
    };
  }, [pathname]);

  const [open, setOpen] = useState(false);
  const [tool, setTool] = useState<Tool>("summarize");
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
      const t = setTimeout(() => inputRef.current?.focus(), 220);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!workspaceId) return null;

  const scopeLabel = boardId ? "this board" : "this workspace";

  const send = async () => {
    if (isPending) return;
    const refinement = input.trim();

    const userText =
      refinement ||
      (tool === "summarize"
        ? `Summarize ${scopeLabel}`
        : tool === "subtasks"
          ? `Draft subtasks across ${scopeLabel}`
          : `Suggest deadlines across ${scopeLabel}`);

    const userMsg: Message = {
      id: newId(),
      role: "user",
      tool,
      text: userText,
    };
    const pendingMsg: Message = {
      id: newId(),
      role: "assistant",
      tool,
      pending: true,
    };

    setMessages((m) => [...m, userMsg, pendingMsg]);
    setInput("");

    const scope = { workspaceId, boardId: boardId ?? undefined };

    try {
      let payload: AssistantPayload;
      if (tool === "summarize") {
        const data = await summarize.mutateAsync({
          ...scope,
          content: refinement || undefined,
        });
        payload = { kind: "summary", data };
      } else if (tool === "subtasks") {
        const data = await subtasks.mutateAsync({
          ...scope,
          description: refinement || undefined,
        });
        payload = { kind: "subtasks", data };
      } else {
        const data = await deadline.mutateAsync({
          ...scope,
          description: refinement || undefined,
        });
        payload = { kind: "deadline", data };
      }

      setMessages((m) =>
        m.map((msg) =>
          msg.id === pendingMsg.id ? { ...msg, payload, pending: false } : msg,
        ),
      );
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setMessages((m) =>
        m.map((msg) =>
          msg.id === pendingMsg.id
            ? {
                ...msg,
                payload: {
                  kind: "error",
                  message:
                    err.response?.data?.message ||
                    "Hmm — I couldn't process that. Try again.",
                },
                pending: false,
              }
            : msg,
        ),
      );
    }
  };

  return (
    <>
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
              <p className="ai-panel__eyebrow">
                Atelier · {boardId ? "Board" : "Workspace"}
              </p>
              <h3 className="ai-panel__title">
                Working on <em>{boardId ? "this board" : "this workspace"}</em>
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
            <EmptyState
              boardId={boardId}
              tool={tool}
              onRun={() => send()}
            />
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
                    {m.role === "user" ? (
                      <p>{m.text}</p>
                    ) : m.pending ? (
                      <div className="ai-typing" aria-label="Thinking">
                        <span />
                        <span />
                        <span />
                      </div>
                    ) : (
                      <AssistantContent
                        tool={m.tool}
                        payload={m.payload}
                        boardId={boardId}
                      />
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
            disabled={isPending}
            className="ai-send"
            aria-label="Send message"
            title={
              input.trim()
                ? "Send"
                : `Run ${tool} on ${boardId ? "this board" : "this workspace"}`
            }
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}

/* ------------ subcomponents ------------ */

function EmptyState({
  boardId,
  tool,
  onRun,
}: {
  boardId: string | null;
  tool: Tool;
  onRun: () => void;
}) {
  const scopeLabel = boardId ? "this board" : "this workspace";
  const verb =
    tool === "summarize"
      ? "summarize"
      : tool === "subtasks"
        ? "draft subtasks for"
        : "suggest deadlines for";

  return (
    <div className="ai-empty">
      <span className="ai-empty__rings" aria-hidden />
      <h4 className="ai-empty__title">
        Grounded in <em>{scopeLabel}.</em>
      </h4>
      <p className="ai-empty__body">
        I&apos;ll read what&apos;s actually in {scopeLabel} — boards, tasks, status, comments —
        and only answer what fits. Add a focus below if you have one, or just run.
      </p>
      <button
        type="button"
        onClick={onRun}
        className="ai-empty__chip"
      >
        Try: {verb} {scopeLabel}
      </button>
    </div>
  );
}

function AssistantContent({
  tool,
  payload,
  boardId,
}: {
  tool: Tool;
  payload: AssistantPayload | undefined;
  boardId: string | null;
}) {
  if (!payload) {
    return <p style={{ color: "var(--text-3)" }}>No response.</p>;
  }

  if (payload.kind === "error") {
    return (
      <>
        <span className="ai-bubble__tag" style={{ color: "#F0A09A" }}>
          Error
        </span>
        <p>{payload.message}</p>
      </>
    );
  }

  if (payload.data.unavailable) {
    return (
      <>
        <span className="ai-bubble__tag">{TOOL_LABEL[tool]}</span>
        <p style={{ color: "var(--text-2)" }}>
          AI quota reached or provider unavailable. Try again in a moment.
        </p>
      </>
    );
  }

  if (payload.kind === "summary") {
    const d = payload.data;
    return (
      <>
        <span className="ai-bubble__tag">
          {TOOL_LABEL[tool]} · {scopeBadge(d.scope, boardId)}
        </span>
        <p style={{ fontWeight: 500 }}>{d.title}</p>
        {d.summary && (
          <p style={{ marginTop: "0.35rem", color: "var(--text-2)" }}>{d.summary}</p>
        )}
        {d.highlights.length > 0 && (
          <ul className="ai-result-list">
            {d.highlights.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        )}
      </>
    );
  }

  if (payload.kind === "subtasks") {
    const d = payload.data;
    if (d.items.length === 0) {
      return (
        <>
          <span className="ai-bubble__tag">{TOOL_LABEL[tool]}</span>
          <p style={{ color: "var(--text-2)" }}>
            Nothing to break down here yet — add an open task or describe one in the input.
          </p>
        </>
      );
    }
    return (
      <>
        <span className="ai-bubble__tag">
          {TOOL_LABEL[tool]} · {scopeBadge(d.scope, boardId)}
        </span>
        <div className="ai-result-groups">
          {d.items.map((it, i) => (
            <div key={i} className="ai-result-group">
              <p className="ai-result-group__title">{it.taskTitle}</p>
              <ol className="ai-result-numbered">
                {it.subtasks.map((s, j) => (
                  <li key={j}>{s}</li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </>
    );
  }

  // deadline
  const d = payload.data;
  if (d.items.length === 0) {
    return (
      <>
        <span className="ai-bubble__tag">{TOOL_LABEL[tool]}</span>
        <p style={{ color: "var(--text-2)" }}>
          Everything in scope already has a date — nothing to estimate.
        </p>
      </>
    );
  }
  return (
    <>
      <span className="ai-bubble__tag">
        {TOOL_LABEL[tool]} · {scopeBadge(d.scope, boardId)}
      </span>
      <div className="ai-deadline-list">
        {d.items.map((it, i) => (
          <div key={i} className="ai-deadline-row">
            <div className="ai-deadline-row__title">{it.taskTitle}</div>
            <div className="ai-deadline-row__date">
              <CalendarClock className="h-3 w-3" />
              {formatDate(it.suggestedDate)}
            </div>
            {it.reason && (
              <div className="ai-deadline-row__reason">{it.reason}</div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
