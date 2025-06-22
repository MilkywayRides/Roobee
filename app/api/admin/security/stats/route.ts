import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/config/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userRole = (session?.user as any)?.role;
    
    // Check if user is authenticated and is an admin
    if (!session?.user || !["ADMIN", "SUPER_ADMIN"].includes(userRole)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get date for last 24 hours
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

    // Get total events in last 24 hours
    const totalEvents = await prisma.securityAuditLog.count({
      where: {
        timestamp: {
          gte: last24Hours,
        },
      },
    });

    // Get suspicious activities
    const suspiciousActivities = await prisma.securityAuditLog.count({
      where: {
        event: {
          contains: 'SUSPICIOUS',
        },
        timestamp: {
          gte: last24Hours,
        },
      },
    });

    // Get failed login attempts
    const failedLogins = await prisma.securityAuditLog.count({
      where: {
        event: {
          in: [
            'LOGIN_ATTEMPT_INVALID_PASSWORD',
            'LOGIN_ATTEMPT_USER_NOT_FOUND',
            'LOGIN_ATTEMPT_MISSING_CREDENTIALS',
          ],
        },
        timestamp: {
          gte: last24Hours,
        },
      },
    });

    // Get rate limit exceeded events
    const rateLimitExceeded = await prisma.securityAuditLog.count({
      where: {
        event: {
          contains: 'RATE_LIMIT',
        },
        timestamp: {
          gte: last24Hours,
        },
      },
    });

    // Get unauthorized access attempts
    const unauthorizedAccess = await prisma.securityAuditLog.count({
      where: {
        event: {
          contains: 'UNAUTHORIZED',
        },
        timestamp: {
          gte: last24Hours,
        },
      },
    });

    // Get recent events (last 50)
    const recentEvents = await prisma.securityAuditLog.findMany({
      where: {
        timestamp: {
          gte: last24Hours,
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 50,
      select: {
        id: true,
        event: true,
        userId: true,
        details: true,
        ipAddress: true,
        userAgent: true,
        timestamp: true,
      },
    });

    return NextResponse.json({
      totalEvents,
      suspiciousActivities,
      failedLogins,
      rateLimitExceeded,
      unauthorizedAccess,
      recentEvents,
    });
  } catch (error) {
    console.error("[SECURITY_STATS_ERROR]", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
} 