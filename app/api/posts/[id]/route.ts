import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: { params: any }) {
  try {
    const { id } = context.params;
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, image: true } }, likes: true },
    });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    // Find next and previous posts by createdAt
    const nextPost = await prisma.post.findFirst({
      where: { createdAt: { gt: post.createdAt } },
      orderBy: { createdAt: "asc" },
      select: { id: true, title: true },
    });
    const prevPost = await prisma.post.findFirst({
      where: { createdAt: { lt: post.createdAt } },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    });
    return NextResponse.json({ ...post, nextPost, prevPost });
  } catch (error) {
    console.error("[POST_GET]", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;
    const { title, description, markdown, tags, feature } = await req.json();

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title,
        description,
        markdown,
        tags,
        feature,
      },
      include: { author: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json(updatedPost);
  } catch (error) {
    console.error("[POST_UPDATE]", error);
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: any }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = context.params;

    const post = await prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.like.deleteMany({
        where: { postId: id },
      }),
      prisma.post.delete({
        where: { id },
      }),
    ]);

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("[POST_DELETE]", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
} 