"use client";

import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const LikePost = () => {
  const params = useParams();
  const postId = params?.id as string;
  const [likeLoading, setLikeLoading] = useState(false);
  const [likeState, setLikeState] = useState<1 | -1 | 0>(0);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const { data: session } = useSession();
  const router = useRouter();

  const fetchLikes = async () => {
    const res = await fetch(`/api/posts/${postId}`);
    if (!res.ok) return;
    const data = await res.json();
    const likes = data.likes || [];
    setLikeCount(likes.filter((l: any) => l.value === 1).length);
    setDislikeCount(likes.filter((l: any) => l.value === -1).length);

    if (session?.user?.id) {
      const userLike = likes.find((l: any) => l.userId === session.user.id);
      setLikeState(userLike?.value || 0);
    }
  };

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
      await fetchLikes();
    } finally {
      setLikeLoading(false);
    }
  };

  useEffect(() => {
    if (postId) fetchLikes();
  }, [postId, session?.user?.id]);

  return (
    <div className="flex items-center gap-4 mb-8">
      <Button
        variant={likeState === 1 ? "default" : "outline"}
        size="sm"
        onClick={() => handleLike(1)}
        disabled={likeLoading}
        className="flex items-center gap-2"
      >
        <ThumbsUp className="w-4 h-4" />
        {likeCount}
      </Button>
      <Button
        variant={likeState === -1 ? "destructive" : "outline"}
        size="sm"
        onClick={() => handleLike(-1)}
        disabled={likeLoading}
        className="flex items-center gap-2"
      >
        <ThumbsDown className="w-4 h-4" />
        {dislikeCount}
      </Button>
    </div>
  );
};

export default LikePost;
