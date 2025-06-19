import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: { author: { select: { id: true, name: true, image: true } }, likes: true },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error("[POSTS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { title, description, markdown, tags, feature } = await req.json();
    const post = await prisma.post.create({
      data: {
        title,
        description,
        markdown,
        tags,
        feature,
        authorId: session.user.id,
      },
      include: { author: { select: { id: true, name: true, image: true } } }
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error("[POSTS_CREATE]", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
} 