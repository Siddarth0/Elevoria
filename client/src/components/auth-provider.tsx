"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";
import Logo from "@/components/logo";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await axios.post(
          `${API_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );
        setAccessToken(res.data.data.accessToken);
      } catch {
        // no session
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [setAccessToken]);

  if (loading) {
    return (
      <div
        className="h-screen flex flex-col items-center justify-center gap-5"
        style={{ background: "var(--canvas)" }}
      >
        <Logo size="md" />
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: "var(--amber)",
                animation: `pulse-accent 1.2s ease-in-out ${i * 0.18}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  return children;
}
