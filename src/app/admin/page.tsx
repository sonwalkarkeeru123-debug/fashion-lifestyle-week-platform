import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/admin/login");
  }

  const [
    totalRegs,
    confirmed,
    pending,
    cancelled,
    checkIns,
    ticketBreakdown,
    speakers,
    sponsors,
    exhibitors,
  ] = await Promise.all([
    prisma.registration.count(),
    prisma.registration.count({ where: { status: "CONFIRMED" } }),
    prisma.registration.count({ where: { status: "PENDING" } }),
    prisma.registration.count({ where: { status: "CANCELLED" } }),
    prisma.checkIn.count(),
    prisma.ticketType.findMany({
      select: { name: true, soldCount: true, capacity: true },
    }),
    prisma.speaker.count(),
    prisma.sponsor.count(),
    prisma.exhibitor.count(),
  ]);

  const stats = [
    { label: "Total Registrations", value: totalRegs },
    { label: "Confirmed", value: confirmed },
    { label: "Pending", value: pending },
    { label: "Checked In", value: checkIns },
    { label: "Speakers / Designers", value: speakers },
    { label: "Sponsors", value: sponsors },
    { label: "Exhibitors", value: exhibitors },
    { label: "Cancelled", value: cancelled },
  ];

  return (
    <div className="min-h-screen bg-[#f5f4f1]">
      <header className="bg-[#1a1a1a] text-white">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-display text-lg tracking-wide">Admin · Fashion Week</span>
          <div className="flex items-center gap-6 text-sm">
            <span className="text-white/60">{session.user.email}</span>
            <Link href="/api/auth/signout" className="text-[#c9a227] hover:underline">
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl mb-2">Dashboard</h1>
        <p className="text-[#666] mb-10">Live statistics from the database</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {stats.map((s) => (
            <div key={s.label} className="bg-white border border-[#e8e6e1] p-6">
              <p className="text-xs tracking-widest uppercase text-[#999] mb-2">{s.label}</p>
              <p className="text-3xl font-light">{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white border border-[#e8e6e1] p-6">
            <h2 className="font-display text-xl mb-4">Ticket Categories</h2>
            <ul className="space-y-3">
              {ticketBreakdown.map((t) => (
                <li key={t.name} className="flex justify-between text-sm">
                  <span>{t.name}</span>
                  <span className="text-[#666]">
                    {t.soldCount}
                    {t.capacity ? ` / ${t.capacity}` : ""}
                  </span>
                </li>
              ))}
              {ticketBreakdown.length === 0 && (
                <li className="text-sm text-[#999]">No ticket types yet</li>
              )}
            </ul>
          </div>

          <div className="bg-white border border-[#e8e6e1] p-6">
            <h2 className="font-display text-xl mb-4">Quick Links</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                { href: "/admin/event", label: "Event Configuration" },
                { href: "/admin/registrations", label: "Registrations" },
                { href: "/admin/checkin", label: "QR Check-in" },
                { href: "/admin/speakers", label: "Speakers / Designers" },
                { href: "/admin/sponsors", label: "Sponsors" },
                { href: "/admin/exhibitors", label: "Exhibitors" },
                { href: "/admin/agenda", label: "Agenda Builder" },
                { href: "/admin/emails", label: "Email Campaigns" },
                { href: "/admin/spocs", label: "SPOC Management" },
                { href: "/admin/users", label: "Users & Roles" },
              ].map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="border border-[#e8e6e1] px-4 py-3 hover:border-[#1a1a1a] transition-colors"
                >
                  {l.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        <p className="text-xs text-[#999]">
          Full CRUD modules for each section are available via the navigation. Role-based
          permissions control access to sensitive actions.
        </p>
      </div>
    </div>
  );
}
