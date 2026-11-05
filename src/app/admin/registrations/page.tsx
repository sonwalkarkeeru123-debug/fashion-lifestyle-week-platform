import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function RegistrationsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/admin/login");

  const regs = await prisma.registration.findMany({
    take: 100,
    orderBy: { createdAt: "desc" },
    include: { ticketType: true, ticket: true },
  });

  return (
    <div className="min-h-screen bg-[#f5f4f1]">
      <header className="bg-[#1a1a1a] text-white">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/admin" className="font-display text-lg">← Admin</Link>
          <span className="text-sm text-white/60">Registrations</span>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-6 py-10">
        <h1 className="font-display text-3xl mb-8">Registrations</h1>
        <div className="bg-white border border-[#e8e6e1] overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-[#e8e6e1] text-left text-xs tracking-widest uppercase text-[#999]">
              <tr>
                <th className="p-4">ID</th>
                <th className="p-4">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Ticket</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {regs.map((r) => (
                <tr key={r.id} className="border-b border-[#f0eeea]">
                  <td className="p-4 font-mono text-xs">{r.registrationId}</td>
                  <td className="p-4">{r.fullName}</td>
                  <td className="p-4">{r.email}</td>
                  <td className="p-4">{r.ticketType.name}</td>
                  <td className="p-4">{r.status}</td>
                  <td className="p-4 text-[#666]">{formatDate(r.createdAt)}</td>
                </tr>
              ))}
              {regs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#999]">
                    No registrations yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
