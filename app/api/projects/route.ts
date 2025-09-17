import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";
import { Session } from "next-auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions) as Session | null;
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role!)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const { name, description, isFree, coinCost } = await req.json();
    const project = await prisma.project.create({
      data: {
        name,
        description,
        isFree,
        coinCost: isFree ? null : coinCost,
        ownerId: session.user.id!,
      },
    });
    return NextResponse.json(project);
  } catch (error) {
    console.error("[PROJECT_CREATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 