import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role!)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const projects = await prisma.project.findMany({
      include: { files: { select: { id: true } } },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(projects);
  } catch (error) {
    console.error("[PROJECTS_ALL]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 