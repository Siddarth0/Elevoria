"use client";

import { GoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/**
 * Renders Google's sign-in button. Exchanges the returned ID token with the
 * backend (`/auth/google`), stores the session, and redirects. Renders nothing
 * when no Google client id is configured.
 */
export default function GoogleSignIn({
  onError,
}: {
  onError?: (message: string) => void;
}) {
  const setUser = useAuthStore((s) => s.setUser);
  const setAccessToken = useAuthStore((s) => s.setAccessToken);
  const router = useRouter();

  if (!clientId) return null;

  const handleCredential = async (credential?: string) => {
    if (!credential) {
      onError?.("Google sign-in was cancelled.");
      return;
    }
    try {
      const res = await api.post("/auth/google", { credential });
      setUser(res.data.data.user);
      setAccessToken(res.data.data.accessToken);
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      router.push(redirect || "/dashboard");
    } catch (e) {
      const err = e as { response?: { data?: { message?: string } } };
      onError?.(err.response?.data?.message || "Google sign-in failed.");
    }
  };

  return (
    <div>
      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1" style={{ background: "var(--border)" }} />
        <span className="text-xs font-medium" style={{ color: "var(--text-3)" }}>
          or
        </span>
        <span className="h-px flex-1" style={{ background: "var(--border)" }} />
      </div>

      <div className="flex justify-center">
        <GoogleLogin
          onSuccess={(res) => handleCredential(res.credential)}
          onError={() => onError?.("Google sign-in failed.")}
          theme="filled_black"
          shape="pill"
          text="continue_with"
          width="320"
        />
      </div>
    </div>
  );
}
