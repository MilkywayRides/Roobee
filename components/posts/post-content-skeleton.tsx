import { Skeleton } from "@/components/ui/skeleton";

const PostContentSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* PostInfo Skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-3/4" /> {/* Title */}
        <Skeleton className="h-4 w-1/2" /> {/* Metadata */}
      </div>

      {/* PostAuthor Skeleton */}
      <div className="flex items-center space-x-2">
        <Skeleton className="h-10 w-10 rounded-full" /> {/* Avatar */}
        <Skeleton className="h-4 w-24" /> {/* Author Name */}
      </div>

      {/* Separator is just a line, no skeleton needed */}
      <Skeleton className="h-px w-full" />

      {/* PostContent Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[90%]" />
        <Skeleton className="h-4 w-[95%]" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[80%]" />
      </div>

      {/* Separator is just a line, no skeleton needed */}
      <Skeleton className="h-px w-full" />

      {/* LikePost Skeleton */}
      <div className="flex items-center space-x-4">
        <Skeleton className="h-10 w-32" /> {/* Like button */}
        <Skeleton className="h-10 w-32" /> {/* Dislike button */}
      </div>
    </div>
  );
};

export default PostContentSkeleton;
