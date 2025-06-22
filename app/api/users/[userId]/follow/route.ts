import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, context: { params: any }) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id;
  if (!userId) {
    return NextResponse.json({ isFollowing: false });
  }
  const isFollowing = await prisma.follow.findFirst({
    where: {
      followerId: userId,
      followingId: context.params.userId,
    },
  });
  return NextResponse.json({ isFollowing: !!isFollowing });
}

export async function POST(req: Request, context: { params: any }) {
  const session = await getServerSession(authOptions);
  const followerId = (session?.user as any)?.id;
  const followingId = context.params.userId;
  if (!followerId) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (followerId === followingId) {
    return new NextResponse("Cannot follow yourself", { status: 400 });
  }
  const existing = await prisma.follow.findFirst({
    where: { followerId, followingId },
  });
  if (existing) {
    // Unfollow
    await prisma.follow.delete({ where: { id: existing.id } });
    return NextResponse.json({ isFollowing: false });
  } else {
    // Follow
    await prisma.follow.create({ data: { followerId, followingId } });
    return NextResponse.json({ isFollowing: true });
  }
} 