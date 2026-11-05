import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
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
      checkIns: {
        orderBy: { checkedInAt: "desc" },
        take: 1,
        include: { checkedInBy: { select: { name: true } } },
      },
    },
  });

  if (!ticket) {
    return NextResponse.json({ valid: false, status: "INVALID" }, { status: 404 });
  }

  const reg = ticket.registration;
  const spocAssignment = await prisma.spocAssignment.findFirst({
    where: { ticketTypeId: reg.ticketTypeId },
    include: { spoc: true },
  });

  return NextResponse.json({
    valid: ticket.status === "VALID",
    status: ticket.status,
    ticketNumber: ticket.ticketNumber,
    registrationId: reg.registrationId,
    fullName: reg.fullName,
    email: reg.email,
    ticketType: reg.ticketType.name,
    eventName: reg.event.name,
    venue: reg.event.venueName,
    dates: {
      start: reg.event.startDate,
      end: reg.event.endDate,
    },
    checkedIn: ticket.checkIns.length > 0,
    lastCheckIn: ticket.checkIns[0] || null,
    spoc: spocAssignment?.spoc
      ? {
          name: spocAssignment.spoc.name,
          email: spocAssignment.spoc.email,
          phone: spocAssignment.spoc.phone,
          whatsapp: spocAssignment.spoc.whatsapp,
          designation: spocAssignment.spoc.designation,
        }
      : null,
    qrCodeDataUrl: ticket.qrCodeDataUrl,
  });
}
