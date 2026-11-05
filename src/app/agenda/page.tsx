import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function AgendaPage() {
  const event = await prisma.event.findFirst({ where: { isPublished: true } });
  const items = event
    ? await prisma.agendaItem.findMany({
        where: { eventId: event.id, isPublished: true },
        orderBy: [{ day: "asc" }, { sortOrder: "asc" }],
      })
    : [];

  const byDay = items.reduce(
    (acc, item) => {
      const d = item.day;
      if (!acc[d]) acc[d] = [];
      acc[d].push(item);
      return acc;
    },
    {} as Record<number, typeof items>
  );

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

      <main className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-xs tracking-[0.3em] uppercase text-[#c9a227] mb-4">Programme</p>
        <h1 className="font-display text-4xl md:text-5xl mb-4">Seven-Day Agenda</h1>
        <p className="text-[#666] mb-16">
          Runway showcases, exhibitions, and styling competitions across the week.
        </p>

        {Object.keys(byDay).length === 0 && (
          <p className="text-[#666]">Agenda will be published soon.</p>
        )}

        {Object.entries(byDay).map(([day, dayItems]) => (
          <section key={day} className="mb-16">
            <h2 className="font-display text-2xl mb-6 border-b border-[#e8e6e1] pb-3">
              Day {day}
              {dayItems[0] && (
                <span className="text-base font-sans font-normal text-[#666] ml-3">
                  {formatDate(dayItems[0].date)}
                </span>
              )}
            </h2>
            <div className="space-y-6">
              {dayItems.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                  <div className="sm:w-36 shrink-0 text-[#c9a227] text-sm tracking-wider">
                    {item.startTime} – {item.endTime}
                  </div>
                  <div>
                    <h3 className="font-display text-lg">{item.title}</h3>
                    <p className="text-sm text-[#666] mt-1">
                      {[item.stageArea, item.activityType, item.designerBrand]
                        .filter(Boolean)
                        .join(" · ")}
                    </p>
                    {item.description && (
                      <p className="text-sm text-[#555] mt-2 leading-relaxed">{item.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  );
}
