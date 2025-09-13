'use client'

import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
} from 'recharts'
import React, { useEffect, useState } from 'react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const chartConfig = {
  posts: {
    label: 'Posts',
    color: 'var(--chart-1)',
  },
  users: {
    label: 'Users',
    color: 'var(--chart-2)',
  },
  likes: {
    label: 'Likes',
    color: 'var(--chart-3)',
  },
  follows: {
    label: 'Follows',
    color: 'var(--chart-4)',
  },
} satisfies ChartConfig

const animationConfig = {
  glowWidth: 300,
}

interface ChartData {
  month: string
  posts: number
  users: number
  likes: number
  follows: number
}

export function ChartAreaInteractive() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [xAxis, setXAxis] = React.useState<number | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        // You need to create this API endpoint.
        // It should return data in the format of:
        // [{ month: "April", posts: 5, ... }, { month: "May", ... }]
        const response = await fetch('/api/admin/metrics/chart')
        if (!response.ok) {
          throw new Error('Failed to fetch chart data.')
        }
        const data = await response.json()
        setChartData(data)
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message)
        } else {
          setError('An unknown error occurred.')
        }
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-full mt-2" />
        </CardHeader>
        <CardContent>
          <Skeleton className="aspect-auto h-[250px] w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!chartData || chartData.length < 2) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Not Enough Data</CardTitle>
          <CardDescription>
            There is not enough data to display the chart.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Calculate trend based on the last two months
  const latestMonth = chartData[chartData.length - 1]
  const previousMonth = chartData[chartData.length - 2]
  const totalLatest = Object.values(latestMonth).reduce(
    (acc, value) => (typeof value === 'number' ? acc + value : acc),
    0
  )
  const totalPrevious = Object.values(previousMonth).reduce(
    (acc, value) => (typeof value === 'number' ? acc + value : acc),
    0
  )
  const trend =
    totalPrevious === 0
      ? 100
      : ((totalLatest - totalPrevious) / totalPrevious) * 100

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Monthly Platform Growth
          <Badge
            variant="outline"
            className={`${trend > 0 ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'} border-none ml-2`}
          >
            {trend > 0 ? '▲' : '▼'}
            <span>{trend.toFixed(1)}%</span>
          </Badge>
        </CardTitle>
        <CardDescription>
          Showing total posts, users, likes and follows for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <AreaChart
            accessibilityLayer
            data={chartData}
            onMouseMove={(e) => setXAxis(e.chartX as number)}
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
                id="animated-highlighted-grad-posts"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-posts)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-posts)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="animated-highlighted-grad-users"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-users)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-users)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="animated-highlighted-grad-likes"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-likes)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-likes)"
                  stopOpacity={0}
                />
              </linearGradient>
              <linearGradient
                id="animated-highlighted-grad-follows"
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop
                  offset="5%"
                  stopColor="var(--color-follows)"
                  stopOpacity={0.4}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-follows)"
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
              dataKey="posts"
              type="natural"
              fill={"url(#animated-highlighted-grad-posts)"}
              fillOpacity={0.4}
              stroke="var(--color-posts)"
              stackId="a"
              strokeWidth={0.8}
              mask="url(#animated-highlighted-mask)"
            />
            <Area
              dataKey="users"
              type="natural"
              fill={"url(#animated-highlighted-grad-users)"}
              fillOpacity={0.4}
              stroke="var(--color-users)"
              stackId="a"
              strokeWidth={0.8}
              mask="url(#animated-highlighted-mask)"
            />
            <Area
              dataKey="likes"
              type="natural"
              fill={"url(#animated-highlighted-grad-likes)"}
              fillOpacity={0.4}
              stroke="var(--color-likes)"
              stackId="a"
              strokeWidth={0.8}
              mask="url(#animated-highlighted-mask)"
            />
            <Area
              dataKey="follows"
              type="natural"
              fill={"url(#animated-highlighted-grad-follows)"}
              fillOpacity={0.4}
              stroke="var(--color-follows)"
              stackId="a"
              strokeWidth={0.8}
              mask="url(#animated-highlighted-mask)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
