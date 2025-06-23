"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ExtendedSession } from "@/types";
import { ArrowLeft, ArrowRight, Calendar, User, ThumbsUp, ThumbsDown, UserPlus } from "lucide-react";
import Link from "next/link";
import { CodeBlock } from "@/components/ui/code-block";
import { Children, isValidElement } from "react";

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
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
            <Link href="/posts" className="hover:text-foreground transition-colors">
              Posts
            </Link>
            <span>/</span>
            <span className="text-foreground">{post.title}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-foreground mb-4 leading-tight">
            {post.title}
          </h1>
          
          {post.description && (
            <p className="text-xl text-muted-foreground mb-6 leading-relaxed">
              {post.description}
            </p>
          )}

          {/* Meta information */}
          <div className="flex items-center gap-6 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author?.name || "Unknown Author"}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.createdAt).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            {post.feature && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                Featured
              </Badge>
            )}
          </div>

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="prose prose-neutral dark:prose-invert max-w-none mb-12 [&>*]:mb-4 [&>*:last-child]:mb-0">
          <ReactMarkdown
            components={{
              h1: ({ children }) => (
                <h1 className="text-3xl font-bold text-foreground border-b border-border pb-2 mb-6">
                  {children}
                </h1>
              ),
              h2: ({ children }) => (
                <h2 className="text-2xl font-semibold text-foreground border-b border-border pb-2 mb-5">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="text-xl font-semibold text-foreground mb-4">
                  {children}
                </h3>
              ),
              h4: ({ children }) => (
                <h4 className="text-lg font-semibold text-foreground mb-3">
                  {children}
                </h4>
              ),
              h5: ({ children }) => (
                <h5 className="text-base font-semibold text-foreground mb-3">
                  {children}
                </h5>
              ),
              h6: ({ children }) => (
                <h6 className="text-sm font-semibold text-foreground mb-3">
                  {children}
                </h6>
              ),
              p: ({ children }) => (
                <p className="text-foreground leading-relaxed mb-4">
                  {children}
                </p>
              ),
              ul: ({ children }) => (
                <ul className="list-disc list-inside text-foreground mb-4 space-y-2">
                  {children}
                </ul>
              ),
              ol: ({ children }) => (
                <ol className="list-decimal list-inside text-foreground mb-4 space-y-2">
                  {children}
                </ol>
              ),
              li: ({ children }) => (
                <li className="text-foreground">
                  {children}
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-primary bg-muted/50 pl-4 py-2 mb-4 italic text-muted-foreground">
                  {children}
                </blockquote>
              ),
              pre: (props) => {
                const {node, children, ...rest} = props;
                const codeChild = Children.toArray(children).find(child => isValidElement(child) && child.type === 'code') as React.ReactElement | undefined;
                
                if (codeChild) {
                    const language = (codeChild.props.className || '').replace('language-', '') || 'text';
                    const fileName = codeChild.props.node?.data?.meta as string | undefined;
                    const codeString = codeChild.props.children;
                    return (
                      <CodeBlock
                        language={language}
                        fileName={fileName}
                        className="mb-4"
                      >
                        {String(codeString).replace(/\n$/, '')}
                      </CodeBlock>
                    );
                }
                
                return <pre className="bg-muted border border-border rounded-lg p-4 overflow-x-auto mb-4" {...rest}>{children}</pre>;
              },
              code: ({inline, className, children, ...props}) => {
                if (inline) {
                    return <code {...props} className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono text-foreground">{children}</code>
                }
                return <code {...props} className={className}>{children}</code>
              },
              a: ({ href, children }) => (
                <a 
                  href={href} 
                  className="text-primary hover:text-primary/80 underline underline-offset-2 transition-colors"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {children}
                </a>
              ),
              strong: ({ children }) => (
                <strong className="font-bold text-foreground">
                  {children}
                </strong>
              ),
              em: ({ children }) => (
                <em className="italic text-foreground">
                  {children}
                </em>
              ),
              hr: () => (
                <hr className="border-border my-8" />
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto mb-4">
                  <table className="w-full border-collapse border border-border">
                    {children}
                  </table>
                </div>
              ),
              thead: ({ children }) => (
                <thead className="bg-muted">
                  {children}
                </thead>
              ),
              tbody: ({ children }) => (
                <tbody>
                  {children}
                </tbody>
              ),
              tr: ({ children }) => (
                <tr className="border-b border-border">
                  {children}
                </tr>
              ),
              th: ({ children }) => (
                <th className="border border-border px-4 py-2 text-left font-semibold text-foreground">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-border px-4 py-2 text-foreground">
                  {children}
                </td>
              ),
              img: ({ src, alt }) => (
                <img 
                  src={src} 
                  alt={alt} 
                  className="max-w-full h-auto rounded-lg border border-border my-4"
                />
              ),
            }}
          >
            {post.markdown}
          </ReactMarkdown>
        </div>

        {/* Author section */}
        <div className="border-t border-border pt-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author?.image || undefined} alt={post.author?.name || "Author"} />
                <AvatarFallback>{post.author?.name?.[0] || "U"}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold text-foreground">{post.author?.name || "Unknown Author"}</h3>
                <p className="text-sm text-muted-foreground">Author</p>
              </div>
            </div>
            {session?.user && post && typeof session.user.id === "string" && post.author?.id !== session.user.id && (
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

        {/* Interaction buttons */}
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

        {/* Navigation */}
        <div className="border-t border-border pt-8">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={!post.prevPost}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              {post.prevPost ? "Previous Post" : "No Previous"}
            </Button>
            <Button
              variant="outline"
              onClick={handleNext}
              disabled={!post.nextPost}
              className="flex items-center gap-2"
            >
              {post.nextPost ? "Next Post" : "No Next"}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          {post.prevPost && (
            <div className="mt-2 text-sm text-muted-foreground">
              ← {post.prevPost.title}
            </div>
          )}
          {post.nextPost && (
            <div className="mt-2 text-sm text-muted-foreground text-right">
              {post.nextPost.title} →
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 