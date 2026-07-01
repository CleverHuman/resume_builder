"use client";

import { authenticate, Role } from "@/lib/auth";
import { useState } from "react";

interface Props {
  onLogin: (role: Role) => void;
}

export default function LoginView({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const role = authenticate(username.trim(), password);
    if (role) {
      setError("");
      onLogin(role);
    } else {
      setError("Invalid username or password");
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-[#1e1e2e]">
      <form
        onSubmit={handleSubmit}
        className="w-[320px] rounded-lg border border-[#3f3f5c] bg-[#13131f] p-6"
      >
        <h1 className="mb-4 text-[16px] font-bold text-[#e2e8f0]">Sign in</h1>

        <label className="mb-1 block text-[12px] text-[#94a3b8]">Username</label>
        <input
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoFocus
          className="mb-3 w-full rounded border border-[#3f3f5c] bg-[#1a1a2e] px-3 py-2 text-[13px] text-[#e2e8f0] outline-none focus:border-[#7c3aed]"
        />

        <label className="mb-1 block text-[12px] text-[#94a3b8]">Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded border border-[#3f3f5c] bg-[#1a1a2e] px-3 py-2 text-[13px] text-[#e2e8f0] outline-none focus:border-[#7c3aed]"
        />

        {error && <p className="mb-3 text-[12px] text-[#ef4444]">{error}</p>}

        <button
          type="submit"
          className="w-full rounded bg-[#7c3aed] py-[10px] text-[13px] font-bold text-white hover:bg-[#6d28d9] cursor-pointer"
        >
          Sign in
        </button>
      </form>
    </div>
  );
}
