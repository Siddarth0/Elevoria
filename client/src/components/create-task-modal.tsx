"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useCreateTask } from "@/hooks/use-create-task";
import { Plus, X } from "lucide-react";
import { TaskPriority, TaskStatus } from "@/types/task";
import { WorkspaceMember } from "@/types/workspace";

const PRIORITIES: { value: TaskPriority; label: string; color: string }[] = [
  { value: "LOW",    label: "Low",    color: "#636363" },
  { value: "MEDIUM", label: "Medium", color: "#4A86C8" },
  { value: "HIGH",   label: "High",   color: "#C97B40" },
  { value: "URGENT", label: "Urgent", color: "#B84F40" },
];

export default function CreateTaskModal({
  boardId,
  defaultStatus,
  members,
}: {
  boardId: string;
  defaultStatus: TaskStatus;
  members: WorkspaceMember[];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assigneeId, setAssigneeId] = useState("");

  const mutation = useCreateTask(boardId);

  const [error, setError] = useState("");

  const create = async () => {
    if (!title.trim()) return;
    setError("");
    try {
      await mutation.mutateAsync({
        title: title.trim(),
        description: description || undefined,
        priority,
        dueDate: dueDate || undefined,
        boardId,
        assigneeId: assigneeId || undefined,
      });
      setTitle("");
      setDescription("");
      setPriority("MEDIUM");
      setDueDate("");
      setAssigneeId("");
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
          className="fixed top-1/2 left-1/2 z-50 w-120 -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 anim-scale-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-md)",
            boxShadow: "0 24px 80px rgba(0,0,0,0.6)",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title
              style={{
                fontFamily: "var(--font-instrument-serif)",
                fontSize: "1.375rem",
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
                placeholder="Add more context… (optional)"
                rows={3}
                className="field resize-none"
              />
            </div>

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
              {mutation.isPending ? "Creating…" : "Create Task"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
