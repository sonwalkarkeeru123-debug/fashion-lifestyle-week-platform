import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  generateRegistrationId,
  generateTicketNumber,
  generateSecureToken,
} from "@/lib/utils";
import { generateQRDataUrl, buildVerificationUrl } from "@/lib/qr";
import { sendEmail, personalizeTemplate } from "@/lib/email";
import { z } from "zod";

const registerSchema = z.object({
  ticketTypeId: z.string().min(1),
  fullName: z.string().min(2).max(120),
  email: z.string().email(),
  phone: z.string().optional(),
  organization: z.string().optional(),
  designation: z.string().optional(),
  city: z.string().optional(),
  country: z.string().optional(),
  answers: z.record(z.any()).optional(),
  invitationCode: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const data = registerSchema.parse(body);

    const ticketType = await prisma.ticketType.findUnique({
      where: { id: data.ticketTypeId },
      include: { event: true },
    });

    if (!ticketType || !ticketType.isActive) {
      return NextResponse.json({ error: "Invalid ticket type" }, { status: 400 });
    }

    const event = ticketType.event;
    if (!event.isPublished) {
      return NextResponse.json({ error: "Event not open for registration" }, { status: 400 });
    }

    if (ticketType.capacity && ticketType.soldCount >= ticketType.capacity) {
      return NextResponse.json({ error: "This ticket category is sold out" }, { status: 400 });
    }

    const existing = await prisma.registration.findFirst({
      where: {
        eventId: event.id,
        email: data.email.toLowerCase(),
        ticketTypeId: data.ticketTypeId,
        status: { not: "CANCELLED" },
      },
    });
    if (existing) {
      return NextResponse.json(
        { error: "You are already registered for this ticket category" },
        { status: 400 }
      );
    }

    let invitationId: string | undefined;
    if (event.registrationMode === "INVITATION") {
      if (!data.invitationCode) {
        return NextResponse.json({ error: "Invitation code required" }, { status: 400 });
      }
      const inv = await prisma.invitation.findUnique({
        where: { code: data.invitationCode },
      });
      if (!inv || inv.status !== "PENDING" || inv.eventId !== event.id) {
        return NextResponse.json({ error: "Invalid or used invitation" }, { status: 400 });
      }
      if (inv.expiresAt && inv.expiresAt < new Date()) {
        return NextResponse.json({ error: "Invitation has expired" }, { status: 400 });
      }
      invitationId = inv.id;
    }

    const registrationId = generateRegistrationId("FLW");
    const ticketNumber = generateTicketNumber();
    const verificationToken = generateSecureToken(40);
    const status = ticketType.requiresApproval ? "PENDING" : "CONFIRMED";

    const result = await prisma.$transaction(async (tx) => {
      const registration = await tx.registration.create({
        data: {
          eventId: event.id,
          ticketTypeId: ticketType.id,
          registrationId,
          fullName: data.fullName,
          email: data.email.toLowerCase(),
          phone: data.phone,
          organization: data.organization,
          designation: data.designation,
          city: data.city,
          country: data.country,
          status,
          answers: data.answers || {},
          invitationId,
        },
      });

      const ticket = await tx.ticket.create({
        data: {
          registrationId: registration.id,
          ticketNumber,
          verificationToken,
          status: "VALID",
        },
      });

      await tx.ticketType.update({
        where: { id: ticketType.id },
        data: { soldCount: { increment: 1 } },
      });

      if (invitationId) {
        await tx.invitation.update({
          where: { id: invitationId },
          data: { status: "USED", usedAt: new Date() },
        });
      }

      return { registration, ticket };
    });

    const verifyUrl = buildVerificationUrl(verificationToken);
    try {
      const qrDataUrl = await generateQRDataUrl(verifyUrl);
      await prisma.ticket.update({
        where: { id: result.ticket.id },
        data: { qrCodeDataUrl: qrDataUrl },
      });
    } catch (e) {
      console.error("QR generation failed", e);
    }

    const spocAssignment = await prisma.spocAssignment.findFirst({
      where: { ticketTypeId: ticketType.id },
      include: { spoc: true },
    });
    const spoc = spocAssignment?.spoc;

    const template = await prisma.emailTemplate.findFirst({
      where: {
        OR: [
          { eventId: event.id, type: "CONFIRMATION", isDefault: true },
          { type: "CONFIRMATION", isDefault: true },
        ],
      },
    });

    const vars = {
      participant_name: data.fullName,
      event_name: event.name,
      event_date: `${event.startDate.toLocaleDateString("en-IN")} – ${event.endDate.toLocaleDateString("en-IN")}`,
      event_venue: event.venueName || "",
      ticket_number: ticketNumber,
      ticket_type: ticketType.name,
      registration_id: registrationId,
      qr_code_url: verifyUrl,
      spoc_name: spoc?.name || event.organizerName || "",
      spoc_email: spoc?.email || event.organizerEmail || "",
      spoc_phone: spoc?.phone || event.organizerPhone || "",
    };

    if (template) {
      await sendEmail({
        to: data.email,
        subject: personalizeTemplate(template.subject, vars),
        html: personalizeTemplate(template.bodyHtml, vars),
      });
    } else {
      await sendEmail({
        to: data.email,
        subject: `Registration confirmed – ${event.name}`,
        html: `<p>Dear ${data.fullName},</p><p>You are registered for <strong>${event.name}</strong>.</p><p>Ticket: ${ticketNumber}<br/>Registration ID: ${registrationId}</p><p><a href="${verifyUrl}">View ticket</a></p>`,
      });
    }

    return NextResponse.json({
      success: true,
      registrationId,
      ticketNumber,
      status,
      verificationToken,
      ticketUrl: `/ticket/${verificationToken}`,
      message:
        status === "PENDING"
          ? "Registration submitted and pending approval."
          : "Registration successful. Check your email for the ticket.",
    });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json({ error: "Invalid data", details: error.errors }, { status: 400 });
    }
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
