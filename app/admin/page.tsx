"use client";

import React, { useEffect, useState } from "react";

import { useSession } from "next-auth/react";
import { Users, Activity, FileText, BarChart3 } from "lucide-react";
import { SectionCards } from "@/components/section-cards"

import { ChartAreaInteractive } from "@/components/chart-area-interactive"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
} from "@/components/ui/chart";

// Removed: import { prisma } from "@/lib/prisma";

interface MetricsData {
  totalPosts: number;
  newPosts: number;
  newPostsTrend: 'up' | 'down';
  newPostsChange: number;
  totalUsers: number;
  newUsers: number;
  newUsersTrend: 'up' | 'down';
  newUsersChange: number;
  totalLikes: number;
  newLikesTrend: 'up' | 'down';
  newLikesChange: number;
  totalFollows: number;
  newFollowsTrend: 'up' | 'down';
  newFollowsChange: number;
}

const animationConfig = {
  glowWidth: 300,
};

const chartData = [
  { month: "January", desktop: 342, mobile: 245 },
  { month: "February", desktop: 876, mobile: 654 },
  { month: "March", desktop: 512, mobile: 387 },
  { month: "April", desktop: 629, mobile: 521 },
  { month: "May", desktop: 458, mobile: 412 },
  { month: "June", desktop: 781, mobile: 598 },
  { month: "July", desktop: 394, mobile: 312 },
  { month: "August", desktop: 925, mobile: 743 },
  { month: "September", desktop: 647, mobile: 489 },
  { month: "October", desktop: 532, mobile: 476 },
  { month: "November", desktop: 803, mobile: 687 },
  { month: "December", desktop: 271, mobile: 198 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

export default function AdminPage() {
  const { data: session } = useSession();
  const [xAxis, setXAxis] = React.useState<number | null>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchMetricsData() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/admin/metrics');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: MetricsData = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error("Error fetching blog metrics:", error);
        setMetrics({
          totalPosts: 0,
          newPosts: 0,
          newPostsTrend: 'down',
          newPostsChange: 0,
          totalUsers: 0,
          newUsers: 0,
          newUsersTrend: 'down',
          newUsersChange: 0,
          totalLikes: 0,
          newLikesTrend: 'down',
          newLikesChange: 0,
          totalFollows: 0,
          newFollowsTrend: 'down',
          newFollowsChange: 0,
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchMetricsData();
  }, []);
  
  return (
    <div className="bg-card rounded-xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Welcome, {session?.user?.name || "Admin"}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-4">
          <SectionCards
            isLoading={isLoading}
            totalPosts={metrics?.totalPosts || 0}
            newPosts={metrics?.newPosts || 0}
            newPostsTrend={metrics?.newPostsTrend || 'down'}
            newPostsChange={metrics?.newPostsChange || 0}
            totalUsers={metrics?.totalUsers || 0}
            newUsers={metrics?.newUsers || 0}
            newUsersTrend={metrics?.newUsersTrend || 'down'}
            newUsersChange={metrics?.newUsersChange || 0}
            totalLikes={metrics?.totalLikes || 0}
            newLikesTrend={metrics?.newLikesTrend || 'down'}
            newLikesChange={metrics?.newLikesChange || 0}
            totalFollows={metrics?.totalFollows || 0}
            newFollowsTrend={metrics?.newFollowsTrend || 'down'}
            newFollowsChange={metrics?.newFollowsChange || 0}
          />
        </div>
        <div className="lg:col-span-4 px-4 lg:px-6">
          <ChartAreaInteractive />
        </div>
      </div>
    </div>
  );
}