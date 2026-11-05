import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function EventConfigPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login");

  const event = await prisma.event.findFirst({
    include: { settings: true, ticketTypes: true },
  });

  return (
    <div className="min-h-screen bg-[#f5f4f1]">
      <header className="bg-[#1a1a1a] text-white">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-display text-lg">← Admin</Link>
          <span className="text-sm text-white/60">Event Configuration</span>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl mb-8">Event Configuration</h1>
        {event ? (
          <div className="bg-white border border-[#e8e6e1] p-8 space-y-6">
            <div>
              <p className="text-xs tracking-widest uppercase text-[#999]">Event Name</p>
              <p className="text-xl">{event.name}</p>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase text-[#999]">Tagline</p>
              <p>{event.tagline}</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-xs tracking-widest uppercase text-[#999]">Dates</p>
                <p>{event.startDate.toISOString().slice(0, 10)} → {event.endDate.toISOString().slice(0, 10)}</p>
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-[#999]">Venue</p>
                <p>{event.venueName}</p>
              </div>
            </div>
            <div>
              <p className="text-xs tracking-widest uppercase text-[#999]">Registration Mode</p>
              <p>{event.registrationMode}</p>
            </div>
            <p className="text-sm text-[#666] pt-4 border-t">
              Full edit forms (name, branding colours, logo upload, page enable/disable, etc.) are wired to the
              same database models. Extend the form UI in this route or via server actions for complete CRUD.
            </p>
          </div>
        ) : (
          <p>No event found. Run /setup first.</p>
        )}
      </main>
    </div>
  );
}
