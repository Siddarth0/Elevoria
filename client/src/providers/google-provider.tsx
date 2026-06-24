"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

/**
 * Wraps the app in Google's OAuth context only when a client id is configured,
 * so the app still runs locally without Google credentials set.
 */
export default function GoogleProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!clientId) return <>{children}</>;

  return <GoogleOAuthProvider clientId={clientId}>{children}</GoogleOAuthProvider>;
}
