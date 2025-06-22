"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { MainLayout } from "@/components/layout/main-layout";
import { 
  ArrowRight, 
  Code, 
  FileText, 
  Star, 
  Users, 
  Shield, 
  Zap,
  Github,
  ExternalLink,
  Calendar,
  Loader2,
  User
} from "lucide-react";
import Link from "next/link";

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

const features = [
  {
    icon: Shield,
    title: "Secure Authentication",
    description: "Enterprise-grade security with OAuth, email verification, and role-based access control"
  },
  {
    icon: Code,
    title: "Code Editor",
    description: "Full-featured online code editor with syntax highlighting and real-time collaboration"
  },
  {
    icon: Users,
    title: "User Management",
    description: "Comprehensive user management system with profiles, permissions, and activity tracking"
  },
  {
    icon: Zap,
    title: "Fast Performance",
    description: "Optimized for speed with server-side rendering and efficient database queries"
  }
];

export default function Home() {
  const [featuredPosts, setFeaturedPosts] = useState<Post[]>([]);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch posts
        const postsResponse = await fetch('/api/posts');
        const postsData = await postsResponse.json();
        // Fetch projects
        const projectsResponse = await fetch('/api/projects/public');
        const projectsData = await projectsResponse.json();
        setFeaturedPosts(postsData.slice(0, 3));
        setFeaturedProjects(projectsData.slice(0, 3));
      } catch (err) {
        setError('Failed to load content');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getLikeCount = (likes: { value: number }[]) => likes.filter(like => like.value === 1).length;
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="text-muted-foreground">Loading content...</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-red-500">{error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-background via-background to-muted/20">
        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <Badge variant="secondary" className="px-4 py-2 text-sm">🚀 Welcome to My Portfolio</Badge>
              <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">Full-Stack Developer & <span className="text-primary block">Open Source Creator</span></h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">I build modern web applications with cutting-edge technologies. From authentication systems to code editors, I create solutions that developers love.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild><Link href="/projects">Explore Projects<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="/posts">Read Blog<FileText className="ml-2 h-4 w-4" /></Link></Button>
            </div>
            <div className="flex justify-center items-center gap-8 pt-8">
              <div className="text-center"><div className="text-2xl font-bold text-primary">{featuredProjects.length}+</div><div className="text-sm text-muted-foreground">Projects</div></div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center"><div className="text-2xl font-bold text-primary">{featuredPosts.length}+</div><div className="text-sm text-muted-foreground">Articles</div></div>
              <Separator orientation="vertical" className="h-8" />
              <div className="text-center"><div className="text-2xl font-bold text-primary">10k+</div><div className="text-sm text-muted-foreground">Downloads</div></div>
            </div>
          </div>
        </div>
      </section>
      {/* Features Section */}
      <section className="py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold">Why Choose My Solutions?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">Built with modern technologies and best practices for optimal performance and developer experience</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center border-0 shadow-lg bg-background/50 backdrop-blur-sm">
                <CardHeader><div className="mx-auto w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4"><feature.icon className="h-6 w-6 text-primary" /></div><CardTitle className="text-lg">{feature.title}</CardTitle></CardHeader>
                <CardContent><CardDescription className="text-sm leading-relaxed">{feature.description}</CardDescription></CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
      {/* Featured Projects Section */}
      {featuredProjects.length > 0 && (
        <section className="py-24">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div><h2 className="text-3xl lg:text-4xl font-bold mb-4">Featured Projects</h2><p className="text-lg text-muted-foreground">Explore my latest projects and code solutions</p></div>
              <Button variant="outline" asChild><Link href="/projects">View All<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProjects.map((project) => (
                <Card key={project.id} className="group hover:shadow-xl transition-all duration-300 overflow-hidden">
                  <div className="aspect-video bg-muted relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" /><div className="absolute inset-0 flex items-center justify-center"><Code className="h-16 w-16 text-muted-foreground/50" /></div></div>
                  <CardHeader><div className="flex items-start justify-between"><div className="space-y-2"><CardTitle className="text-xl group-hover:text-primary transition-colors">{project.name}</CardTitle><CardDescription className="line-clamp-2">{project.description || "No description available"}</CardDescription></div><Badge variant={project.isFree ? "secondary" : "default"}>{project.isFree ? "Free" : `${project.coinCost} coins`}</Badge></div></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground"><FileText className="h-4 w-4" />{project.files.length} files</div>
                    {project.owner && <div className="flex items-center gap-2 text-sm text-muted-foreground"><User className="h-4 w-4" />{project.owner.name}</div>}
                    <Button className="w-full" asChild><Link href={`/projects/${project.id}`}>View Project<ExternalLink className="ml-2 h-4 w-4" /></Link></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* Featured Posts Section */}
      {featuredPosts.length > 0 && (
        <section className="py-24 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-12">
              <div><h2 className="text-3xl lg:text-4xl font-bold mb-4">Latest Articles</h2><p className="text-lg text-muted-foreground">Insights, tutorials, and thoughts on modern web development</p></div>
              <Button variant="outline" asChild><Link href="/posts">View All<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredPosts.map((post) => (
                <Card key={post.id} className="group hover:shadow-xl transition-all duration-300">
                  <CardHeader><div className="flex items-start justify-between mb-4"><div className="flex items-center gap-3"><Avatar className="h-8 w-8"><AvatarImage src={post.author.image} alt={post.author.name} /><AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback></Avatar><div className="text-sm"><div className="font-medium">{post.author.name}</div><div className="text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" />{formatDate(post.createdAt)}</div></div></div></div><CardTitle className="text-xl group-hover:text-primary transition-colors line-clamp-2">{post.title}</CardTitle><CardDescription className="line-clamp-3">{post.description || "No description available"}</CardDescription></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground"><div className="flex items-center gap-1"><Star className="h-4 w-4" />{getLikeCount(post.likes)} likes</div></div>
                    {post.tags && post.tags.length > 0 && (<div className="flex flex-wrap gap-2">{post.tags.slice(0, 3).map((tag) => (<Badge key={tag} variant="outline" className="text-xs">{tag}</Badge>))}</div>)}
                    <Button variant="ghost" className="w-full" asChild><Link href={`/posts/${post.id}`}>Read More<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}
      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl lg:text-4xl font-bold">Ready to Build Something Amazing?</h2>
            <p className="text-lg text-muted-foreground">Join thousands of developers who are already using my solutions to build better applications.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild><Link href="/register">Get Started<ArrowRight className="ml-2 h-4 w-4" /></Link></Button>
              <Button size="lg" variant="outline" asChild><Link href="https://github.com/yourusername" target="_blank"><Github className="mr-2 h-4 w-4" />View on GitHub</Link></Button>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
} 