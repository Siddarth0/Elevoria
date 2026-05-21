"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Task, TaskPriority, TaskStatus } from "@/types/task";
import { useUpdateTaskStatus } from "@/hooks/use-update-task-status";
import { useAddComment } from "@/hooks/use-add-comment";
import { X, Calendar, User, Flag, MessageSquare, Send } from "lucide-react";

const STATUS_OPTIONS: { value: TaskStatus; label: string; color: string }[] = [
  { value: "TODO",        label: "To Do",       color: "#6B6B80" },
  { value: "IN_PROGRESS", label: "In Progress",  color: "#7A70F0" },
  { value: "REVIEW",      label: "In Review",    color: "#F5A623" },
  { value: "COMPLETED",   label: "Completed",    color: "#22D1A8" },
];

const PRIORITY: Record<TaskPriority, { label: string; color: string; bg: string }> = {
  LOW:    { label: "Low",    color: "#22D1A8", bg: "rgba(34,209,168,0.14)"  },
  MEDIUM: { label: "Medium", color: "#F5A623", bg: "rgba(245,166,35,0.14)"  },
  HIGH:   { label: "High",   color: "#FF5252", bg: "rgba(255,82,82,0.14)"   },
  URGENT: { label: "Urgent", color: "#FF2D55", bg: "rgba(255,45,85,0.14)"   },
};

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export default function TaskDetailModal({
  task,
  boardId,
  open,
  onClose,
}: {
  task: Task;
  boardId: string;
  open: boolean;
  onClose: () => void;
}) {
  const [commentText, setCommentText] = useState("");

  const statusMutation = useUpdateTaskStatus(boardId);
  const commentMutation = useAddComment(boardId);

  const handleStatusChange = (status: TaskStatus) =>
    statusMutation.mutate({ taskId: task.id, status });

  const handleAddComment = async () => {
    if (!commentText.trim()) return;
    await commentMutation.mutateAsync({ taskId: task.id, content: commentText.trim() });
    setCommentText("");
  };

  const priority = PRIORITY[task.priority];

  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40 anim-fade-in"
          style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
        />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 w-[min(94vw,38rem)] max-h-[85vh] -translate-x-1/2 -translate-y-1/2 rounded-2xl flex flex-col anim-scale-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-md)",
            boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-start gap-4 p-6"
            style={{ borderBottom: "1px solid var(--border)" }}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span
                  className="text-[11px] font-semibold px-2.5 py-1 rounded-lg"
                  style={{ background: priority.bg, color: priority.color }}
                >
                  {priority.label}
                </span>
              </div>
              <Dialog.Title
                className="font-bold text-lg leading-snug"
                style={{ color: "var(--text)" }}
              >
                {task.title}
              </Dialog.Title>
              {task.description && (
                <p
                  className="text-sm mt-2 leading-relaxed"
                  style={{ color: "var(--text-2)" }}
                >
                  {task.description}
                </p>
              )}
            </div>
            <Dialog.Close asChild>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                style={{ background: "var(--elevated)", color: "var(--text-3)" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--text)")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLElement).style.color = "var(--text-3)")
                }
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Status */}
            <div>
              <p
                className="text-[10px] font-semibold tracking-widest uppercase mb-3"
                style={{ color: "var(--text-3)" }}
              >
                Status
              </p>
              <div className="flex gap-2 flex-wrap">
                {STATUS_OPTIONS.map((s) => {
                  const active = task.status === s.value;
                  return (
                    <button
                      key={s.value}
                      onClick={() => handleStatusChange(s.value)}
                      disabled={statusMutation.isPending}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150"
                      style={{
                        background: active ? `${s.color}1A` : "var(--elevated)",
                        border: `1px solid ${active ? s.color + "55" : "var(--border)"}`,
                        color: active ? s.color : "var(--text-3)",
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
                      {s.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5" style={{ color: "var(--text-3)" }}>
                  <User className="w-3 h-3" /> Assignee
                </p>
                <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                  {task.assignee ? task.assignee.fullName : "Unassigned"}
                </p>
              </div>

              {task.dueDate && (
                <div>
                  <p className="text-[10px] font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5" style={{ color: "var(--text-3)" }}>
                    <Calendar className="w-3 h-3" /> Due
                  </p>
                  <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                    {new Date(task.dueDate).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                  </p>
                </div>
              )}

              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5" style={{ color: "var(--text-3)" }}>
                  <Flag className="w-3 h-3" /> Priority
                </p>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg"
                  style={{ background: priority.bg, color: priority.color }}
                >
                  {priority.label}
                </span>
              </div>

              <div>
                <p className="text-[10px] font-semibold tracking-widest uppercase mb-2 flex items-center gap-1.5" style={{ color: "var(--text-3)" }}>
                  <User className="w-3 h-3" /> Creator
                </p>
                <p className="text-sm font-medium" style={{ color: "var(--text-2)" }}>
                  {task.creator.fullName}
                </p>
              </div>
            </div>

            {/* Comments */}
            <div>
              <p
                className="text-[10px] font-semibold tracking-widest uppercase mb-4 flex items-center gap-1.5"
                style={{ color: "var(--text-3)" }}
              >
                <MessageSquare className="w-3 h-3" />
                Comments ({task.comments.length})
              </p>

              <div className="space-y-4">
                {task.comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ background: "var(--amber-mid)", color: "var(--amber)" }}
                    >
                      {initials(comment.user.fullName)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-xs font-semibold" style={{ color: "var(--text)" }}>
                          {comment.user.fullName}
                        </p>
                        <p className="text-[11px]" style={{ color: "var(--text-3)" }}>
                          {new Date(comment.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                      <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
                        {comment.content}
                      </p>
                    </div>
                  </div>
                ))}
                {task.comments.length === 0 && (
                  <p className="text-sm" style={{ color: "var(--text-3)" }}>No comments yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Comment input */}
          <div className="flex gap-2 p-4" style={{ borderTop: "1px solid var(--border)" }}>
            <input
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddComment()}
              placeholder="Add a comment..."
              className="field flex-1"
              style={{ padding: "0.5rem 0.875rem", fontSize: "0.8125rem" }}
            />
            <button
              onClick={handleAddComment}
              disabled={commentMutation.isPending || !commentText.trim()}
              className="btn-primary px-3.5"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
