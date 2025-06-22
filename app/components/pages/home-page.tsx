"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MainLayout } from "@/components/layout/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  ArrowRight, 
  Code, 
  Star, 
  BookOpen
} from "lucide-react";
import Link from "next/link";

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

interface Project {
  id: string;
  name: string;
  description?: string;
  isFree: boolean;
  coinCost?: number;
  files: { 
    id: string; 
    fileName: string; 
    fileSize: number; 
    appwriteId: string; 
  }[];
  owner?: {
    name: string;
    email: string;
    image: string;
  };
}

// --- SKELETON COMPONENTS ---
const ProjectCardSkeleton = () => (
  <Card className="flex flex-col h-full">
    <CardHeader>
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-1/2" />
    </CardHeader>
    <CardContent className="flex-grow">
      <Skeleton className="h-10 w-full" />
    </CardContent>
    <div className="p-6 pt-0 flex justify-between items-center">
      <Skeleton className="h-4 w-1/4" />
      <Skeleton className="h-9 w-1/3" />
    </div>
  </Card>
);

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
export function HomePage() {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [postsResponse, projectsResponse] = await Promise.all([
          fetch('/api/posts'),
          fetch('/api/projects/public')
        ]);

        if (!postsResponse.ok || !projectsResponse.ok) {
          throw new Error('Failed to fetch data');
        }

        const postsData = await postsResponse.json();
        const projectsData = await projectsResponse.json();
        
        setFeaturedPosts(postsData.slice(0, 3));
        setFeaturedProjects(projectsData.slice(0, 3));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getLikeCount = (likes: { value: number }[]) => likes.filter(like => like.value === 1).length;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-semibold text-destructive mb-4">Oops! Something went wrong.</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <Badge variant="outline" className="mb-6 py-2 px-4 rounded-full text-sm">
            <Star className="w-4 h-4 mr-2 text-yellow-400" />
            <span>Build, Share, Innovate</span>
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tighter mb-6">
            <span className="bg-gradient-to-r from-primary via-purple-500 to-pink-500 text-transparent bg-clip-text">
              Modern Solutions
            </span>
            <br />
            for Creative Developers
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
            Discover powerful tools, open-source projects, and insightful articles to accelerate your development workflow and bring your ideas to life.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/projects">
                Explore Projects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/posts">
                Read The Blog <BookOpen className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight">Featured Projects</h2>
            <p className="text-muted-foreground mt-2">A glimpse into my latest work and creations.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading 
              ? Array.from({ length: 3 }).map((_, i) => <ProjectCardSkeleton key={i} />)
              : featuredProjects.map((project) => (
                <Card key={project.id} className="group flex flex-col hover:border-primary/80 transition-all duration-300">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Code className="w-8 h-8 text-primary" />
                      <Badge variant={project.isFree ? "secondary" : "default"}>
                        {project.isFree ? "Free" : `${project.coinCost} Coins`}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <CardTitle className="text-xl mb-2">{project.name}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {project.description || "No description available."}
                    </CardDescription>
                  </CardContent>
                  <div className="p-6 pt-0 flex justify-between items-center text-sm text-muted-foreground">
                    <span>{project.files.length} files</span>
                    <Button variant="ghost" size="sm" asChild className="group-hover:bg-primary/10">
                       <Link href={`/projects/${project.id}`}>
                         View Project <ArrowRight className="ml-2 h-4 w-4" />
                       </Link>
                    </Button>
                  </div>
                </Card>
              ))
            }
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
              : featuredPosts.map((post) => (
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
            }
          </div>
        </div>
      </section>

    </MainLayout>
  );
} 