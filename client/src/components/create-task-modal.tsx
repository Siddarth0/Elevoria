"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useCreateTask } from "@/hooks/use-create-task";
import { useGenerateSubtasks, useSuggestDeadline } from "@/hooks/use-ai-tools";
import type {
  DeadlineResult,
  SubtasksResult,
} from "@/services/ai.service";
import { updateTaskStatus } from "@/services/task.service";
import { Bot, CalendarClock, ListChecks, Plus, X } from "lucide-react";
import { TaskPriority, TaskStatus } from "@/types/task";
import { WorkspaceMember } from "@/types/workspace";
import { useQueryClient } from "@tanstack/react-query";

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: "LOW", label: "Low", color: "#4D9170" },
  { value: "MEDIUM", label: "Medium", color: "#C49A4A" },
  { value: "HIGH", label: "High", color: "#C66B4E" },
  { value: "URGENT", label: "Urgent", color: "#C6524A" },
];

export default function CreateTaskModal({
  boardId,
  workspaceId,
  defaultStatus,
  members,
}: {
  boardId: string;
  workspaceId: string;
  defaultStatus: TaskStatus;
  members: WorkspaceMember[];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");
  const [aiSubtasks, setAiSubtasks] = useState<SubtasksResult | null>(null);
  const [aiDeadline, setAiDeadline] = useState<DeadlineResult | null>(null);

  const mutation = useCreateTask(boardId);
  const subtasksMutation = useGenerateSubtasks();
  const deadlineMutation = useSuggestDeadline();
  const queryClient = useQueryClient();

  const [error, setError] = useState("");

  const aiDescription = [title, description].filter(Boolean).join("\n\n");

  const generateAiSubtasks = async () => {
    if (!aiDescription.trim()) return;
    setError("");
    try {
      const result = await subtasksMutation.mutateAsync({
        description: aiDescription.trim(),
        workspaceId,
      });
      setAiSubtasks(result);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Could not draft subtasks.");
    }
  };

  const generateAiDeadline = async () => {
    if (!aiDescription.trim()) return;
    setError("");
    try {
      const result = await deadlineMutation.mutateAsync({
        description: aiDescription.trim(),
        workspaceId,
      });
      setAiDeadline(result);
      const iso = result.items[0]?.suggestedDate;
      if (iso && /^\d{4}-\d{2}-\d{2}$/.test(iso)) setDueDate(iso);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Could not suggest a deadline.");
    }
  };

  const create = async () => {
    if (!title.trim()) return;
    setError("");
    try {
      const createdTask = await mutation.mutateAsync({
        title: title.trim(),
        description: description || undefined,
        priority,
        dueDate: dueDate || undefined,
        boardId,
        assigneeId: assigneeId || undefined,
      });
      if (defaultStatus !== "TODO") {
        await updateTaskStatus({ taskId: createdTask.id, status: defaultStatus });
        queryClient.invalidateQueries({ queryKey: ["tasks", boardId] });
      }
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
      setAssigneeId("");
      setAiSubtasks(null);
      setAiDeadline(null);
      setOpen(false);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Failed to create task.");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-xl text-xs transition-all duration-150 mt-2"
          style={{ color: "var(--text-3)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,242,215,0.04)";
            (e.currentTarget as HTMLElement).style.color = "var(--text-2)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
            (e.currentTarget as HTMLElement).style.color = "var(--text-3)";
          }}
        >
          <Plus className="w-3.5 h-3.5" />
          Add task
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40 anim-fade-in"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,30rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 anim-scale-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-md)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title
              style={{
                fontSize: "1.375rem",
                fontWeight: 800,
                color: "var(--text)",
              }}
            >
              New Task
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ color: "var(--text-3)" }}
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

          <div className="space-y-3.5">
            {error && (
              <p
                className="text-sm px-3 py-2.5 rounded-xl"
                style={{
                  background: "rgba(184,79,64,0.1)",
                  border: "1px solid rgba(184,79,64,0.25)",
                  color: "#E07060",
                }}
              >
                {error}
              </p>
            )}
            <div>
              <label
                className="block text-xs font-medium mb-1.5 tracking-widest uppercase"
                style={{ color: "var(--text-3)" }}
              >
                Title
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="field"
                autoFocus
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium mb-1.5 tracking-widest uppercase"
                style={{ color: "var(--text-3)" }}
              >
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more context... (optional)"
                rows={3}
                className="field resize-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <button
                type="button"
                onClick={generateAiSubtasks}
                disabled={subtasksMutation.isPending || !aiDescription.trim()}
                className="btn-ghost"
              >
                <ListChecks className="h-4 w-4" />
                {subtasksMutation.isPending ? "Thinking..." : "Draft subtasks"}
              </button>
              <button
                type="button"
                onClick={generateAiDeadline}
                disabled={deadlineMutation.isPending || !aiDescription.trim()}
                className="btn-ghost"
              >
                <CalendarClock className="h-4 w-4" />
                {deadlineMutation.isPending ? "Estimating..." : "Suggest deadline"}
              </button>
            </div>

            {(aiSubtasks || aiDeadline) && (
              <div className="rounded-xl p-3" style={{ background: "rgba(233,229,215,0.035)", border: "1px solid var(--border)" }}>
                <div className="mb-2 flex items-center gap-2">
                  <Bot className="h-4 w-4" style={{ color: "var(--accent)" }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                    AI suggestions
                  </p>
                </div>
                {aiSubtasks && aiSubtasks.items[0] && (
                  <div className="mb-3">
                    <p className="mb-1 text-xs font-bold" style={{ color: "var(--text)" }}>Subtasks</p>
                    {aiSubtasks.unavailable ? (
                      <p className="text-sm" style={{ color: "var(--text-2)" }}>{aiSubtasks.items[0]?.subtasks[0] ?? "Unavailable."}</p>
                    ) : (
                      <ol className="ml-4 list-decimal space-y-1 text-sm leading-6" style={{ color: "var(--text-2)" }}>
                        {aiSubtasks.items[0].subtasks.map((s, i) => (
                          <li key={i}>{s}</li>
                        ))}
                      </ol>
                    )}
                  </div>
                )}
                {aiDeadline && aiDeadline.items[0] && (
                  <div>
                    <p className="mb-1 text-xs font-bold" style={{ color: "var(--text)" }}>Deadline</p>
                    <div className="flex items-start gap-2">
                      <span
                        className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold"
                        style={{ background: "var(--accent-dim)", color: "var(--accent)" }}
                      >
                        <CalendarClock className="h-3 w-3" />
                        {aiDeadline.items[0].suggestedDate}
                      </span>
                      {aiDeadline.items[0].reason && (
                        <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                          {aiDeadline.items[0].reason}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-xs font-medium mb-1.5 tracking-widest uppercase"
                  style={{ color: "var(--text-3)" }}
                >
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="field select"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="block text-xs font-medium mb-1.5 tracking-widest uppercase"
                  style={{ color: "var(--text-3)" }}
                >
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="field"
                />
              </div>
            </div>

            {members.length > 0 && (
              <div>
                <label
                  className="block text-xs font-medium mb-1.5 tracking-widest uppercase"
                  style={{ color: "var(--text-3)" }}
                >
                  Assign To
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="field select"
                >
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={create}
              disabled={mutation.isPending || !title.trim()}
              className="btn-primary w-full mt-1"
            >
              {mutation.isPending ? "Creating..." : "Create Task"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
