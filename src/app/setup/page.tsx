"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function SetupPage() {
  const [status, setStatus] = useState<"loading" | "ready" | "done" | "error">("loading");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("admin@fashionweek.local");
  const [password, setPassword] = useState("Admin@12345");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((data) => {
        if (data.initialized) {
          setStatus("done");
          setMessage("Database already initialized.");
        } else {
          setStatus("ready");
        }
      })
      .catch((e) => {
        setStatus("error");
        setMessage(e.message || "Cannot reach database. Check DATABASE_URL.");
      });
  }, []);

  async function runSetup() {
    setLoading(true);
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name: "Super Admin" }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus("done");
        setMessage(data.message);
      } else {
        setMessage(data.error || "Setup failed");
        setStatus("error");
      }
    } catch {
      setMessage("Network error");
      setStatus("error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-6">
      <div className="max-w-md w-full bg-white border border-[#e8e6e1] p-10">
        <h1 className="font-display text-2xl mb-2">Platform Setup</h1>
        <p className="text-sm text-[#666] mb-8">
          One-time database initialization. No terminal required.
        </p>

        {status === "loading" && <p className="text-sm">Checking database…</p>}

        {status === "error" && (
          <div className="text-sm text-red-700 bg-red-50 p-4 mb-6 border border-red-100">
            {message}
            <p className="mt-2 text-xs">
              Ensure DATABASE_URL is set in Vercel environment variables and the Neon database is
              reachable.
            </p>
          </div>
        )}

        {status === "done" && (
          <div className="text-sm text-green-800 bg-green-50 p-4 mb-6 border border-green-100">
            {message || "Setup complete."}
            <div className="mt-4">
              <Link
                href="/admin/login"
                className="inline-block bg-[#1a1a1a] text-white px-6 py-2 text-xs tracking-widest uppercase"
              >
                Go to Admin Login
              </Link>
            </div>
          </div>
        )}

        {status === "ready" && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#999] mb-2">
                Admin Email
              </label>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-[#e8e6e1] px-4 py-3"
              />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#999] mb-2">
                Admin Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-[#e8e6e1] px-4 py-3"
              />
            </div>
            <button
              onClick={runSetup}
              disabled={loading}
              className="w-full bg-[#1a1a1a] text-white py-3 text-xs tracking-widest uppercase disabled:opacity-50"
            >
              {loading ? "Initializing…" : "Initialize Database"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
