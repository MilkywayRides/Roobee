import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request, context: { params: any }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  const { id: postId } = context.params;
  const { value } = await req.json();
  if (![1, -1].includes(value)) {
    return new NextResponse("Invalid value", { status: 400 });
  }
  // Upsert like
  await prisma.like.upsert({
    where: {
      userId_postId: {
        userId,
        postId,
      },
    },
    update: { value },
    create: {
      userId,
      postId,
      value,
    },
  });
  // Return updated counts
  const likes: { value: number }[] = await prisma.like.findMany({ where: { postId } });
  return NextResponse.json({
    likeCount: likes.filter((l) => l.value === 1).length,
    dislikeCount: likes.filter((l) => l.value === -1).length,
  });
} 