"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ExtendedSession } from "@/types";

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
        // Set current user's like/dislike state
        let userId: string | undefined = undefined;
        if (session?.user && typeof session.user.id === "string") {
          userId = session.user.id;
          const userLike = likes.find((l: any) => l.userId === userId);
          setLikeState(userLike?.value || 0);
        }
      })
      .catch(() => setError("Failed to load post"))
      .finally(() => setLoading(false));
  }, [postId, session?.user?.id]);

  // Fetch follow state
  useEffect(() => {
    if (!post?.author?.id || !session?.user?.id) return;
    fetch(`/api/users/${post.author.id}/follow`, { method: "GET" })
      .then(res => res.json())
      .then(data => setIsFollowing(data.isFollowing))
      .catch(() => setIsFollowing(false));
  }, [post?.author?.id, session?.user ? session.user.id : undefined]);

  const handleLike = async (value: 1 | -1) => {
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }
    setLikeLoading(true);
    try {
      await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });
      // Refetch post likes
      fetch(`/api/posts/${postId}`)
        .then(res => res.json())
        .then((data) => {
          setPost(data);
          const likes = data.likes || [];
          setLikeCount(likes.filter((l: any) => l.value === 1).length);
          setDislikeCount(likes.filter((l: any) => l.value === -1).length);
          let userId: string | undefined = undefined;
          if (session?.user && typeof session.user.id === "string") {
            userId = session.user.id;
            const userLike = likes.find((l: any) => l.userId === userId);
            setLikeState(userLike?.value || 0);
          }
        });
    } finally {
      setLikeLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }
    if (!post || !post.author?.id) return;
    setFollowLoading(true);
    try {
      await fetch(`/api/users/${post.author.id}/follow`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      setIsFollowing((prev) => !prev);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleNext = () => {
    if (post?.nextPost?.id) {
      router.push(`/posts/${post.nextPost.id}`);
    }
  };

  const handlePrev = () => {
    if (post?.prevPost?.id) {
      router.push(`/posts/${post.prevPost.id}`);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-2 md:px-0">
      {/* Top navigation */}
      {!loading && post && (
        <div className="flex justify-between mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={!post.prevPost}
          >
            {post.prevPost ? `← Previous: ${post.prevPost.title}` : "No Previous"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!post.nextPost}
          >
            {post.nextPost ? `Next: ${post.nextPost.title} →` : "No Next"}
          </Button>
        </div>
      )}
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
            {!loading && post && (
              <div className="flex gap-4 mt-6 items-center">
                <Button
                  variant={likeState === 1 ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleLike(1)}
                  disabled={likeLoading}
                >
                  👍 {likeCount}
                </Button>
                <Button
                  variant={likeState === -1 ? "destructive" : "outline"}
                  size="sm"
                  onClick={() => handleLike(-1)}
                  disabled={likeLoading}
                >
                  👎 {dislikeCount}
                </Button>
                {session?.user && post && typeof session.user.id === "string" && post.author?.id !== session.user.id && (
                  <Button
                    variant={isFollowing ? "secondary" : "outline"}
                    size="sm"
                    onClick={handleFollow}
                    disabled={followLoading}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {/* Bottom navigation */}
      {!loading && post && (
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrev}
            disabled={!post.prevPost}
          >
            {post.prevPost ? `← Previous: ${post.prevPost.title}` : "No Previous"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNext}
            disabled={!post.nextPost}
          >
            {post.nextPost ? `Next: ${post.nextPost.title} →` : "No Next"}
          </Button>
        </div>
      )}
    </div>
  );
} 