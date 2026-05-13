"use client";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const setUser = useAuthStore((s) => s.setUser);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const router = useRouter();

  const register = async () => {
    if (!fullName.trim() || !email.trim() || !password) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/register", {
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      setUser(res.data.data.user);
      setAccessToken(res.data.data.accessToken);
      router.push("/dashboard");
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: "var(--canvas)" }}>
      {/* Art panel */}
      <div className="auth-art hidden lg:flex lg:w-[46%] flex-col justify-between p-12 shrink-0">
        <div className="flex items-center gap-2.5 relative z-10">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
            style={{ background: "var(--amber)", color: "#fff" }}
          >
            E
          </div>
          <span className="font-bold" style={{ color: "var(--text)" }}>
            Elevoria
          </span>
        </div>

        <div className="relative z-10">
          <h1
            className="font-extrabold leading-tight mb-4"
            style={{
              fontSize: "clamp(2.2rem, 5vw, 3.5rem)",
              color: "var(--text)",
              letterSpacing: "-0.02em",
            }}
          >
            Ship faster<br />
            with your<br />
            <span style={{ color: "var(--amber)" }}>team.</span>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
            Create an account and start organizing<br />
            work the way it was meant to be done.
          </p>
        </div>

        <p
          className="relative z-10 text-[11px] font-semibold tracking-widest uppercase"
          style={{ color: "var(--text-3)" }}
        >
          AI Productivity Platform
        </p>
      </div>

      {/* Form panel */}
      <div
        className="flex-1 flex items-center justify-center p-8"
        style={{ borderLeft: "1px solid var(--border)", background: "var(--surface)" }}
      >
        <div className="w-full max-w-90 anim-fade-up">
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ background: "var(--amber)", color: "#fff" }}
            >
              E
            </div>
            <span className="font-bold" style={{ color: "var(--text)" }}>
              Elevoria
            </span>
          </div>

          <h2
            className="font-extrabold mb-1"
            style={{ fontSize: "1.75rem", color: "var(--text)", letterSpacing: "-0.02em" }}
          >
            Create an account
          </h2>
          <p className="text-sm mb-8" style={{ color: "var(--text-2)" }}>
            Join your team on Elevoria.
          </p>

          {error && (
            <div
              className="mb-5 px-4 py-3 rounded-xl text-sm font-medium"
              style={{
                background: "rgba(255,82,82,0.1)",
                border: "1px solid rgba(255,82,82,0.25)",
                color: "#FF7070",
              }}
            >
              {error}
            </div>
          )}

          <div className="space-y-3">
            {[
              { label: "Full name",  type: "text",     value: fullName,  setter: setFullName,  placeholder: "Jane Smith" },
              { label: "Email",      type: "email",    value: email,     setter: setEmail,     placeholder: "you@example.com" },
              { label: "Password",   type: "password", value: password,  setter: setPassword,  placeholder: "••••••••" },
            ].map(({ label, type, value, setter, placeholder }) => (
              <div key={label}>
                <label
                  className="block text-xs font-semibold mb-1.5 tracking-widest uppercase"
                  style={{ color: "var(--text-3)" }}
                >
                  {label}
                </label>
                <input
                  type={type}
                  value={value}
                  onChange={(e) => setter(e.target.value)}
                  placeholder={placeholder}
                  className="field"
                  onKeyDown={(e) => e.key === "Enter" && register()}
                />
              </div>
            ))}
          </div>

          <button
            onClick={register}
            disabled={loading}
            className="btn-primary w-full mt-5"
          >
            {loading ? "Creating account…" : (
              <>
                Create account
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="mt-6 text-sm text-center" style={{ color: "var(--text-3)" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold transition-colors"
              style={{ color: "var(--amber)" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
