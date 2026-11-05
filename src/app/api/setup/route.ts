import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const existingUsers = await prisma.user.count();

    if (existingUsers > 0 && body.force !== true) {
      return NextResponse.json(
        { error: "Setup already completed. Database has users." },
        { status: 400 }
      );
    }

    const permissionCodes = [
      { code: "event:manage", name: "Manage Event Config", module: "event" },
      { code: "pages:manage", name: "Manage Pages", module: "pages" },
      { code: "registrations:read", name: "View Registrations", module: "registrations" },
      { code: "registrations:manage", name: "Manage Registrations", module: "registrations" },
      { code: "tickets:manage", name: "Manage Tickets", module: "tickets" },
      { code: "checkin:perform", name: "Perform Check-in", module: "checkin" },
      { code: "speakers:manage", name: "Manage Speakers", module: "speakers" },
      { code: "sponsors:manage", name: "Manage Sponsors", module: "sponsors" },
      { code: "exhibitors:manage", name: "Manage Exhibitors", module: "exhibitors" },
      { code: "stalls:manage", name: "Manage Stalls", module: "stalls" },
      { code: "emails:send", name: "Send Emails", module: "emails" },
      { code: "users:manage", name: "Manage Users", module: "users" },
      { code: "reports:export", name: "Export Reports", module: "reports" },
    ];

    for (const p of permissionCodes) {
      await prisma.permission.upsert({
        where: { code: p.code },
        update: {},
        create: p,
      });
    }

    const superAdminRole = await prisma.role.upsert({
      where: { name: "SUPER_ADMIN" },
      update: {},
      create: {
        name: "SUPER_ADMIN",
        description: "Full system access",
        isSystem: true,
      },
    });

    const allPerms = await prisma.permission.findMany();
    for (const perm of allPerms) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: superAdminRole.id,
            permissionId: perm.id,
          },
        },
        update: {},
        create: { roleId: superAdminRole.id, permissionId: perm.id },
      });
    }

    const passwordHash = await bcrypt.hash(body.password || "Admin@12345", 12);

    const admin = await prisma.user.upsert({
      where: { email: (body.email || "admin@fashionweek.local").toLowerCase() },
      update: { passwordHash },
      create: {
        email: (body.email || "admin@fashionweek.local").toLowerCase(),
        passwordHash,
        name: body.name || "Platform Super Admin",
        isActive: true,
      },
    });

    await prisma.userRole.upsert({
      where: {
        userId_roleId: { userId: admin.id, roleId: superAdminRole.id },
      },
      update: {},
      create: { userId: admin.id, roleId: superAdminRole.id },
    });

    const eventCount = await prisma.event.count();
    if (eventCount === 0) {
      const event = await prisma.event.create({
        data: {
          name: "Metro Fashion & Lifestyle Week 2026",
          tagline: "Where Style Meets the City",
          description:
            "A premier seven-day celebration of fashion, design, and lifestyle.",
          category: "Fashion & Lifestyle Week",
          startDate: new Date("2026-03-15"),
          endDate: new Date("2026-03-21"),
          startTime: "10:00",
          endTime: "22:00",
          timezone: "Asia/Kolkata",
          venueName: "Grand Exhibition Centre",
          venueAddress: "Creative District, Mumbai",
          organizerName: "Metro Creative Events",
          organizerEmail: "hello@metrofashionweek.in",
          registrationMode: "OPEN",
          isPublished: true,
        },
      });

      await prisma.ticketType.create({
        data: {
          eventId: event.id,
          name: "General Admission",
          description: "Access to public runway shows and exhibitions.",
          price: 1499,
          currency: "INR",
          capacity: 2000,
          isActive: true,
          formConfig: {
            fields: [
              { id: "fullName", type: "text", label: "Full Name", required: true },
              { id: "email", type: "email", label: "Email", required: true },
              { id: "phone", type: "tel", label: "Mobile", required: true },
            ],
          },
        },
      });

      const pages = [
        "home", "about", "agenda", "speakers", "sponsors", "exhibitors",
        "competitions", "venue", "registration", "contact", "privacy", "terms",
      ];
      for (let i = 0; i < pages.length; i++) {
        await prisma.eventPage.create({
          data: {
            eventId: event.id,
            slug: pages[i],
            title: pages[i].charAt(0).toUpperCase() + pages[i].slice(1),
            isEnabled: true,
            sortOrder: i,
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Setup completed. You can now log in at /admin/login",
      adminEmail: admin.email,
    });
  } catch (error: any) {
    console.error("Setup error:", error);
    return NextResponse.json(
      { error: error.message || "Setup failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const eventCount = await prisma.event.count();
    return NextResponse.json({
      initialized: userCount > 0,
      userCount,
      eventCount,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: "Database not ready", details: error.message },
      { status: 500 }
    );
  }
}
