import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function ExhibitorsPage() {
  const event = await prisma.event.findFirst({ where: { isPublished: true } });
  const exhibitors = event
    ? await prisma.exhibitor.findMany({
        where: { eventId: event.id, isPublished: true },
        orderBy: { brandName: "asc" },
      })
    : [];

  return (
    <div className="min-h-screen bg-[#faf9f7]">
      <header className="border-b border-[#e8e6e1] bg-white sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-display text-lg">Fashion Week</Link>
          <Link href="/register" className="text-xs tracking-widest uppercase bg-[#1a1a1a] text-white px-4 py-2">Register</Link>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-20">
        <h1 className="font-display text-4xl mb-12">Exhibitors & Brands</h1>
        {exhibitors.length === 0 ? (
          <p className="text-[#666]">Exhibitor list will be published closer to the event.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {exhibitors.map((e) => (
              <div key={e.id} className="border border-[#e8e6e1] p-6">
                <h2 className="font-display text-xl mb-2">{e.brandName}</h2>
                {e.category && <p className="text-xs tracking-widest uppercase text-[#c9a227] mb-2">{e.category}</p>}
                {e.description && <p className="text-sm text-[#666]">{e.description}</p>}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
