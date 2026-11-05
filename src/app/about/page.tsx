export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AboutPage() {
  let event = null;
  try {
    event = await prisma.event.findFirst({ where: { isPublished: true } });
  } catch {
    // DB not ready during build or missing env — render static fallbacks
  }

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="border-b border-[#e8e6e1] bg-white/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-lg">
            {event?.name?.split(" ").slice(0, 2).join(" ") || "Fashion Week"}
          </Link>
          <Link href="/register" className="text-xs tracking-widest uppercase bg-[#1a1a1a] text-white px-4 py-2">
            Register
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-xs tracking-[0.3em] uppercase text-[#c9a227] mb-4">About</p>
        <h1 className="font-display text-4xl md:text-5xl mb-8">
          {event?.name || "Fashion & Lifestyle Week"}
        </h1>
        <div className="prose prose-neutral max-w-none text-[#444] leading-relaxed space-y-6">
          <p>{event?.description || "A premier celebration of fashion, design, and lifestyle."}</p>
          <p>
            This week-long platform brings together fashion designers, styling professionals,
            lifestyle brands, retailers, students, and enthusiasts for runway showcases, curated
            exhibitions, live styling competitions, and meaningful industry networking.
          </p>
          <p>
            From emerging talent to established labels, the programme highlights creative
            excellence across apparel, accessories, beauty, and contemporary lifestyle.
          </p>
        </div>

        <div className="mt-16 grid sm:grid-cols-2 gap-8 text-sm">
          <div>
            <p className="text-xs tracking-widest uppercase text-[#999] mb-2">Organizer</p>
            <p>{event?.organizerName || "Event Organizer"}</p>
            <p className="text-[#666]">{event?.organizerEmail}</p>
          </div>
          <div>
            <p className="text-xs tracking-widest uppercase text-[#999] mb-2">Venue</p>
            <p>{event?.venueName || "TBA"}</p>
            <p className="text-[#666]">{event?.venueAddress}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
