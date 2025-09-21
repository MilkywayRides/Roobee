import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const { id } = await params;
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      select: { category: true, ownerId: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // Free projects are always accessible
    if (project.category === "free") {
      return NextResponse.json({ purchased: true });
    }

    // Project owner always has access
    if (project.ownerId === user.id) {
      return NextResponse.json({ purchased: true });
    }

    // Check if user has purchased this project
    const purchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        projectId: id
      }
    });

    return NextResponse.json({ purchased: !!purchase });

  } catch (error) {
    console.error("Error checking purchase status:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}