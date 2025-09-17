import { ArrowLeft, Calendar, User } from "lucide-react";
import React from "react";
import { Badge } from "../ui/badge";
import Link from "next/link";
import PostAuthor from "./postauthor";
import { Button } from "../ui/button";

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

interface PostInfoProps {
  post: Post;
}

const PostInfo: React.FC<PostInfoProps> = ({ post }) => {
  return (
    <div className="mb-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-muted-foreground mb-4">
        <Button variant="ghost">
          <Link href="/" className="hover:text-foreground transition-colors">
            <ArrowLeft />
          </Link>
        </Button>
        <Link href="/posts" className="hover:text-foreground transition-colors">
          Posts
        </Link>
        <span>/</span>
        <span className="text-foreground">{post.title}</span>
      </div>

      {/* Title */}
      <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
        {post.title}
      </h1>

      {/* Description */}
      {post.description && (
        <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
          {post.description}
        </p>
      )}

      {/* Meta info */}
      <PostAuthor />
      <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          <span>
            {new Date(post.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
        {post.feature && (
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Featured
          </Badge>
        )}
      </div>

      {/* Tags */}
      {post.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostInfo;
