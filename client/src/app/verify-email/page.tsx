"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { api } from "@/lib/api";
import Logo from "@/components/logo";

type Status = "loading" | "success" | "error";

function VerifyEmailInner() {
  const token = useSearchParams().get("token");
  const [status, setStatus] = useState<Status>("loading");
  const [message, setMessage] = useState("Verifying your email...");
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!token) {
      setStatus("error");
      setMessage("This verification link is missing its token.");
      return;
    }

    api
      .post("/auth/verify-email", { token })
      .then(() => {
        setStatus("success");
        setMessage("Your email is verified. You're all set.");
      })
      .catch((e) => {
        const err = e as { response?: { data?: { message?: string } } };
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed.");
      });
  }, [token]);

  return (
    <div
      className="flex min-h-screen items-center justify-center p-6"
      style={{ background: "var(--canvas)" }}
    >
      <div className="w-full max-w-[24rem] glass-panel rounded-2xl p-8 text-center anim-fade-up">
        <Logo href="/" size="sm" className="mb-6 justify-center" />

        {status === "success" && (
          <CheckCircle2 className="mx-auto mb-4 h-12 w-12" style={{ color: "var(--accent)" }} />
        )}
        {status === "error" && (
          <XCircle className="mx-auto mb-4 h-12 w-12" style={{ color: "#ff7a8a" }} />
        )}

        <p className="mb-6 text-sm" style={{ color: "var(--text-2)" }}>
          {message}
        </p>

        <Link href="/login" className="btn-primary w-full justify-center">
          Continue to sign in
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}
