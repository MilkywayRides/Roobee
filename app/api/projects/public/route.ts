import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";
import { ExtendedSession } from "@/types";

export async function GET() {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    let projects;
    if (!session?.user) {
      // Only show free projects to guests
      projects = await prisma.project.findMany({
        where: { isFree: true },
        include: { files: { select: { id: true } } },
        orderBy: { createdAt: "desc" },
      });
    } else {
      // Show all projects to signed-in users
      projects = await prisma.project.findMany({
        include: { files: { select: { id: true } } },
        orderBy: { createdAt: "desc" },
      });
    }
    return NextResponse.json(projects);
  } catch (error) {
    console.error("[PROJECTS_PUBLIC]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 