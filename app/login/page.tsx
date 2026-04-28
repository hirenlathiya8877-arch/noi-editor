"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye } from "lucide-react";
import { CustomCursor } from "@/components/site/custom-cursor";

type LoginResponse = {
  ok: boolean;
  role?: "admin" | "client";
  clientId?: string;
  username?: string;
  clientName?: string;
  error?: string;
};

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"client" | "admin">("client");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);
  const [showAdminHint, setShowAdminHint] = useState(false);

  const handleSecretClick = () => {
    const next = secretClicks + 1;
    setSecretClicks(next);
    if (next >= 7) {
      setTab("admin");
      setShowAdminHint(true);
      setSecretClicks(0);
    }
  };

  const submit = async () => {
    setError("");
    if (!username || !password) {
      setError("Please enter username and password.");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, tab })
      });
      const data: LoginResponse = await response.json();
      if (!response.ok || !data.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      if (data.role === "admin") {
        localStorage.setItem("noi_role", "admin");
        localStorage.setItem("noi_user", username);
        router.push("/admin");
        return;
      }

      localStorage.setItem("noi_role", "client");
      localStorage.setItem("noi_user", data.username || username);
      localStorage.setItem("noi_client_name", data.clientName || "");
      if (data.clientId) {
        localStorage.setItem("noi_client_id", data.clientId);
      }
      router.push("/client");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-[#080808] px-4">
      <CustomCursor />
      <div
        className="pointer-events-none fixed inset-0"
        style={{ background: "radial-gradient(ellipse 60% 40% at 50% 50%,rgba(255,107,26,0.06) 0%,transparent 70%)" }}
      />
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          {/* 7 baar click karo title pe — admin mode unlock hoga */}
          <button
            onClick={handleSecretClick}
            className="font-bebas text-3xl tracking-widest text-white cursor-default select-none"
            style={{ background: "none", border: "none" }}
          >
            NOI <span style={{ color: "#FF6B1A" }}>EDITORS</span>
          </button>
          <p className="mt-2 text-sm text-gray-600">Welcome back. Please login.</p>
          {showAdminHint && (
            <p className="mt-1 text-xs" style={{ color: "rgba(255,107,26,0.5)" }}>
              — admin mode —
            </p>
          )}
        </div>

        <div className="rounded-2xl border p-8" style={{ background: "#111", borderColor: "#1f1f1f", boxShadow: "0 0 60px rgba(255,107,26,0.2)" }}>
          
          {/* Sirf admin mode mein tab dikhega */}
          {tab === "admin" && (
            <div className="mb-8 flex rounded-xl p-1" style={{ background: "#161616" }}>
              <button
                onClick={() => { setTab("client"); setShowAdminHint(false); }}
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all"
                style={{ background: "transparent", color: "#888" }}
              >
                Client
              </button>
              <button
                className="flex-1 rounded-lg py-2.5 text-sm font-semibold transition-all"
                style={{ background: "#FF6B1A", color: "#000" }}
              >
                Admin
              </button>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-gray-500">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border px-4 py-3 text-sm text-white placeholder-gray-700"
                style={{ background: "#161616", borderColor: "#2a2a2a" }}
                placeholder="Enter username"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs uppercase tracking-wider text-gray-500">Password</label>
              <div className="relative">
                <input
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                  type={showPwd ? "text" : "password"}
                  className="w-full rounded-xl border px-4 py-3 pr-12 text-sm text-white placeholder-gray-700"
                  style={{ background: "#161616", borderColor: "#2a2a2a" }}
                  placeholder="Enter password"
                />
                <button
                  onClick={() => setShowPwd((c) => !c)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
            {error && (
              <div className="rounded-lg border px-4 py-2 text-xs" style={{ background: "rgba(255,100,100,0.1)", color: "#ff6b6b", borderColor: "rgba(255,100,100,0.2)" }}>
                {error}
              </div>
            )}
            <button
              onClick={submit}
              disabled={loading}
              className="w-full rounded-xl py-3.5 text-sm font-bold text-black transition-all hover:opacity-90 disabled:opacity-70"
              style={{ background: "#FF6B1A" }}
            >
              {loading ? "Logging in..." : "Login →"}
            </button>
          </div>
          <div className="mt-6 border-t pt-6 text-center text-xs text-gray-500" style={{ borderColor: "#1f1f1f" }}>
            {tab === "admin"
              ? "Admin login — for NOI EDITORS team only"
              : "Client login — use your credentials provided by NOI EDITORS"}
          </div>
        </div>
      </div>
    </main>
  );
}