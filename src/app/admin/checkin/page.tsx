"use client";

import { useState } from "react";
import Link from "next/link";

export default function CheckInPage() {
  const [token, setToken] = useState("");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleCheckIn(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: token.trim() }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ status: "ERROR", message: "Network error" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f4f1]">
      <header className="bg-[#1a1a1a] text-white">
        <div className="max-w-lg mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-display text-lg">← Admin</Link>
          <span className="text-sm text-white/60">QR Check-in</span>
        </div>
      </header>
      <main className="max-w-lg mx-auto px-6 py-12">
        <h1 className="font-display text-2xl mb-6">Ticket Check-in</h1>
        <p className="text-sm text-[#666] mb-8">
          Paste the verification token from a scanned QR code (or the full token from the ticket URL).
        </p>
        <form onSubmit={handleCheckIn} className="space-y-4">
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Verification token"
            className="w-full border border-[#e8e6e1] px-4 py-3 bg-white"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1a1a1a] text-white py-3 text-xs tracking-widest uppercase disabled:opacity-50"
          >
            {loading ? "Checking…" : "Validate & Check-in"}
          </button>
        </form>
        {result && (
          <div
            className={`mt-8 p-6 border text-sm ${
              result.status === "VALID"
                ? "border-green-300 bg-green-50 text-green-900"
                : "border-amber-300 bg-amber-50 text-amber-900"
            }`}
          >
            <p className="font-medium">{result.status}</p>
            <p>{result.message}</p>
            {result.participant && <p className="mt-2">Participant: {result.participant}</p>}
            {result.ticketNumber && <p>Ticket: {result.ticketNumber}</p>}
          </div>
        )}
      </main>
    </div>
  );
}
