"use client";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import Logo from "@/components/logo";

export default function LoginPage() {
  const setUser = useAuthStore((s) => s.setUser);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const login = async () => {
    if (!email.trim() || !password) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/login", { email: email.trim(), password });
      setUser(res.data.data.user);
      setAccessToken(res.data.data.accessToken);
      router.push("/dashboard");
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--canvas)" }}>
      <div className="auth-art hidden lg:flex lg:w-[46%] flex-col justify-between p-12 shrink-0">
        <Logo href="/" size="md" className="relative z-10" />

        <div className="relative z-10">
          <div
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-bold mb-5"
            style={{ background: "rgba(255,255,255,0.06)", color: "var(--accent)" }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI workspace command center
          </div>
          <h1
            className="font-extrabold leading-tight mb-5"
            style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)", color: "var(--text)" }}
          >
            Organize the work.<br />
            Keep the team<br />
            <span style={{ color: "var(--accent)" }}>in motion.</span>
          </h1>
          <div className="grid gap-3 text-sm" style={{ color: "var(--text-2)" }}>
            {["Plan boards with less friction", "Track tasks across every stage", "Keep decisions and comments together"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" style={{ color: "var(--accent)" }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <p
          className="relative z-10 text-[11px] font-semibold tracking-widest uppercase"
          style={{ color: "var(--text-3)" }}
        >
          AI Productivity Platform
        </p>
      </div>

      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-8"
        style={{ borderLeft: "1px solid var(--border)", background: "rgba(20,26,32,0.82)" }}
      >
        <div className="w-full max-w-[24rem] anim-fade-up glass-panel rounded-2xl p-6 sm:p-8">
          <Logo href="/" size="sm" className="mb-8 lg:hidden" />

          <h2 className="font-extrabold mb-1 text-[1.75rem]" style={{ color: "var(--text)" }}>
            Welcome back
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
            Sign in to continue to your workspace.
          </p>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background: "rgba(255,93,115,0.1)",
                border: "1px solid rgba(255,93,115,0.28)",
                color: "#ff9aaa",
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="label">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="field"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="field"
                onKeyDown={(e) => e.key === "Enter" && login()}
              />
            </div>
          </div>

          <button onClick={login} disabled={loading} className="btn-primary w-full mt-5">
            {loading ? (
              "Signing in..."
            ) : (
              <>
                Sign in
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="mt-6 text-sm text-center" style={{ color: "var(--text-3)" }}>
            No account?{" "}
            <Link href="/register" className="font-semibold transition-colors" style={{ color: "var(--accent)" }}>
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
