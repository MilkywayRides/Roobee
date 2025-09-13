"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch posts");
        return res.json();
      })
      .then(setPosts)
      .catch(() => setError("Failed to load posts"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (postId: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;

    try {
      const res = await fetch(`/api/posts/${postId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete post");
      }

      setPosts(posts.filter((p) => p.id !== postId));
    } catch (err: any) {
      setError(err.message || "Failed to delete post");
    }
  };


  return (
    <div className="max-w-2xl mx-auto py-8 px-2 md:px-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Posts</h1>
        <Button asChild>
          <Link href="/admin/posts/create">Add Post</Link>
        </Button>
      </div>
      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-32 mb-1" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : posts.length === 0 ? (
        <div className="text-muted-foreground text-center py-8">No posts found.</div>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => (
            <Card key={post.id}>
              <CardHeader className="flex flex-row items-center gap-3">
                <Avatar>
                  {post.author?.image ? (
                    <img src={post.author.image} alt={post.author.name || "User"} />
                  ) : (
                    <span>{post.author?.name?.[0] || "U"}</span>
                  )}
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-lg font-semibold mb-1">{post.title}</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {post.author?.name || "Unknown"} &middot; {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/posts/edit/${post.id}`}>Edit</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleDelete(post.id)} className="text-red-600">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground whitespace-pre-line">
                  {post.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
