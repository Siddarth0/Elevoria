"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Hash } from "lucide-react";
import {
  acceptWorkspaceInvite,
  getInviteDetails,
  InviteDetails,
} from "@/services/workspace.service";
import { useAuthStore } from "@/store/auth.store";
import Logo from "@/components/logo";

function InviteInner() {
  const token = useSearchParams().get("token");
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setError("This invite link is missing its token.");
      setLoading(false);
      return;
    }
    getInviteDetails(token)
      .then(setInvite)
      .catch((e) => {
        const err = e as { response?: { data?: { message?: string } } };
        setError(err.response?.data?.message || "Invite not found.");
      })
      .finally(() => setLoading(false));
  }, [token]);

  const accept = async () => {
    if (!token) return;
    setAccepting(true);
    setError("");
    try {
      const { workspaceId } = await acceptWorkspaceInvite(token);
      router.push(`/workspace/${workspaceId}`);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Could not accept invite.");
      setAccepting(false);
    }
  };

  const redirect = `/invite?token=${token ?? ""}`;
  const wrongEmail =
    !!user && !!invite && user.email.toLowerCase() !== invite.email.toLowerCase();

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "var(--canvas)" }}
    >
      <div className="w-full max-w-[26rem] glass-panel rounded-2xl p-8 anim-fade-up">
        <Logo href="/" size="sm" className="mb-7" />

        {loading && (
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            Loading invite...
          </p>
        )}

        {!loading && error && !invite && (
          <p className="text-sm" style={{ color: "#ff9aaa" }}>
            {error}
          </p>
        )}

        {invite && (
          <>
            <div className="mb-5 flex items-center gap-3">
              <span
                className="flex h-11 w-11 items-center justify-center rounded-xl"
                style={{ background: "var(--amber-mid)" }}
              >
                <Hash className="h-5 w-5" style={{ color: "var(--amber)" }} />
              </span>
              <div>
                <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                  Workspace invite
                </p>
                <h2 className="text-xl font-extrabold" style={{ color: "var(--text)" }}>
                  {invite.workspaceName}
                </h2>
              </div>
            </div>

            <p className="mb-6 text-sm" style={{ color: "var(--text-2)" }}>
              You were invited as <strong>{invite.role}</strong> using{" "}
              <strong>{invite.email}</strong>.
            </p>

            {invite.status !== "PENDING" || invite.expired ? (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "rgba(255,93,115,0.1)",
                  border: "1px solid rgba(255,93,115,0.28)",
                  color: "#ff9aaa",
                }}
              >
                {invite.status === "ACCEPTED"
                  ? "This invite has already been accepted."
                  : "This invite has expired. Ask an admin to resend it."}
              </div>
            ) : !user ? (
              <div className="space-y-3">
                <p className="text-sm" style={{ color: "var(--text-3)" }}>
                  Sign in or create an account with{" "}
                  <strong>{invite.email}</strong> to accept.
                </p>
                <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="btn-primary w-full justify-center">
                  Sign in to accept
                </Link>
                <Link href={`/register?redirect=${encodeURIComponent(redirect)}`} className="btn-ghost w-full justify-center">
                  Create an account
                </Link>
              </div>
            ) : wrongEmail ? (
              <div
                className="rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "rgba(255,93,115,0.1)",
                  border: "1px solid rgba(255,93,115,0.28)",
                  color: "#ff9aaa",
                }}
              >
                You&apos;re signed in as {user.email}, but this invite was sent to{" "}
                {invite.email}. Sign in with the invited email to accept.
              </div>
            ) : (
              <>
                {error && (
                  <p className="mb-3 text-sm" style={{ color: "#ff9aaa" }}>
                    {error}
                  </p>
                )}
                <button
                  onClick={accept}
                  disabled={accepting}
                  className="btn-primary w-full justify-center"
                >
                  {accepting ? "Joining..." : "Accept invite"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense>
      <InviteInner />
    </Suspense>
  );
}
