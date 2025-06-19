import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params;
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