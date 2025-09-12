import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (query) {
      console.log(`[POSTS_GET] Searching posts with query: "${query}"`);
    } else {
      console.log("[POSTS_GET] Fetching all posts...");
    }

    // Test database connection first
    try {
      await prisma.$connect();
      console.log("[POSTS_GET] Database connected successfully");
    } catch (dbError) {
      console.error("[POSTS_GET] Database connection failed:", dbError);
      return NextResponse.json(
        { error: "Database connection failed" },
        { status: 503 }
      );
    }

    const posts = await prisma.post.findMany({
      where: query
        ? {
            OR: [
              {
                title: {
                  contains: query,
                  mode: "insensitive",
                },
              },
              {
                description: {
                  contains: query,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {},
      include: {
        author: {
          select: { id: true, name: true, image: true },
        },
        likes: true,
      },
      orderBy: { createdAt: "desc" },
    });

    console.log("[POSTS_GET] Successfully fetched", posts.length, "posts");
    return NextResponse.json(posts);
  } catch (error) {
    console.error("[POSTS_GET] Error:", error);

    if (error instanceof Error && error.message.includes("connect")) {
      return NextResponse.json(
        { error: "Database connection failed. Please try again later." },
        { status: 503 }
      );
    }

    if (error instanceof Error && error.message.includes("prisma")) {
      return NextResponse.json(
        { error: "Database query failed. Please try again later." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Failed to fetch posts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
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
      include: { author: { select: { id: true, name: true, image: true } } }
    });
    return NextResponse.json(post);
  } catch (error) {
    console.error("[POSTS_CREATE]", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get("id");

    if (!postId) {
      return NextResponse.json({ error: "Post ID not provided" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.authorId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.like.deleteMany({
        where: { postId },
      }),
      prisma.post.delete({
        where: {
          id: postId,
        },
      }),
    ]);

    return NextResponse.json({ message: "Post deleted successfully" });
  } catch (error) {
    console.error("[POSTS_DELETE]", error);
    return NextResponse.json(
      { error: "Failed to delete post", details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
} 