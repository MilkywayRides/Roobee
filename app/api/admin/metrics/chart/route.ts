import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  // In a real application, you would fetch this data from your database.
  // The following is an EXAMPLE of how you might do this with Prisma.
  // You will need to adapt this to your specific needs and schema.

  // UNCOMMENT AND ADAPT THE FOLLOWING CODE:

  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const getCountsByMonth = async (model: any) => {
      const result = await model.groupBy({
        by: ['createdAt'],
        _count: {
          id: true,
        },
        where: {
          createdAt: {
            gte: sixMonthsAgo,
          },
        },
      });

      // This is a simplified aggregation. For PostgreSQL, you could do this more
      // efficiently with a raw query. This example aggregates in JS.
      const monthlyCounts: { [key: string]: number } = {};

      result.forEach((item: { createdAt: Date; _count: { id: number } }) => {
        const month = item.createdAt.toLocaleString('default', { month: 'long', year: 'numeric' });
        if (!monthlyCounts[month]) {
          monthlyCounts[month] = 0;
        }
        monthlyCounts[month] += item._count.id;
      });

      return monthlyCounts;
    };

    const [postsByMonth, usersByMonth, likesByMonth, followsByMonth] = await Promise.all([
        getCountsByMonth(prisma.post),
        getCountsByMonth(prisma.user),
        getCountsByMonth(prisma.like),
        getCountsByMonth(prisma.follow),
    ]);

    const allMonths = new Set([...Object.keys(postsByMonth), ...Object.keys(usersByMonth), ...Object.keys(likesByMonth), ...Object.keys(followsByMonth)]);

    const chartData = Array.from(allMonths).map(month => ({
      month: month.split(' ')[0], // "September 2025" -> "September"
      posts: postsByMonth[month] || 0,
      users: usersByMonth[month] || 0,
      likes: likesByMonth[month] || 0,
      follows: followsByMonth[month] || 0,
    })).sort((a, b) => new Date(a.month + ' 1, 2025') - new Date(b.month + ' 1, 2025')); // sort by month

    return NextResponse.json(chartData);

  } catch (error) {
    console.error(error);
    return new NextResponse(JSON.stringify({ error: "Failed to fetch metrics" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  } finally {
    await prisma.$disconnect();
  }
}