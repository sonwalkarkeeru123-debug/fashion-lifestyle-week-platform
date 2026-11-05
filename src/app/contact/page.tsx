export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ContactPage() {
  let event = null;
  try {
    event = await prisma.event.findFirst({ where: { isPublished: true } });
  } catch {}

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="border-b border-[#e8e6e1] bg-white sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-lg">Fashion Week</Link>
          <Link href="/register" className="text-xs tracking-widest uppercase bg-[#1a1a1a] text-white px-4 py-2">Register</Link>
        </div>
      </header>
      <main className="max-w-xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl mb-8">Contact</h1>
        <div className="space-y-6 text-[#444]">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#999] mb-1">Organizer</p>
            <p>{event?.organizerName || "Event Organizer"}</p>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-[#999] mb-1">Email</p>
            <a href={`mailto:${event?.organizerEmail || "hello@example.com"}`} className="text-[#c9a227] hover:underline">
              {event?.organizerEmail || "hello@example.com"}
            </a>
          </div>
          {event?.organizerPhone && (
            <div>
              <p className="text-xs tracking-widest uppercase text-[#999] mb-1">Phone</p>
              <p>{event.organizerPhone}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
