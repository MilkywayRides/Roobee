import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import * as z from "zod";

const profileSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = profileSchema.parse(body);

    const user = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: {
        name: validatedData.name,
        email: validatedData.email,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("[PROFILE_UPDATE]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
} 