"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";

interface Post {
  id: string;
  title: string;
  description?: string;
  markdown: string;
  tags: string[];
  feature: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    fetch(`/api/posts/${postId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch post");
        return res.json();
      })
      .then(setPost)
      .catch(() => setError("Failed to load post"))
      .finally(() => setLoading(false));
  }, [postId]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-2 md:px-0">
      {loading ? (
        <Card className="animate-pulse">
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
      ) : error ? (
        <div className="text-red-500 text-center py-8">{error}</div>
      ) : !post ? (
        <div className="text-muted-foreground text-center py-8">Post not found.</div>
      ) : (
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Avatar>
              {post.author?.image ? (
                <img src={post.author.image} alt={post.author.name || "User"} />
              ) : (
                <span>{post.author?.name?.[0] || "U"}</span>
              )}
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-2xl font-bold mb-1">{post.title}</CardTitle>
              <div className="text-xs text-muted-foreground">
                {post.author?.name || "Unknown"} &middot; {new Date(post.createdAt).toLocaleDateString()}
              </div>
            </div>
            {post.feature && <Badge variant="secondary">Featured</Badge>}
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-2">
              {post.tags?.map((tag) => (
                <Badge key={tag} variant="outline">{tag}</Badge>
              ))}
            </div>
            <div className="text-muted-foreground mb-4 text-base">
              {post.description}
            </div>
            <div className="prose prose-neutral dark:prose-invert max-w-none">
              <ReactMarkdown>{post.markdown}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 