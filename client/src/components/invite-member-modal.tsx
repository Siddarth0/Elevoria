"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { MailPlus, X } from "lucide-react";
import { inviteWorkspaceMember } from "@/services/workspace.service";
import { WorkspaceRole } from "@/types/workspace";

export default function InviteMemberModal({
  workspaceId,
}: {
  workspaceId: string;
}) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<WorkspaceRole>("MEMBER");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const mutation = useMutation({ mutationFn: inviteWorkspaceMember });

  const invite = async () => {
    if (!email.trim()) return;
    setError("");
    setSuccess("");

    try {
      await mutation.mutateAsync({
        workspaceId,
        email: email.trim(),
        role,
      });
      setSuccess(`Invitation sent to ${email.trim()}.`);
      setEmail("");
      setRole("MEMBER");
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Failed to send invite.");
    }
  };

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          setError("");
          setSuccess("");
        }
      }}
    >
      <Dialog.Trigger asChild>
        <button className="btn-ghost">
          <MailPlus className="h-4 w-4" />
          Invite member
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40 anim-fade-in"
          style={{ background: "rgba(7,10,12,0.76)", backdropFilter: "blur(5px)" }}
        />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 anim-scale-in"
          style={{
            background: "var(--surface)",
            border: "1px solid var(--border-md)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="mb-5 flex items-center justify-between">
            <Dialog.Title className="text-xl font-extrabold" style={{ color: "var(--text)" }}>
              Invite member
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="icon-button">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </div>

          <div className="space-y-4">
            {error && (
              <p
                className="rounded-xl px-3 py-2.5 text-sm"
                style={{
                  background: "rgba(198,82,74,0.1)",
                  border: "1px solid rgba(198,82,74,0.25)",
                  color: "#F0A09A",
                }}
              >
                {error}
              </p>
            )}

            {success && (
              <p
                className="rounded-xl px-3 py-2.5 text-sm"
                style={{
                  background: "rgba(77,145,112,0.12)",
                  border: "1px solid rgba(77,145,112,0.25)",
                  color: "#9AD8B8",
                }}
              >
                {success}
              </p>
            )}

            <div>
              <label className="label">Member email</label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && invite()}
                placeholder="teammate@example.com"
                className="field"
                type="email"
                autoFocus
              />
            </div>

            <div>
              <label className="label">Role</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as WorkspaceRole)}
                className="field"
              >
                <option value="MEMBER">Member</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>

            <button
              onClick={invite}
              disabled={mutation.isPending || !email.trim()}
              className="btn-primary w-full"
            >
              {mutation.isPending ? "Sending..." : "Send invite"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
