import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

// Prevent multiple instances of PrismaClient in Next.js
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ["query", "error", "warn"],
  });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function GET() {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    // Utility to fetch monthly counts
    const getCountsByMonth = async (model: any) => {
      const items = await model.findMany({
        where: {
          createdAt: {
            gte: sixMonthsAgo,
          },
        },
        select: {
          createdAt: true,
        },
      });

      const monthlyCounts: { [key: string]: number } = {};

      items.forEach((item: { createdAt: Date }) => {
        const key = `${item.createdAt.getFullYear()}-${item.createdAt.getMonth() + 1}`; // e.g. "2025-9"
        monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
      });

      return monthlyCounts;
    };

    const [postsByMonth, usersByMonth, likesByMonth, followsByMonth] =
      await Promise.all([
        getCountsByMonth(prisma.post),
        getCountsByMonth(prisma.user),
        getCountsByMonth(prisma.like),
        getCountsByMonth(prisma.follow),
      ]);

    // Collect all months
    const allMonths = new Set([
      ...Object.keys(postsByMonth),
      ...Object.keys(usersByMonth),
      ...Object.keys(likesByMonth),
      ...Object.keys(followsByMonth),
    ]);

    // Convert to chart data
    const chartData = Array.from(allMonths)
      .map((monthKey) => {
        const [year, month] = monthKey.split("-");
        const date = new Date(Number(year), Number(month) - 1);

        return {
          month: date.toLocaleString("default", { month: "long", year: "numeric" }), // "September 2025"
          posts: postsByMonth[monthKey] || 0,
          users: usersByMonth[monthKey] || 0,
          likes: likesByMonth[monthKey] || 0,
          follows: followsByMonth[monthKey] || 0,
          sortKey: date.getTime(),
        };
      })
      .sort((a, b) => a.sortKey - b.sortKey);

    return NextResponse.json(chartData);
  } catch (error) {
    console.error(error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to fetch metrics" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
