"use client";

import { useEffect, useState } from "react";
// import Link from "next/link"; // Removed to resolve bundling error
import { formatDistanceToNow } from "date-fns";
import {
  MoreHorizontal,
  Plus,
  FileText,
  AlertTriangle,
} from "lucide-react";

// shadcn/ui components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// TypeScript Interface for the Post object
interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => {
        if (!res.ok) {
          throw new Error("A network error occurred while fetching posts.");
        }
        return res.json();
      })
      .then(setPosts)
      .catch((err) =>
        setError(err.message || "An unknown error occurred.")
      )
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (postId: string) => {
    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete the post.");
      }

      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setPostToDelete(null); // Close the dialog regardless of outcome
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <PostSkeleton key={i} />)}
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      );
    }

    if (posts.length === 0) {
      return <EmptyState />;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            onDeleteRequest={() => setPostToDelete(post)}
          />
        ))}
      </div>
    );
  };

  return (
    <>
      <main className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Manage Posts</h1>
          <Button asChild>
            <a href="/admin/posts/create">
              <Plus className="mr-2 h-4 w-4" />
              Add New Post
            </a>
          </Button>
        </div>
        {renderContent()}
      </main>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!postToDelete} onOpenChange={() => setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post
              titled &quot;{postToDelete?.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => postToDelete && handleDelete(postToDelete.id)}
              className="bg-red-600 hover:bg-red-700"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// --- Helper Components ---

// A dedicated component for a single post card
function PostCard({
  post,
  onDeleteRequest,
}: {
  post: Post;
  onDeleteRequest: () => void;
}) {
  const authorName = post.author?.name || "Unknown Author";
  const authorInitial = authorName[0].toUpperCase();
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), {
    addSuffix: true,
  });

  // Truncate long content for preview
  const truncateContent = (text: string | null | undefined, maxLength: number) => {
    if (!text) {
      return "";
    }
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Avatar>
          <AvatarImage src={post.author?.image || undefined} alt={authorName} />
          <AvatarFallback>{authorInitial}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <CardTitle className="text-lg leading-tight">{post.title}</CardTitle>
          <CardDescription>
            By {authorName} &middot; {timeAgo}
          </CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0 flex-shrink-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={`/admin/posts/edit/${post.id}`}>Edit</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={onDeleteRequest}
              className="text-red-600 focus:bg-red-50 focus:text-red-600"
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {truncateContent(post.content, 150)}
        </p>
      </CardContent>
    </Card>
  );
}

// A skeleton loader component that mimics the PostCard structure
function PostSkeleton() {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-start gap-4 space-y-0">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-8 w-8" />
      </CardHeader>
      <CardContent className="space-y-2 flex-grow">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-2/3" />
      </CardContent>
    </Card>
  );
}

// An engaging component for when there are no posts
function EmptyState() {
  return (
    <div className="text-center py-16 px-4 border-2 border-dashed rounded-lg col-span-1 sm:col-span-2 lg:col-span-3">
      <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
      <h3 className="mt-4 text-lg font-semibold">No Posts Yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Get started by creating your first post.
      </p>
      <div className="mt-6">
        <Button asChild>
          <a href="/admin/posts/create">
            <Plus className="mr-2 h-4 w-4" />
            Create First Post
          </a>
        </Button>
      </div>
    </div>
  );
}

