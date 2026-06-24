"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import Logo from "@/components/logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email: email.trim() });
      setSent(true);
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
          Reset your password
        </h2>
        <p className="mb-7 text-sm" style={{ color: "var(--text-2)" }}>
          Enter your email and we&apos;ll send you a reset link.
        </p>

        {sent ? (
          <div
            className="rounded-xl px-4 py-3 text-sm"
            style={{
              background: "rgba(77,145,112,0.12)",
              border: "1px solid rgba(77,145,112,0.25)",
              color: "#9AD8B8",
            }}
          >
            If an account exists for that email, a reset link is on its way.
          </div>
        ) : (
          <>
            <label className="label">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="you@example.com"
              className="field"
            />
            <button
              onClick={submit}
              disabled={loading || !email.trim()}
              className="btn-primary mt-5 w-full"
            >
              {loading ? "Sending..." : <>Send reset link<ArrowRight className="h-4 w-4" /></>}
            </button>
          </>
        )}

        <p className="mt-6 text-center text-sm" style={{ color: "var(--text-3)" }}>
          Remembered it?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--accent)" }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
