import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";
import { ExtendedSession } from "@/types";

export async function PATCH(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions) as ExtendedSession | null;
    console.log('Session:', session);
    console.log('Params:', params);

    // Check if user is authenticated and is a SUPER_ADMIN
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      console.log('Unauthorized: Not SUPER_ADMIN');
      return new NextResponse("Unauthorized", { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.log('Invalid JSON body');
      return new NextResponse("Invalid request body", { status: 400 });
    }
    const { role } = body;
    console.log('Requested role:', role);

    // Validate role
    if (!["USER", "ADMIN"].includes(role)) {
      console.log('Invalid role:', role);
      return new NextResponse("Invalid role", { status: 400 });
    }

    // Get the target user
    const targetUser = await prisma.user.findUnique({
      where: { id: params.userId },
    });
    console.log('Target user:', targetUser);

    if (!targetUser) {
      console.log('User not found');
      return new NextResponse("User not found", { status: 404 });
    }

    // Prevent modifying SUPER_ADMIN users
    if (targetUser.role === "SUPER_ADMIN") {
      console.log('Cannot modify SUPER_ADMIN');
      return new NextResponse("Cannot modify SUPER_ADMIN users", { status: 403 });
    }

    // Update the user's role
    const updatedUser = await prisma.user.update({
      where: { id: params.userId },
      data: { role },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_ROLE_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 