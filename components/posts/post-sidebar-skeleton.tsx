
import { Skeleton } from "@/components/ui/skeleton";

const PostSidebarSkeleton = () => (
    <div className="p-6">
        <div className="flex items-center gap-2 mb-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-6 w-32" />
        </div>
        <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
        </div>
        <div className="space-y-3 mt-8">
            {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
        </div>
    </div>
);

export default PostSidebarSkeleton;
