import React from "react";
import { Button } from "../ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavigationProps {
  prevPost?: { id: string; title: string } | null;
  nextPost?: { id: string; title: string } | null;
}

const Navigation: React.FC<NavigationProps> = ({ prevPost, nextPost }) => {
  const router = useRouter();

  const handleNext = () => {
    if (nextPost?.id) {
      router.push(`/posts/${nextPost.id}`);
    }
  };

  const handlePrev = () => {
    if (prevPost?.id) {
      router.push(`/posts/${prevPost.id}`);
    }
  };

  return (
    <div className="border-t border-border pt-8">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={handlePrev}
          disabled={!prevPost}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          {prevPost ? "Previous Post" : "No Previous"}
        </Button>
        <Button
          variant="outline"
          onClick={handleNext}
          disabled={!nextPost}
          className="flex items-center gap-2"
        >
          {nextPost ? "Next Post" : "No Next"}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>

      {prevPost && (
        <div className="mt-2 text-sm text-muted-foreground">
          ← {prevPost.title}
        </div>
      )}
      {nextPost && (
        <div className="mt-2 text-sm text-muted-foreground text-right">
          {nextPost.title} →
        </div>
      )}
    </div>
  );
};

export default Navigation;
