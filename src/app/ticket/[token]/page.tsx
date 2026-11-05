import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function TicketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { verificationToken: token },
    include: {
      registration: {
        include: {
          ticketType: true,
          event: true,
        },
      },
    },
  });

  if (!ticket) notFound();

  const reg = ticket.registration;
  const event = reg.event;

  const spocAssignment = await prisma.spocAssignment.findFirst({
    where: { ticketTypeId: reg.ticketTypeId },
    include: { spoc: true },
  });
  const spoc = spocAssignment?.spoc;

  return (
    <div className="min-h-screen bg-[#faf9f7] py-12 px-6">
      <div className="max-w-lg mx-auto">
        <div className="bg-white border border-[#e8e6e1] editorial-shadow overflow-hidden">
          <div className="bg-[#1a1a1a] text-white px-8 py-6">
            <p className="text-xs tracking-[0.3em] uppercase text-[#c9a227] mb-2">Official Ticket</p>
            <h1 className="font-display text-2xl">{event.name}</h1>
          </div>

          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <p className="text-xs tracking-widest uppercase text-[#999] mb-1">Participant</p>
                <p className="text-xl font-medium">{reg.fullName}</p>
                <p className="text-sm text-[#666]">{reg.email}</p>
              </div>
              <div className="text-right">
                <p className="text-xs tracking-widest uppercase text-[#999] mb-1">Status</p>
                <p className={`text-sm font-medium ${
                  ticket.status === "VALID" ? "text-green-700" : ticket.status === "USED" ? "text-amber-700" : "text-red-700"
                }`}>{ticket.status}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
              <div>
                <p className="text-xs tracking-widest uppercase text-[#999] mb-1">Ticket No.</p>
                <p className="font-mono">{ticket.ticketNumber}</p>
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-[#999] mb-1">Registration ID</p>
                <p className="font-mono">{reg.registrationId}</p>
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-[#999] mb-1">Category</p>
                <p>{reg.ticketType.name}</p>
              </div>
              <div>
                <p className="text-xs tracking-widest uppercase text-[#999] mb-1">Dates</p>
                <p>{formatDate(event.startDate)} – {formatDate(event.endDate)}</p>
              </div>
            </div>

            {event.venueName && (
              <div className="mb-8">
                <p className="text-xs tracking-widest uppercase text-[#999] mb-1">Venue</p>
                <p>{event.venueName}</p>
                {event.venueAddress && <p className="text-sm text-[#666]">{event.venueAddress}</p>}
              </div>
            )}

            {ticket.qrCodeDataUrl && (
              <div className="flex justify-center mb-8">
                <img src={ticket.qrCodeDataUrl} alt="Ticket QR Code" className="w-48 h-48 border border-[#e8e6e1]" />
              </div>
            )}

            {spoc && (
              <div className="border-t border-[#e8e6e1] pt-6">
                <p className="text-xs tracking-widest uppercase text-[#999] mb-3">Your Point of Contact</p>
                <p className="font-medium">{spoc.name}</p>
                {spoc.designation && <p className="text-sm text-[#666]">{spoc.designation}</p>}
                <div className="mt-2 text-sm space-y-1">
                  {spoc.email && (
                    <p><a href={`mailto:${spoc.email}`} className="text-[#c9a227] hover:underline">{spoc.email}</a></p>
                  )}
                  {spoc.phone && <p>{spoc.phone}</p>}
                  {spoc.whatsapp && (
                    <p>
                      <a href={`https://wa.me/${spoc.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="text-[#c9a227] hover:underline">WhatsApp</a>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Link href="/" className="text-sm text-[#666] hover:text-[#c9a227]">← Back to event website</Link>
        </div>
      </div>
    </div>
  );
}
