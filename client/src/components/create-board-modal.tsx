"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { useCreateBoard } from "@/hooks/use-create-board";
import { Plus, X } from "lucide-react";

export default function CreateBoardModal({ workspaceId }: { workspaceId: string }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const mutation = useCreateBoard(workspaceId);

  const create = async () => {
    if (!name.trim()) return;
    setError("");
    try {
      await mutation.mutateAsync({ name: name.trim(), workspaceId });
      setName("");
      setOpen(false);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Failed to create board.");
    }
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button className="btn-primary">
          <Plus className="w-4 h-4" />
          New Board
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40 anim-fade-in"
          style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 w-[min(92vw,26rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 anim-scale-in"
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
              New Board
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors"
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

          <div className="space-y-4">
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
                Board Name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && create()}
                placeholder="e.g. Sprint 1, Backlog..."
                className="field"
                autoFocus
              />
            </div>

            <button
              onClick={create}
              disabled={mutation.isPending || !name.trim()}
              className="btn-primary w-full"
            >
              {mutation.isPending ? "Creating..." : "Create Board"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
