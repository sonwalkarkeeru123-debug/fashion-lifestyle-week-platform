import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions, hasPermission } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const permissions = (session.user as any).permissions || [];
  if (!hasPermission(permissions, ["checkin:perform", "tickets:manage", "registrations:manage"])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { token, notes } = await req.json();
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const ticket = await prisma.ticket.findUnique({
    where: { verificationToken: token },
    include: {
      registration: true,
      checkIns: true,
    },
  });

  if (!ticket) {
    return NextResponse.json({ status: "INVALID", message: "Ticket not found" });
  }

  if (ticket.status === "CANCELLED") {
    return NextResponse.json({ status: "CANCELLED", message: "Ticket cancelled" });
  }

  if (ticket.status === "USED" || ticket.checkIns.length > 0) {
    return NextResponse.json({
      status: "ALREADY_USED",
      message: "Already checked in",
      checkedInAt: ticket.checkIns[0]?.checkedInAt,
    });
  }

  await prisma.$transaction([
    prisma.checkIn.create({
      data: {
        ticketId: ticket.id,
        checkedInById: (session.user as any).id,
        notes,
      },
    }),
    prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: "USED" },
    }),
    prisma.ticketVerification.create({
      data: {
        ticketId: ticket.id,
        status: "VALID",
        notes: "Checked in",
      },
    }),
  ]);

  return NextResponse.json({
    status: "VALID",
    message: "Check-in successful",
    participant: ticket.registration.fullName,
    ticketNumber: ticket.ticketNumber,
  });
}
