import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  context: { params: { id: string } },
) {
  const { params } = context;
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const postId = params.id;
    const { value } = await req.json();

    if (![1, -1].includes(value)) {
      return new NextResponse("Invalid value", { status: 400 });
    }

    // Verify post exists
    const post = await prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post) {
      return new NextResponse("Post not found", { status: 404 });
    }

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    if (existingLike && existingLike.value === value) {
      // User is toggling off their vote, so delete it
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      // User is creating a new vote or changing their vote
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
    }

    // Return updated counts
    const likes = await prisma.like.findMany({ where: { postId } });
    return NextResponse.json({
      likeCount: likes.filter((l) => l.value === 1).length,
      dislikeCount: likes.filter((l) => l.value === -1).length,
    });
  } catch (error) {
    console.error("[LIKE_POST_API]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
 