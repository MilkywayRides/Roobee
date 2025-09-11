"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MainLayout } from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { BackgroundGradientAnimation } from "@/components/animations/background-gradient-animation";
import {
  ArrowRight,
  Code,
  Star,
  BookOpen
} from "lucide-react";
import Link from "next/link";
import { PlaceholdersAndVanishInput } from "@/components/ui/placeholders-and-vanish-input";


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

// --- MAIN HOME COMPONENT ---
export default function Home() {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async (retryCount = 0) => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching data from API...');

        const postsResponse = await fetch('/api/posts');

        // If response is not OK, retry up to 3 times
        if (!postsResponse.ok && retryCount < 3) {
          console.log(`Retrying request (attempt ${retryCount + 1}/3)...`);
          setTimeout(() => fetchData(retryCount + 1), 1000 * (retryCount + 1));
          return;
        }

        const postsData = await postsResponse.json();

        console.log('Successfully fetched data:', {
          postsCount: postsData.length
        });

        setFeaturedPosts(postsData.slice(0, 3));
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
        console.error('Error fetching data:', err);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLikeCount = (likes: { value: number }[]) => likes.filter(like => like.value === 1).length;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  // If there's an error, we'll just show the loading state
  if (error) {
    console.error('Failed to load content:', error);
  }

  const placeholders = [
    "What's the first rule of Fight Club?",
    "Who is Tyler Durden?",
    "Where is Andrew Laeddis Hiding?",
    "Write a Javascript method to reverse a string",
    "How to assemble your own PC?",
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
  };
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submitted");
  };

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-4 sm:py-8 flex flex-col items-center px-4 sm:px-6 md:px-12">
        <div
          className="relative flex items-center justify-center w-full min-h-[400px] h-[400px] md:min-h-[550px] rounded-[20px] sm:rounded-[30px] overflow-hidden"
        >
          <BackgroundGradientAnimation containerClassName="absolute inset-0 w-full h-full" interactive={false} />
          <div className="absolute inset-0 flex flex-col items-center justify-center w-full h-full z-10 space-y-6 px-4">
            <p className="bg-clip-text text-transparent drop-shadow-2xl bg-gradient-to-b from-white/80 to-white/20 
        text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-bold text-center max-w-2xl">
              The Future of Development
            </p>
            <div className="w-full max-w-lg">
              <PlaceholdersAndVanishInput
                placeholders={placeholders}
                onChange={handleChange}
                onSubmit={onSubmit}
              />
            </div>
          </div>
        </div>
      </section>



      {/* Featured Posts Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Latest Articles</h2>
            <p className="text-muted-foreground mt-2">Insights and tutorials on modern web development.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <PostCardSkeleton key={i} />)
              : featuredPosts.length > 0
                ? featuredPosts.map((post) => (
                  <Card key={post.id} className="group flex flex-col hover:border-primary/80 transition-all duration-300">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={post.author.image} alt={post.author.name} />
                          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{post.author.name}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(post.createdAt)}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-grow">
                      <CardTitle className="text-xl mb-2 line-clamp-2">{post.title}</CardTitle>
                      <div className="flex flex-wrap gap-2 my-3">
                        {post.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </CardContent>
                    <div className="p-6 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {getLikeCount(post.likes)}
                      </div>
                      <Button variant="ghost" size="sm" asChild className="group-hover:bg-primary/10">
                        <Link href={`/posts/${post.id}`}>
                          Read More <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </Card>
                ))
                : (
                  <div className="col-span-full text-center py-12">
                    <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No articles yet</h3>
                    <p className="text-muted-foreground mb-4">Check back soon for new content!</p>
                    <Button asChild>
                      <Link href="/posts">Browse All Articles</Link>
                    </Button>
                  </div>
                )
            }
          </div>
        </div>
      </section>

    </MainLayout>
  );
} 