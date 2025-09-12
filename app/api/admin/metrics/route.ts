import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const totalPosts = await prisma.post.count();
    const newPosts = await prisma.post.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const totalUsers = await prisma.user.count();
    const newUsers = await prisma.user.count({
      where: {
        createdAt: {
          gte: thirtyDaysAgo,
        },
      },
    });

    const totalLikes = await prisma.like.count();
    const totalFollows = await prisma.follow.count();

    // Placeholder for trends and changes. These would require more complex queries
    // comparing current data with previous periods (e.g., last month, last quarter).
    // The user needs to implement this logic based on their specific requirements.
    const newPostsTrend: 'up' | 'down' = 'up'; // Placeholder
    const newPostsChange: number = 15.0; // Placeholder
    const newUsersTrend: 'up' | 'down' = 'up'; // Placeholder
    const newUsersChange: number = 10.0; // Placeholder
    const newLikesTrend: 'up' | 'down' = 'up'; // Placeholder
    const newLikesChange: number = 20.0; // Placeholder
    const newFollowsTrend: 'up' | 'down' = 'up'; // Placeholder
    const newFollowsChange: number = 5.0; // Placeholder

    return NextResponse.json({
      totalPosts,
      newPosts,
      newPostsTrend,
      newPostsChange,
      totalUsers,
      newUsers,
      newUsersTrend,
      newUsersChange,
      totalLikes,
      newLikesTrend,
      newLikesChange,
      totalFollows,
      newFollowsTrend,
      newFollowsChange,
    });
  } catch (error) {
    console.error("Error fetching blog metrics in API route:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch metrics",
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
