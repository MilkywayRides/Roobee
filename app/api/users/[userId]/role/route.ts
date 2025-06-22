import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  request: Request,
  context: { params: any }
) {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session?.user || userRole !== "SUPER_ADMIN") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new NextResponse("Invalid request body", { status: 400 });
    }
    const { role } = body;

    // Validate role
    if (!["USER", "ADMIN"].includes(role)) {
      return new NextResponse("Invalid role", { status: 400 });
    }

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: context.params.userId },
    });

    if (!targetUser) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Prevent modifying SUPER_ADMIN users
    if (targetUser.role === "SUPER_ADMIN") {
      return new NextResponse("Cannot modify SUPER_ADMIN users", { status: 403 });
    }

    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: context.params.userId },
      data: { role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_ROLE_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 