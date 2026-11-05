import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Fashion & Lifestyle Week platform...");

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
    { code: "emails:send", name: "Send Emails", module: "emails" },
    { code: "users:manage", name: "Manage Users", module: "users" },
    { code: "reports:export", name: "Export Reports", module: "reports" },
  ];

  for (const p of permissionCodes) {
    await prisma.permission.upsert({ where: { code: p.code }, update: {}, create: p });
  }

  const superAdminRole = await prisma.role.upsert({
    where: { name: "SUPER_ADMIN" },
    update: {},
    create: { name: "SUPER_ADMIN", description: "Full system access", isSystem: true },
  });

  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: superAdminRole.id, permissionId: perm.id },
    });
  }

  const passwordHash = await bcrypt.hash("Admin@12345", 12);
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@fashionweek.local" },
    update: {},
    create: {
      email: "admin@fashionweek.local",
      passwordHash,
      name: "Platform Super Admin",
      isActive: true,
    },
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: adminUser.id, roleId: superAdminRole.id } },
    update: {},
    create: { userId: adminUser.id, roleId: superAdminRole.id },
  });

  const event = await prisma.event.upsert({
    where: { id: "seed-event-001" },
    update: {},
    create: {
      id: "seed-event-001",
      name: "Metro Fashion & Lifestyle Week 2026",
      tagline: "Where Style Meets the City",
      description:
        "A premier seven-day celebration of fashion, design, and lifestyle. Experience runway showcases, designer exhibitions, styling competitions, and exclusive networking.",
      category: "Fashion & Lifestyle Week",
      startDate: new Date("2026-03-15T00:00:00Z"),
      endDate: new Date("2026-03-21T23:59:59Z"),
      startTime: "10:00",
      endTime: "22:00",
      timezone: "Asia/Kolkata",
      venueName: "Grand Exhibition Centre",
      venueAddress: "123 Fashion Boulevard, Creative District, Mumbai 400001",
      organizerName: "Metro Creative Events",
      organizerEmail: "hello@metrofashionweek.in",
      organizerPhone: "+91 98765 43210",
      registrationMode: "OPEN",
      isPublished: true,
    },
  });

  await prisma.ticketType.create({
    data: {
      eventId: event.id,
      name: "General Admission",
      description: "Access to all public runway shows, exhibitions, and networking zones.",
      price: 1499,
      currency: "INR",
      capacity: 2000,
      isActive: true,
      sortOrder: 0,
      formConfig: {
        fields: [
          { id: "fullName", type: "text", label: "Full Name", required: true },
          { id: "email", type: "email", label: "Email Address", required: true },
          { id: "phone", type: "tel", label: "Mobile Number", required: true },
        ],
      },
    },
  });

  await prisma.ticketType.create({
    data: {
      eventId: event.id,
      name: "VIP Experience",
      description: "Front-row seating, exclusive lounge access, designer meet-and-greet.",
      price: 4999,
      currency: "INR",
      capacity: 200,
      isActive: true,
      sortOrder: 1,
    },
  });

  await prisma.agendaItem.create({
    data: {
      eventId: event.id,
      day: 1,
      date: new Date("2026-03-15"),
      startTime: "11:00",
      endTime: "12:30",
      title: "Opening Runway: Emerging Designers Collective",
      description: "A curated showcase of next-generation Indian design talent.",
      activityType: "SHOWCASE",
      stageArea: "Main Runway",
      sortOrder: 1,
    },
  });

  await prisma.sponsor.create({
    data: {
      eventId: event.id,
      name: "Luxe Fabrics Co.",
      tier: "PLATINUM",
      description: "Premium textile partner for the week.",
      isPublished: true,
      sortOrder: 1,
    },
  });

  console.log("Seed completed.");
  console.log("Super Admin: admin@fashionweek.local / Admin@12345");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
