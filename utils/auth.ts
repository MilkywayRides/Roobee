import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { ROLES } from "@/constants";
import { ExtendedSession } from "@/types";

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export function isAdmin(session: ExtendedSession | null) {
  return session?.user?.role === ROLES.ADMIN || session?.user?.role === ROLES.SUPER_ADMIN;
}

export function isSuperAdmin(session: ExtendedSession | null) {
  return session?.user?.role === ROLES.SUPER_ADMIN;
}

export function requireAuth() {
  return async function (req: Request) {
    const session = await getSession();
    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }
    return session;
  };
}

export function requireAdmin() {
  return async function (req: Request) {
    const session = await getSession();
    if (!session || !isAdmin(session)) {
      return new Response("Forbidden", { status: 403 });
    }
    return session;
  };
}

export function requireSuperAdmin() {
  return async function (req: Request) {
    const session = await getSession();
    if (!session || !isSuperAdmin(session)) {
      return new Response("Forbidden", { status: 403 });
    }
    return session;
  };
} 