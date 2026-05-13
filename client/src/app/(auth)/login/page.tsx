"use client";

import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useState } from "react";

export default function LoginPage() {
  const setUser = useAuthStore((s) => s.setUser);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    const res = await api.post("/auth/login", {
      email,
      password,
    });

    setUser(res.data.data.user);
    useAuthStore.getState().setAccessToken(res.data.data.accessToken)
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-96 space-y-4 border p-6 rounded-xl">
        <h1 className="text-xl font-bold">Login</h1>

        <input
          className="border p-2 w-full"
          placeholder="email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          className="border p-2 w-full"
          placeholder="password"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={login}
          className="bg-black text-white w-full p-2 rounded"
        >
          Login
        </button>
      </div>
    </div>
  );
}
