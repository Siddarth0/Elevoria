"use client";

import { useState } from "react";
import { Bot, ClipboardList } from "lucide-react";
import { useSummarizeDocument } from "@/hooks/use-ai-tools";

export default function AiWorkspacePanel({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const mutation = useSummarizeDocument();

  const summarize = async () => {
    if (!content.trim()) return;
    setError("");
    setSummary("");

    try {
      const result = await mutation.mutateAsync({
        content: content.trim(),
        workspaceId,
      });
      setSummary(result);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Could not summarize this note.");
    }
  };

  return (
    <div className="card p-5 anim-fade-up d3">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Bot className="h-4 w-4" style={{ color: "var(--accent)" }} />
            <h2 className="text-base font-extrabold" style={{ color: "var(--text)" }}>
              Project notes summary
            </h2>
          </div>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Paste planning notes, meeting text, or requirements and turn them into a short project summary.
          </p>
        </div>
        <ClipboardList className="h-5 w-5 shrink-0" style={{ color: "var(--text-3)" }} />
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        className="field min-h-28 resize-none"
        placeholder="Paste notes or project context..."
      />

      {error && (
        <p className="mt-3 rounded-xl px-3 py-2 text-sm" style={{ background: "rgba(198,82,74,0.1)", color: "#F0A09A" }}>
          {error}
        </p>
      )}

      {summary && (
        <div className="mt-4 rounded-xl p-4" style={{ background: "rgba(233,229,215,0.035)", border: "1px solid var(--border)" }}>
          <p className="mb-2 text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
            Summary
          </p>
          <p className="whitespace-pre-wrap text-sm leading-7" style={{ color: "var(--text-2)" }}>
            {summary}
          </p>
        </div>
      )}

      <button
        onClick={summarize}
        disabled={mutation.isPending || !content.trim()}
        className="btn-primary mt-4"
      >
        {mutation.isPending ? "Summarizing..." : "Summarize notes"}
      </button>
    </div>
  );
}
