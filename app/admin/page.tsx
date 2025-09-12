"use client";

import React from "react";
import { useSession } from "next-auth/react";
import { Users, Activity, FileText, BarChart3, TrendingDown } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";

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
  const [xAxis, setXAxis] = React.useState(null);
  
  return (
    <div className="bg-card rounded-xl shadow-lg p-6 border">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Welcome, {session?.user?.name || "Admin"}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+20.1% from last month</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">573</div>
            <p className="text-xs text-muted-foreground">+201 since last hour</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 new reports</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Analytics</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">86%</div>
            <p className="text-xs text-muted-foreground">+4% from last month</p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>
            Highlighted Area Chart
            <Badge
              variant="outline"
              className="text-red-500 bg-red-500/10 border-none ml-2"
            >
              <TrendingDown className="h-4 w-4" />
              <span>-5.2%</span>
            </Badge>
          </CardTitle>
          <CardDescription>
            Showing total visitors for the last 6 months
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig}>
            <AreaChart
              accessibilityLayer
              data={chartData}
              onMouseMove={(e) => setXAxis(e?.chartX || null)}
              onMouseLeave={() => setXAxis(null)}
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <defs>
                <linearGradient
                  id="animated-highlighted-mask-grad"
                  x1="0"
                  y1="0"
                  x2="1"
                  y2="0"
                >
                  <stop offset="0%" stopColor="transparent" />
                  <stop offset="50%" stopColor="white" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
                <linearGradient
                  id="animated-highlighted-grad-desktop"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-desktop)"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient
                  id="animated-highlighted-grad-mobile"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="var(--color-mobile)"
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor="var(--color-mobile)"
                    stopOpacity={0}
                  />
                </linearGradient>
                {xAxis && (
                  <mask id="animated-highlighted-mask">
                    <rect
                      x={xAxis - animationConfig.glowWidth / 2}
                      y={0}
                      width={animationConfig.glowWidth}
                      height="100%"
                      fill="url(#animated-highlighted-mask-grad)"
                    />
                  </mask>
                )}
              </defs>
              <Area
                dataKey="mobile"
                type="natural"
                fill="url(#animated-highlighted-grad-mobile)"
                fillOpacity={0.4}
                stroke="var(--color-mobile)"
                stackId="a"
                strokeWidth={0.8}
                mask={xAxis ? "url(#animated-highlighted-mask)" : undefined}
              />
              <Area
                dataKey="desktop"
                type="natural"
                fill="url(#animated-highlighted-grad-desktop)"
                fillOpacity={0.4}
                stroke="var(--color-desktop)"
                stackId="a"
                strokeWidth={0.8}
                mask={xAxis ? "url(#animated-highlighted-mask)" : undefined}
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}