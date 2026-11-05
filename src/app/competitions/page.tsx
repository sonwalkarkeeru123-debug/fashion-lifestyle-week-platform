export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function CompetitionsPage() {
  let comps: Awaited<ReturnType<typeof prisma.stylingCompetition.findMany>> = [];
  try {
    const event = await prisma.event.findFirst({ where: { isPublished: true } });
    if (event) {
      comps = await prisma.stylingCompetition.findMany({
        where: { eventId: event.id, isPublished: true },
        include: { categories: true },
      });
    }
  } catch {}

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="border-b border-[#e8e6e1] bg-white sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-lg">Fashion Week</Link>
          <Link href="/register" className="text-xs tracking-widest uppercase bg-[#1a1a1a] text-white px-4 py-2">Register</Link>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-20">
        <p className="text-xs tracking-[0.3em] uppercase text-[#c9a227] mb-4">Compete</p>
        <h1 className="font-display text-4xl mb-12">Styling Competitions</h1>
        {comps.length === 0 ? (
          <p className="text-[#666]">Competition details will be announced soon.</p>
        ) : (
          <div className="space-y-10">
            {comps.map((c) => (
              <article key={c.id} className="border-b border-[#e8e6e1] pb-10">
                <h2 className="font-display text-2xl mb-3">{c.name}</h2>
                {c.description && <p className="text-[#555] mb-4 leading-relaxed">{c.description}</p>}
                {c.rules && (
                  <div className="text-sm text-[#666] mb-2">
                    <strong>Rules:</strong> {c.rules}
                  </div>
                )}
                {c.eligibility && (
                  <div className="text-sm text-[#666]">
                    <strong>Eligibility:</strong> {c.eligibility}
                  </div>
                )}
                <p className="text-xs tracking-widest uppercase text-[#999] mt-4">Status: {c.status}</p>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
