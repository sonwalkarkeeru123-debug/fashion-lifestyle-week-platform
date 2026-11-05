export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

async function getEvent() {
  try {
    return await prisma.event.findFirst({
      where: { isPublished: true },
      include: {
        settings: true,
        ticketTypes: { where: { isActive: true }, orderBy: { sortOrder: "asc" } },
        sponsors: { where: { isPublished: true }, take: 6, orderBy: { sortOrder: "asc" } },
        agendaItems: {
          where: { isPublished: true, day: 1 },
          orderBy: { sortOrder: "asc" },
          take: 4,
        },
      },
    });
  } catch {
    return null;
  }
}

export default async function HomePage() {
  const event = await getEvent();

  const name = event?.name || "Fashion & Lifestyle Week";
  const tagline = event?.tagline || "Where Style Meets the City";
  const description =
    event?.description ||
    "A premier celebration of fashion, design, and lifestyle. Runway showcases, designer exhibitions, and styling competitions.";
  const venue = event?.venueName || "Grand Exhibition Centre";
  const start = event?.startDate ? formatDate(event.startDate) : "15 March 2026";
  const end = event?.endDate ? formatDate(event.endDate) : "21 March 2026";

  return (
    <div className="min-h-screen bg-[#faf9f7] text-[#1a1a1a]">
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#faf9f7]/90 backdrop-blur-md border-b border-[#e8e6e1]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl tracking-wide">
            {name.split(" ").slice(0, 2).join(" ")}
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide">
            <Link href="/about" className="hover:text-[#c9a227] transition-colors">About</Link>
            <Link href="/agenda" className="hover:text-[#c9a227] transition-colors">Agenda</Link>
            <Link href="/exhibitors" className="hover:text-[#c9a227] transition-colors">Exhibitors</Link>
            <Link href="/competitions" className="hover:text-[#c9a227] transition-colors">Competitions</Link>
            <Link href="/venue" className="hover:text-[#c9a227] transition-colors">Venue</Link>
            <Link href="/register" className="bg-[#1a1a1a] text-white px-5 py-2 text-xs tracking-widest uppercase hover:bg-[#c9a227] hover:text-[#1a1a1a] transition-colors">Register</Link>
          </nav>
          <Link href="/register" className="md:hidden bg-[#1a1a1a] text-white px-4 py-2 text-xs tracking-widest uppercase">Register</Link>
        </div>
      </header>

      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative">
          <p className="text-xs tracking-[0.3em] uppercase text-[#c9a227] mb-6">Seven Days of Fashion & Lifestyle</p>
          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] max-w-4xl mb-8">{name}</h1>
          <p className="text-xl md:text-2xl text-[#4a4a4a] max-w-2xl mb-4 font-light">{tagline}</p>
          <p className="text-[#666] max-w-xl mb-12 leading-relaxed">{description}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/register" className="inline-flex items-center bg-[#1a1a1a] text-white px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#c9a227] hover:text-[#1a1a1a] transition-colors">Get Your Pass</Link>
            <Link href="/agenda" className="inline-flex items-center border border-[#1a1a1a] px-8 py-4 text-sm tracking-widest uppercase hover:bg-[#1a1a1a] hover:text-white transition-colors">View Agenda</Link>
          </div>
          <div className="mt-16 flex flex-wrap gap-8 text-sm text-[#666]">
            <div>
              <span className="block text-xs tracking-widest uppercase text-[#999] mb-1">Dates</span>
              {start} – {end}
            </div>
            <div>
              <span className="block text-xs tracking-widest uppercase text-[#999] mb-1">Venue</span>
              {venue}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-[#e8e6e1]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-display text-3xl md:text-4xl mb-12">Experience Highlights</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Runway Showcases", desc: "Daily presentations from emerging and established designers across the main runway and satellite stages." },
              { title: "Designer Exhibitions", desc: "Curated stalls and lookbook installations from apparel, accessories, beauty and lifestyle brands." },
              { title: "Styling Competitions", desc: "Live challenges for stylists and students with industry judges and real-time scoring." },
            ].map((item) => (
              <div key={item.title} className="border border-[#e8e6e1] p-8 hover:border-[#c9a227] transition-colors">
                <h3 className="font-display text-xl mb-3">{item.title}</h3>
                <p className="text-[#666] text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-[#e8e6e1] py-12 bg-white">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <p className="font-display text-lg mb-2">{name}</p>
            <p className="text-sm text-[#666]">{venue}</p>
          </div>
          <div className="flex gap-8 text-sm">
            <Link href="/contact" className="hover:text-[#c9a227]">Contact</Link>
            <Link href="/privacy" className="hover:text-[#c9a227]">Privacy</Link>
            <Link href="/terms" className="hover:text-[#c9a227]">Terms</Link>
            <Link href="/admin/login" className="hover:text-[#c9a227]">Admin</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
