"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

interface Post {
  id: string;
  title: string;
  description?: string;
  tags: string[];
  feature: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function PostsPage() {
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

  return (
    <div className="max-w-2xl mx-auto py-8 px-2 md:px-0">
      <h1 className="text-3xl font-bold mb-6">All Posts</h1>
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
                  <CardTitle className="text-lg font-semibold mb-1">
                    <Link href={`/posts/${post.id}`} className="hover:underline">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <div className="text-xs text-muted-foreground">
                    {post.author?.name || "Unknown"} &middot; {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                </div>
                {post.feature && <Badge variant="secondary">Featured</Badge>}
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-2">
                  {post.description}
                </div>
                <div className="flex flex-wrap gap-2">
                  {post.tags?.map((tag) => (
                    <Badge key={tag} variant="outline">{tag}</Badge>
                  ))}
                </div>
                <Link href={`/posts/${post.id}`} className="text-blue-600 hover:underline text-sm font-medium block mt-2">Read more</Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
