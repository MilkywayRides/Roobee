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
    return NextResponse.json(post);
  } catch (error) {
    console.error("[POST_GET]", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
} 