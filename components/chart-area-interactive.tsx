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
    color: 'hsl(var(--chart-1))',
  },
  users: {
    label: 'Users',
    color: 'hsl(var(--chart-2))',
  },
  likes: {
    label: 'Likes',
    color: 'hsl(var(--chart-3))',
  },
  follows: {
    label: 'Follows',
    color: 'hsl(var(--chart-4))',
  },
  shares: {
    label: 'Shares',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

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

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch('/api/admin/metrics/chart')
        if (!response.ok) {
          throw new Error('Failed to fetch chart data.')
        }
        const data = await response.json()
        setChartData(data)
      } catch (e) {
        setError(e instanceof Error ? e.message : 'An unknown error occurred.')
      } finally {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [])

  if (isLoading) {
    return (
      <Card className="p-4 shadow-sm">
        <CardHeader>
          <Skeleton className="h-8 w-40 rounded-md" />
          <Skeleton className="h-4 w-3/4 mt-2 rounded-md" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[250px] w-full rounded-lg" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4 shadow-sm border-red-300">
        <CardHeader>
          <CardTitle className="text-red-500">Error</CardTitle>
          <CardDescription>{error}</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (!chartData || chartData.length < 2) {
    return (
      <Card className="p-4 shadow-sm">
        <CardHeader>
          <CardTitle>Not Enough Data</CardTitle>
          <CardDescription>
            There is not enough data to display the chart.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  // Calculate growth trend
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
    <Card className="p-4 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold tracking-tight">
            Monthly Platform Growth
          </CardTitle>
          <Badge
            variant="outline"
            className={`ml-2 px-2 py-1 text-sm font-medium rounded-md border-none ${
              trend > 0
                ? 'text-green-600 bg-green-100'
                : 'text-red-600 bg-red-100'
            }`}
          >
            {trend > 0 ? '▲' : '▼'} {trend.toFixed(1)}%
          </Badge>
        </div>
        <CardDescription className="text-muted-foreground text-sm">
          Showing posts, users, likes & follows for the last 6 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart 
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
              style={{ fontSize: '12px', fill: 'hsl(var(--muted-foreground))' }}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              cursor={{ 
                stroke: 'hsl(var(--border))', 
                strokeWidth: 1,
                strokeDasharray: '5,5'
              }}
              wrapperStyle={{
                outline: 'none'
              }}
              allowEscapeViewBox={{ x: false, y: true }}
              position={{ x: undefined, y: undefined }}
            />

            <defs>
              {['posts', 'users', 'likes', 'follows'].map((key) => (
                <linearGradient
                  key={key}
                  id={`grad-${key}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0.4}
                  />
                  <stop
                    offset="95%"
                    stopColor={`var(--color-${key})`}
                    stopOpacity={0}
                  />
                </linearGradient>
              ))}
            </defs>

            {['posts', 'users', 'likes', 'follows'].map((key) => (
              <Area
                key={key}
                dataKey={key}
                type="natural"
                fill={`url(#grad-${key})`}
                fillOpacity={0.4}
                stroke={`var(--color-${key})`}
                stackId="a"
                strokeWidth={1}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}