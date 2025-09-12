"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MainLayout } from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Star, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

// --- TYPE DEFINITIONS ---
interface Post {
  id: string;
  title: string;
  description?: string;
  author: {
    id: string;
    name: string;
    image: string;
  };
  createdAt: string;
  likes: { value: number }[];
  tags: string[];
}

// --- SKELETON COMPONENTS ---

const PostCardSkeleton = () => (
  <Card className="flex flex-col h-full">
    <CardHeader>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-grow space-y-2">
          <Skeleton className="h-4 w-3/5" />
          <Skeleton className="h-3 w-2/5" />
        </div>
      </div>
    </CardHeader>
    <CardContent className="flex-grow space-y-3">
      <Skeleton className="h-5 w-full" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-full" />
    </CardContent>
    <div className="p-6 pt-0 flex justify-between items-center">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-4 w-1/3" />
    </div>
  </Card>
);

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q");
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      const fetchResults = async () => {
        setLoading(true);
        try {
          const response = await fetch(`/api/posts?q=${encodeURIComponent(query)}`);
          const data = await response.json();
          setPosts(data);
        } catch (error) {
          console.error("Search failed", error);
        } finally {
          setLoading(false);
        }
      };
      fetchResults();
    }
  }, [query]);

  const getLikeCount = (likes: { value: number }[]) =>
    likes.filter((like) => like.value === 1).length;
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <MainLayout>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Search Results</h2>
            <p className="text-muted-foreground mt-2">
              {loading ? "Loading..." : `Found ${posts.length} results for "${query}"`}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
              : posts.length > 0
              ? posts.map((post) => (
                  <Card
                    key={post.id}
                    className="group flex flex-col hover:border-primary/80 transition-all duration-300"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={post.author.image}
                            alt={post.author.name}
                          />
                          <AvatarFallback>
                            {post.author.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{post.author.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDate(post.createdAt)}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardTitle className="text-xl mb-2 line-clamp-2">
                        {post.title}
                      </CardTitle>
                      <div className="flex flex-wrap gap-2 my-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                    <div className="p-6 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {getLikeCount(post.likes)}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="group-hover:bg-primary/10"
                      >
                        <Link href={`/posts/${post.id}`}>
                          Read More <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))
              : (
                <div className="col-span-full text-center py-12">
                  <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No results found</h3>
                  <p className="text-muted-foreground mb-4">
                    Try a different search term.
                  </p>
                </div>
              )}
          </div>
        </div>
      </section>
    </MainLayout>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResults />
    </Suspense>
  );
}
