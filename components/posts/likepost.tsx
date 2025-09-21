"use client";

import { ThumbsDown, ThumbsUp } from "lucide-react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import confetti from "canvas-confetti";

import { Button } from "../ui/button";

const LikePost = () => {
  const params = useParams();
  const postId = params?.id as string;
  const { data: session } = useSession();
  const router = useRouter();

  const [likeState, setLikeState] = useState<1 | -1 | 0>(0);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);
  const [pendingRequests, setPendingRequests] = useState(0);

  // Memoize the fetch function to prevent unnecessary re-renders
  const fetchLikes = useCallback(async () => {
    if (!postId) return;
    try {
      const res = await fetch(`/api/posts/${postId}`);
      if (!res.ok) return;
      const data = await res.json();
      const likes = data.likes || [];
      setLikeCount(likes.filter((l: any) => l.value === 1).length);
      setDislikeCount(likes.filter((l: any) => l.value === -1).length);

      if (session?.user?.email) {
        const userLike = likes.find((l: any) => l.user?.email === session.user?.email);
        setLikeState(userLike?.value || 0);
      }
    } catch (error) {
      console.error("Failed to fetch likes:", error);
    }
  }, [postId, session?.user?.email]);

  useEffect(() => {
    fetchLikes();
  }, [fetchLikes]);

  // Debounced backend sync - only sync after user stops clicking
  const [syncTimeout, setSyncTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleLike = useCallback(async (
    value: 1 | -1,
    event: React.MouseEvent<HTMLButtonElement>,
  ) => {
    if (!session?.user?.email) {
      router.push("/login");
      return;
    }

    // Immediate UI update - no delays
    const oldLikeState = likeState;
    const newLikeState = oldLikeState === value ? 0 : value;

    // Update state immediately
    setLikeState(newLikeState);
    
    // Calculate count changes instantly
    let newLikeCount = likeCount;
    let newDislikeCount = dislikeCount;

    // Remove old vote count
    if (oldLikeState === 1) newLikeCount--;
    else if (oldLikeState === -1) newDislikeCount--;

    // Add new vote count
    if (newLikeState === 1) newLikeCount++;
    else if (newLikeState === -1) newDislikeCount++;

    setLikeCount(newLikeCount);
    setDislikeCount(newDislikeCount);

    // Instant confetti for likes
    if (newLikeState === 1 && oldLikeState !== 1) {
      const rect = event.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = rect.top / window.innerHeight;
      confetti({
        particleCount: 50, // Reduced for faster rendering
        spread: 70,
        origin: { x, y },
        angle: 90,
        startVelocity: 40,
        disableForReducedMotion: true, // Respect user preferences
      });
    }

    // Clear previous timeout if user clicks rapidly
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }

    // Debounce backend requests - only send after 300ms of no clicking
    const newTimeout = setTimeout(async () => {
      setPendingRequests(prev => prev + 1);
      
      try {
        const res = await fetch(`/api/posts/${postId}/like`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value: newLikeState }),
        });

        if (!res.ok) {
          // Only revert if this was the last pending request
          console.error("Backend sync failed, but UI already updated");
          // Could add a toast notification here instead of reverting
        }
      } catch (error) {
        console.error("Failed to sync like:", error);
        // Could add error handling/retry logic here
      } finally {
        setPendingRequests(prev => Math.max(0, prev - 1));
      }
    }, 300);

    setSyncTimeout(newTimeout);
  }, [likeState, likeCount, dislikeCount, session?.user?.email, router, postId, syncTimeout]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeout) {
        clearTimeout(syncTimeout);
      }
    };
  }, [syncTimeout]);

  const isButtonDisabled = !session?.user?.email;

  return (
    <div className="flex items-center gap-4 mb-8">
      <p>Was This Post Helpful?</p>
      <Button
        variant={likeState === 1 ? "default" : "outline"}
        size="sm"
        onClick={(e) => handleLike(1, e)}
        disabled={isButtonDisabled}
        className="flex items-center gap-2 transition-colors duration-75" // Faster transitions
      >
        <ThumbsUp className="w-4 h-4" />
        {likeCount}
      </Button>
      <Button
        variant={likeState === -1 ? "destructive" : "outline"}
        size="sm"
        onClick={(e) => handleLike(-1, e)}
        disabled={isButtonDisabled}
        className="flex items-center gap-2 transition-colors duration-75" // Faster transitions
      >
        <ThumbsDown className="w-4 h-4" />
        {dislikeCount}
      </Button>
      {pendingRequests > 0 && (
        <span className="text-xs text-gray-500 opacity-50"></span>
      )}
    </div>
  );
};

export default LikePost;