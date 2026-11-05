"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface TicketType {
  id: string;
  name: string;
  description: string | null;
  price: number;
  formConfig: any;
}

function RegisterForm() {
  const searchParams = useSearchParams();
  const preselected = searchParams.get("ticket");

  const [ticketTypes, setTicketTypes] = useState<TicketType[]>([]);
  const [selected, setSelected] = useState<string>(preselected || "");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    organization: "",
    city: "",
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/tickets")
      .then((r) => r.json())
      .then((data) => {
        if (data.ticketTypes) {
          setTicketTypes(data.ticketTypes);
          if (!selected && data.ticketTypes[0]) {
            setSelected(data.ticketTypes[0].id);
          }
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticketTypeId: selected, ...form }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Registration failed");
      else setResult(data);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (result?.success) {
    return (
      <div className="min-h-screen bg-[#faf9f7] flex items-center justify-center px-6">
        <div className="max-w-md w-full border border-[#e8e6e1] bg-white p-10 text-center">
          <p className="text-xs tracking-[0.3em] uppercase text-[#c9a227] mb-4">Confirmed</p>
          <h1 className="font-display text-3xl mb-4">You're In</h1>
          <p className="text-[#666] mb-6">
            Registration ID: <strong>{result.registrationId}</strong><br />
            Ticket: <strong>{result.ticketNumber}</strong>
          </p>
          <p className="text-sm text-[#666] mb-8">{result.message}</p>
          <Link href={result.ticketUrl} className="inline-block bg-[#1a1a1a] text-white px-8 py-3 text-xs tracking-widest uppercase hover:bg-[#c9a227] hover:text-[#1a1a1a] transition-colors">
            View Ticket & QR
          </Link>
          <div className="mt-6">
            <Link href="/" className="text-sm text-[#666] hover:text-[#c9a227]">← Back to home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="border-b border-[#e8e6e1] bg-white">
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-lg">Fashion Week</Link>
          <Link href="/" className="text-sm text-[#666] hover:text-[#1a1a1a]">Cancel</Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="font-display text-4xl mb-2">Registration</h1>
        <p className="text-[#666] mb-12">Select your pass and complete the form.</p>

        {error && (
          <div className="mb-8 p-4 border border-red-200 bg-red-50 text-red-800 text-sm">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div>
            <label className="block text-xs tracking-widest uppercase text-[#999] mb-3">Ticket Category</label>
            <div className="space-y-3">
              {ticketTypes.map((t) => (
                <label
                  key={t.id}
                  className={`flex items-start gap-4 border p-4 cursor-pointer transition-colors ${
                    selected === t.id ? "border-[#1a1a1a] bg-white" : "border-[#e8e6e1] hover:border-[#ccc]"
                  }`}
                >
                  <input type="radio" name="ticket" value={t.id} checked={selected === t.id} onChange={() => setSelected(t.id)} className="mt-1" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{t.name}</span>
                      <span>{Number(t.price) === 0 ? "Free" : `₹${Number(t.price).toLocaleString("en-IN")}`}</span>
                    </div>
                    {t.description && <p className="text-sm text-[#666] mt-1">{t.description}</p>}
                  </div>
                </label>
              ))}
              {ticketTypes.length === 0 && <p className="text-sm text-[#666]">Loading ticket options…</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#999] mb-2">Full Name *</label>
              <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full border border-[#e8e6e1] px-4 py-3 bg-white focus:outline-none focus:border-[#1a1a1a]" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#999] mb-2">Email *</label>
              <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border border-[#e8e6e1] px-4 py-3 bg-white focus:outline-none focus:border-[#1a1a1a]" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#999] mb-2">Mobile</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border border-[#e8e6e1] px-4 py-3 bg-white focus:outline-none focus:border-[#1a1a1a]" />
            </div>
            <div>
              <label className="block text-xs tracking-widest uppercase text-[#999] mb-2">City</label>
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full border border-[#e8e6e1] px-4 py-3 bg-white focus:outline-none focus:border-[#1a1a1a]" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs tracking-widest uppercase text-[#999] mb-2">Organization / Institute</label>
              <input value={form.organization} onChange={(e) => setForm({ ...form, organization: e.target.value })} className="w-full border border-[#e8e6e1] px-4 py-3 bg-white focus:outline-none focus:border-[#1a1a1a]" />
            </div>
          </div>

          <button type="submit" disabled={loading || !selected} className="w-full md:w-auto bg-[#1a1a1a] text-white px-12 py-4 text-xs tracking-widest uppercase hover:bg-[#c9a227] hover:text-[#1a1a1a] transition-colors disabled:opacity-50">
            {loading ? "Processing…" : "Complete Registration"}
          </button>
        </form>
      </main>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#faf9f7] flex items-center justify-center">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
