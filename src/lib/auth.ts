import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: { permission: true },
                    },
                  },
                },
              },
            },
          },
        });

        if (!user || !user.isActive) {
          return null;
        }

        const valid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!valid) {
          return null;
        }

        const roles = user.roles.map((ur) => ur.role.name);
        const permissions = user.roles.flatMap((ur) =>
          ur.role.permissions.map((rp) => rp.permission.code)
        );

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          roles,
          permissions: [...new Set(permissions)],
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 hours
  },
  pages: {
    signIn: "/admin/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.roles = (user as any).roles;
        token.permissions = (user as any).permissions;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).roles = token.roles;
        (session.user as any).permissions = token.permissions;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

export function hasPermission(
  permissions: string[] | undefined,
  required: string | string[]
): boolean {
  if (!permissions) return false;
  if (permissions.includes("*") || permissions.includes("event:manage")) return true; // super
  const req = Array.isArray(required) ? required : [required];
  return req.some((r) => permissions.includes(r));
}

export function hasRole(roles: string[] | undefined, required: string | string[]): boolean {
  if (!roles) return false;
  if (roles.includes("SUPER_ADMIN")) return true;
  const req = Array.isArray(required) ? required : [required];
  return req.some((r) => roles.includes(r));
}
