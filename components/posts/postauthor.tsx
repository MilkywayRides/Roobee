"use client";

import React, { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";
import { UserPlus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface Post {
  id: string;
  author: {
    id: string;
    name: string | null;
    image: string | null;
  };
}

const PostAuthor = () => {
  const params = useParams();
  const postId = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [followLoading, setFollowLoading] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!postId) return;

    fetch(`/api/posts/${postId}`)
      .then((res) => res.json())
      .then((data) => setPost(data))
      .catch(() => setPost(null));
  }, [postId]);

  useEffect(() => {
    if (!post?.author?.id || !session?.user?.id) return;

    fetch(`/api/users/${post.author.id}/follow`, { method: "GET" })
      .then((res) => res.json())
      .then((data) => setIsFollowing(data.isFollowing))
      .catch(() => setIsFollowing(false));
  }, [post?.author?.id, session?.user?.id]);

  const handleFollow = async () => {
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }
    if (!post?.author?.id) return;

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

  if (!post?.author) return null;

  return (
    <div className="border-t border-border pt-8 mb-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={post.author.image || undefined}
              alt={post.author.name || "Author"}
            />
            <AvatarFallback>{post.author?.name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-foreground">
              {post.author?.name || "Unknown Author"}
            </h3>
            <p className="text-sm text-muted-foreground">Author</p>
          </div>
        </div>
        {session?.user &&
          post.author.id !== (session.user as any)?.id && (
            <Button
              variant={isFollowing ? "secondary" : "outline"}
              size="sm"
              onClick={handleFollow}
              disabled={followLoading}
              className="flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              {isFollowing ? "Following" : "Follow"}
            </Button>
          )}
      </div>
    </div>
  );
};

export default PostAuthor;
