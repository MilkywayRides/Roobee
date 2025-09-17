"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Session } from "next-auth";
import Link from "next/link";
import Navigation from "@/components/posts/navigation";
import LikePost from "@/components/posts/likepost";
import PostAuthor from "@/components/posts/postauthor";
import PostInfo from "@/components/posts/postinfo";
import MarkdownRenderer from "@/components/posts/postcontent";
import PostSidebar from "@/components/posts/postsidebar";

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
  likes?: { userId: string; value: 1 | -1 }[];
}

export default function PostDetailPage() {
  const params = useParams();
  const postId = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [postLoading, setPostLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [posts, setPosts] = useState<Post[]>([]);
  const [likeLoading, setLikeLoading] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [likeState, setLikeState] = useState<1 | -1 | 0>(0);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);

  const { data: session } = useSession() as { data: Session | null };
  const router = useRouter();

  // Fetch all posts for sidebar
  useEffect(() => {
    const loadPosts = async () => {
      try {
        const res = await fetch("/api/posts");
        const data = await res.json();
        setPosts(data);
      } catch (error) {
        console.error("Failed to load posts", error);
      } finally {
        setPostsLoading(false);
      }
    };
    loadPosts();
  }, []);

  // Fetch current post
  useEffect(() => {
    if (!postId) return;
    setPostLoading(true);
    fetch(`/api/posts/${postId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch post");
        return res.json();
      })
      .then((data) => {
        setPost(data);

        const likes = data.likes || [];
        setLikeCount(likes.filter((l: any) => l.value === 1).length);
        setDislikeCount(likes.filter((l: any) => l.value === -1).length);

        const userId = session?.user?.id as string | undefined;
        if (userId) {
          const userLike = likes.find((l: any) => l.userId === userId);
          setLikeState(userLike?.value || 0);
        }
      })
      .catch(() => setError("Failed to load post"))
      .finally(() => setPostLoading(false));
  }, [postId, session?.user?.id]);

  // Skeleton loader for single post
  if (postLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* PostInfo Skeleton */}
          <div className="space-y-4 mb-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm">
              <Skeleton className="h-4 w-12" />
              <span>/</span>
              <Skeleton className="h-4 w-48" />
            </div>
            {/* Title */}
            <Skeleton className="h-10 w-3/4" />
            {/* Description */}
            <Skeleton className="h-5 w-full" />
            <Skeleton className="h-5 w-1/2" />
            {/* Meta */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-24" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-6 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </div>

          {/* MarkdownRenderer Skeleton */}
          <div className="space-y-6">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <br />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
          </div>

          {/* PostAuthor Skeleton */}
          <div className="border-t border-border pt-8 mt-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-20 mt-1" />
                </div>
              </div>
              <Skeleton className="h-9 w-24" />
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
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <PostSidebar
        posts={posts.map((p) => ({
          id: p.id,
          title: p.title,
          date: p.createdAt, // Map createdAt to the expected 'date' prop
          excerpt: p.description, // Map description to the optional 'excerpt' prop
          // category can be added here if available, e.g., from p.tags
        }))}
        currentPostId={postId}
        loading={postsLoading}
      />

      {/* Main Content */}
      <div className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <PostInfo post={post} />
        <MarkdownRenderer markdown={post.markdown} />
        <LikePost />
        <Navigation prevPost={post.prevPost} nextPost={post.nextPost} />
      </div>
    </div>
  );
}
