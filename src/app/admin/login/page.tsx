"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid email or password");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <p className="text-[#c9a227] text-xs tracking-[0.3em] uppercase mb-2">
            Administration
          </p>
          <h1 className="font-display text-3xl text-white">Sign In</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 space-y-6">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 border border-red-100">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs tracking-widest uppercase text-[#999] mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#e8e6e1] px-4 py-3 focus:outline-none focus:border-[#1a1a1a]"
              placeholder="admin@fashionweek.local"
            />
          </div>

          <div>
            <label className="block text-xs tracking-widest uppercase text-[#999] mb-2">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#e8e6e1] px-4 py-3 focus:outline-none focus:border-[#1a1a1a]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a1a] text-white py-3 text-xs tracking-widest uppercase hover:bg-[#c9a227] hover:text-[#1a1a1a] transition-colors disabled:opacity-50"
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-white/40 text-xs mt-8">
          <Link href="/" className="hover:text-white">
            ← Back to public site
          </Link>
        </p>
      </div>
    </div>
  );
}
