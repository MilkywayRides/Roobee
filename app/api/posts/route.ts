// /app/api/posts/route.ts  (App Router style)

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

// Fallback mock data
const mockPosts = [
  { id: "1", title: "First Post", date: "2025-09-10", excerpt: "Intro...", category: "General" },
  { id: "2", title: "Second Post", date: "2025-09-12", excerpt: "Details...", category: "Updates" },
];

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    console.log(query ? `[POSTS_GET] Searching posts: "${query}"` : "[POSTS_GET] Fetching all posts...");

    // Try DB connection
    try {
      await prisma.$connect();
      console.log("[POSTS_GET] Database connected successfully");
    } catch (dbError) {
      console.error("[POSTS_GET] Database connection failed, returning mock posts:", dbError);
      return NextResponse.json(mockPosts, { status: 200 });
    }

    // Query DB
    const posts = await prisma.post.findMany({
      where: query
        ? {
            OR: [
              { title: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
            ],
          }
        : {},
      include: {
        author: { select: { id: true, name: true, image: true } },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("[POSTS_GET] Successfully fetched", posts.length, "posts");
    return NextResponse.json(posts);
  } catch (error) {
    console.error("[POSTS_GET] Error:", error);
    return NextResponse.json(mockPosts, { status: 200 }); // fallback to mock posts
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
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
        authorId: userId,
      },
      include: { author: { select: { id: true, name: true, image: true } } },
    });

    return NextResponse.json(post);
  } catch (error) {
    console.error("[POSTS_CREATE]", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
