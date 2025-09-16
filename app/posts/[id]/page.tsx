"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ExtendedSession } from "@/types";
import Link from "next/link";
import Navigation from "@/components/posts/navigation";
import LikePost from "@/components/posts/likepost";
import PostAuthor from "@/components/posts/postauthor";
import PostInfo from "@/components/posts/postinfo";
import MarkdownRenderer from "@/components/posts/postcontent";

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
  nextPost?: { id: string; title: string } | null;
  prevPost?: { id: string; title: string } | null;
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [likeState, setLikeState] = useState<1 | -1 | 0>(0);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const { data: session } = useSession() as { data: ExtendedSession | null };
  const router = useRouter();

  useEffect(() => {
    if (!postId) return;
    setLoading(true);
    fetch(`/api/posts/${postId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch post");
        return res.json();
      })
      .then((data) => {
        setPost(data);

        // Calculate like/dislike counts
        const likes = data.likes || [];
        setLikeCount(likes.filter((l: any) => l.value === 1).length);
        setDislikeCount(likes.filter((l: any) => l.value === -1).length);

        // Set current user's like/dislike state safely
        const userId = session?.user?.id as string | undefined;
        if (userId) {
          const userLike = likes.find((l: any) => l.userId === userId);
          setLikeState(userLike?.value || 0);
        }
      })
      .catch(() => setError("Failed to load post"))
      .finally(() => setLoading(false));
  }, [postId, session?.user?.id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="space-y-8">
            <Skeleton className="h-12 w-3/4" />
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Error Loading Post</h1>
          <p className="text-muted-foreground">{error}</p>
          <Button asChild>
            <Link href="/posts">Back to Posts</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Post Not Found</h1>
          <p className="text-muted-foreground">The post you're looking for doesn't exist.</p>
          <Button asChild>
            <Link href="/posts">Back to Posts</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <PostInfo post={post} />

        {/* Content */}
        <MarkdownRenderer markdown={post.markdown} />

        {/* Author section */}
        <PostAuthor />

        {/* Interaction buttons */}
        <LikePost />

        {/* Navigation */}
        <Navigation prevPost={post.prevPost} nextPost={post.nextPost} />
      </div>
    </div>
  );
}
