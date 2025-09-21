import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
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

    // Get project details
    const project = await prisma.project.findUnique({
      where: { id },
      select: { price: true, category: true, name: true }
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (project.category === "free") {
      return NextResponse.json({ error: "Free projects don't require purchase" }, { status: 400 });
    }

    if (!project.price) {
      return NextResponse.json({ error: "Project price not set" }, { status: 400 });
    }

    // Check if user has enough coins
    if (user.coin < project.price) {
      return NextResponse.json({ 
        error: "Insufficient coins",
        required: project.price,
        current: user.coin,
        needsUpgrade: true
      }, { status: 402 });
    }

    // Deduct coins and create purchase record
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: { coin: { decrement: project.price || 0 } }
      });
      
      // Create purchase record
      await tx.purchase.create({
        data: {
          userId: user.id,
          projectId: id
        }
      });
    });

    return NextResponse.json({ 
      success: true,
      message: `Successfully purchased ${project.name}`,
      coinsDeducted: project.price,
      remainingCoins: user.coin - project.price
    });

  } catch (error) {
    console.error("Error processing purchase:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}