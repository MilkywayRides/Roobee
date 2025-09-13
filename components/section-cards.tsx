import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface SectionCardsProps {
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
  isLoading?: boolean;
}

// Skeleton component for individual card
function CardSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <CardDescription>
          <Skeleton className="h-4 w-20" />
        </CardDescription>
        <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
          <Skeleton className="h-8 w-24 @[250px]/card:h-9" />
        </CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-transparent bg-transparent">
            <Skeleton className="h-4 w-16" />
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1.5 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="text-muted-foreground">
          <Skeleton className="h-4 w-24" />
        </div>
      </CardFooter>
    </Card>
  )
}

export function SectionCards({
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
  isLoading = false,
}: SectionCardsProps) {
  if (isLoading) {
    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    )
  }

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Posts</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalPosts.toLocaleString()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {newPostsTrend === 'up' ? <IconTrendingUp /> : <IconTrendingDown />}
              {newPostsChange.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {newPosts.toLocaleString()} new posts this month
          </div>
          <div className="text-muted-foreground">
            Trending {newPostsTrend === 'up' ? 'up' : 'down'}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalUsers.toLocaleString()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {newUsersTrend === 'up' ? <IconTrendingUp /> : <IconTrendingDown />}
              {newUsersChange.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            {newUsers.toLocaleString()} new users this month
          </div>
          <div className="text-muted-foreground">
            Trending {newUsersTrend === 'up' ? 'up' : 'down'}
          </div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Likes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalLikes.toLocaleString()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {newLikesTrend === 'up' ? <IconTrendingUp /> : <IconTrendingDown />}
              {newLikesChange.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Likes trending {newLikesTrend === 'up' ? 'up' : 'down'}
          </div>
          <div className="text-muted-foreground">Engagement metrics</div>
        </CardFooter>
      </Card>
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Follows</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            {totalFollows.toLocaleString()}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              {newFollowsTrend === 'up' ? <IconTrendingUp /> : <IconTrendingDown />}
              {newFollowsChange.toFixed(1)}%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Follows trending {newFollowsTrend === 'up' ? 'up' : 'down'}
          </div>
          <div className="text-muted-foreground">Community growth</div>
        </CardFooter>
      </Card>
    </div>
  )
}

// Usage example:
// <SectionCards isLoading={true} {...otherProps} />
// or 
// <SectionCards isLoading={isDataFetching} {...otherProps} />