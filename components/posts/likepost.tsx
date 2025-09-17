"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";

import { Button } from "../ui/button";

const LikePost = () => {
  const params = useParams();
  const postId = params?.id as string;
  const { data: session } = useSession();
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [likeState, setLikeState] = useState<1 | -1 | 0>(0);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);

  useEffect(() => {
    const fetchLikes = async () => {
      if (!postId) return;
      try {
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
      } catch (error) {
        console.error("Failed to fetch likes:", error);
      }
    };

    fetchLikes();
  }, [postId, session?.user?.id]);

  const handleLike = async (
    value: 1 | -1,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (isSubmitting) return;
    if (!session?.user?.id) {
      router.push("/login");
      return;
    }

    setIsSubmitting(true);

    const oldState = { likeState, likeCount, dislikeCount };
    const newState = { ...oldState };
    const newLikeState = oldState.likeState === value ? 0 : value;
    newState.likeState = newLikeState;

    // Decrement old state
    if (oldState.likeState === 1) newState.likeCount--;
    else if (oldState.likeState === -1) newState.dislikeCount--;

    // Increment new state
    if (newLikeState === 1) newState.likeCount++;
    else if (newLikeState === -1) newState.dislikeCount++;

    // Optimistically update UI
    setLikeState(newState.likeState);
    setLikeCount(newState.likeCount);
    setDislikeCount(newState.dislikeCount);

    if (newLikeState === 1 && oldState.likeState !== 1) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = rect.top / window.innerHeight;
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { x, y },
        angle: 90, // Shoots downwards
        startVelocity: 40,
      });
    }

    try {
      const res = await fetch(`/api/posts/${postId}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ value }),
      });

      if (!res.ok) {
        // Revert on error
        setLikeState(oldState.likeState);
        setLikeCount(oldState.likeCount);
        setDislikeCount(oldState.dislikeCount);
      }
    } catch (error) {
      console.error("Failed to submit like:", error);
      // Revert on error
      setLikeState(oldState.likeState);
      setLikeCount(oldState.likeCount);
      setDislikeCount(oldState.dislikeCount);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center gap-4 mb-8">
      <p>Was This Post Helpful?</p>
      <Button
        variant={likeState === 1 ? "default" : "outline"}
        size="sm"
        onClick={(e) => handleLike(1, e)}
        disabled={isSubmitting}
        className="flex items-center gap-2"
      >
        <ThumbsUp className="w-4 h-4" />
        {likeCount}
      </Button>
      <Button
        variant={likeState === -1 ? "destructive" : "outline"}
        size="sm"
        onClick={(e) => handleLike(-1, e)}
        disabled={isSubmitting}
        className="flex items-center gap-2"
      >
        <ThumbsDown className="w-4 h-4" />
        {dislikeCount}
      </Button>
    </div>
  );
};

export default LikePost;
