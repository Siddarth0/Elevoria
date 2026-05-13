"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuthStore } from "@/store/auth.store";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);

  const setAccessToken = useAuthStore(
    (s) => s.setAccessToken,
  );

  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
          },
        );

        setAccessToken(res.data.data.accessToken);
      } catch {
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, [setAccessToken]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return children;
}