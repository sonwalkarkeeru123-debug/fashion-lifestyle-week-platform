import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function VenuePage() {
  const event = await prisma.event.findFirst({ where: { isPublished: true } });

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="border-b border-[#e8e6e1] bg-white sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-lg">Fashion Week</Link>
          <Link href="/register" className="text-xs tracking-widest uppercase bg-[#1a1a1a] text-white px-4 py-2">Register</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl mb-8">Venue & Location</h1>
        <p className="text-xl mb-2">{event?.venueName || "Grand Exhibition Centre"}</p>
        <p className="text-[#666] mb-8">{event?.venueAddress}</p>
        {event?.mapsUrl && (
          <a href={event.mapsUrl} target="_blank" rel="noreferrer" className="text-[#c9a227] hover:underline text-sm">
            Open in Google Maps →
          </a>
        )}
        <div className="mt-12 text-sm text-[#666]">
          <p>Daily timings: {event?.startTime || "10:00"} – {event?.endTime || "22:00"}</p>
          <p>Timezone: {event?.timezone || "Asia/Kolkata"}</p>
        </div>
      </main>
    </div>
  );
}
