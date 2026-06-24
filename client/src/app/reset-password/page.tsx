"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import Logo from "@/components/logo";

function ResetPasswordInner() {
  const token = useSearchParams().get("token");
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (!token) {
      setError("This reset link is missing its token.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords don't match.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await api.post("/auth/reset-password", { token, password });
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "var(--canvas)" }}
    >
      <div className="w-full max-w-[24rem] glass-panel rounded-2xl p-8 anim-fade-up">
        <Logo href="/" size="sm" className="mb-7" />

        <h2 className="mb-1 text-2xl font-extrabold" style={{ color: "var(--text)" }}>
          Set a new password
        </h2>
        <p className="mb-7 text-sm" style={{ color: "var(--text-2)" }}>
          Choose a strong password for your account.
        </p>

        {done ? (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: "rgba(77,145,112,0.12)",
              border: "1px solid rgba(77,145,112,0.25)",
              color: "#9AD8B8",
            }}
          >
            Password updated. Redirecting to sign in...
          </div>
        ) : (
          <>
            {error && (
              <div
                className="mb-4 rounded-xl px-4 py-3 text-sm"
                style={{
                  background: "rgba(255,93,115,0.1)",
                  border: "1px solid rgba(255,93,115,0.28)",
                  color: "#ff9aaa",
                }}
              >
                {error}
              </div>
            )}

            <label className="label">New password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="field"
            />

            <label className="label mt-3">Confirm password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="Re-enter password"
              className="field"
            />

            <button
              onClick={submit}
              disabled={loading}
              className="btn-primary mt-5 w-full"
            >
              {loading ? "Updating..." : <>Update password<ArrowRight className="h-4 w-4" /></>}
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm" style={{ color: "var(--text-3)" }}>
          <Link href="/login" className="font-semibold" style={{ color: "var(--accent)" }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordInner />
    </Suspense>
  );
}
