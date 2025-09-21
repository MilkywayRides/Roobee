"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { MainLayout } from "@/components/layout/main-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { notFound } from "next/navigation";
import { Project } from "@/types/project";
import { Github, Download, Star, Eye, Calendar, User, Coins, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProjectDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [userCoins, setUserCoins] = useState<number>(0);
  const [projectId, setProjectId] = useState<string>("");
  const [isPurchased, setIsPurchased] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { id } = await params;
        setProjectId(id);
        
        // Fetch project, user coins, and purchase status in parallel
        const [projectRes, coinsRes, purchaseRes] = await Promise.all([
          fetch(`/api/projects/${id}`),
          fetch('/api/user/coins'),
          fetch(`/api/projects/${id}/purchase-status`)
        ]);
        
        if (!projectRes.ok) {
          notFound();
        }
        
        const projectData = await projectRes.json();
        setProject(projectData);
        
        if (coinsRes.ok) {
          const coinsData = await coinsRes.json();
          setUserCoins(coinsData.coins);
        }
        
        if (purchaseRes.ok) {
          const purchaseData = await purchaseRes.json();
          setIsPurchased(purchaseData.purchased || projectData.category === 'free');
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params]);

  const handlePurchase = async () => {
    if (!project?.price) return;
    
    // Check if user has enough coins
    if (userCoins < project.price) {
      router.push('/upgrade');
      return;
    }
    
    setPurchasing(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/purchase`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await res.json();
      
      if (res.status === 402 && data.needsUpgrade) {
        router.push('/upgrade');
        return;
      }
      
      if (res.ok) {
        setUserCoins(data.remainingCoins);
        setIsPurchased(true);
        alert(`Purchase successful! ${data.coinsDeducted} coins deducted. You now have ${data.remainingCoins} coins remaining.`);
      } else {
        alert(data.error || 'Purchase failed');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Purchase failed. Please try again.');
    } finally {
      setPurchasing(false);
    }
  };

  const getCategoryBadge = (category: string, price?: number) => {
    switch (category) {
      case "free":
        return <Badge variant="secondary" className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">Free</Badge>;
      case "paid":
        return <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200">{price} coins</Badge>;
      case "premium":
        return <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200">{price} coins</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="max-w-4xl mx-auto py-8 px-4">
          <Skeleton className="h-8 w-32 mb-6" />
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-6" />
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  if (!project) {
    return notFound();
  }

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <Button asChild variant="ghost" className="mb-6">
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl mb-2">{project.name}</CardTitle>
                    {getCategoryBadge(project.category, project.price)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  {project.description || "No description available for this project."}
                </p>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Project Details</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span>Recently</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Owner:</span>
                      <span>Project Owner</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Views:</span>
                      <span>1,234</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Stars:</span>
                      <span>42</span>
                    </div>
                  </div>
                </div>
                
                {project.githubRepo && (
                  <>
                    <Separator className="my-6" />
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold">Repository</h3>
                      <Button asChild variant="outline">
                        <Link href={project.githubRepo} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4 mr-2" />
                          View on GitHub
                        </Link>
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Access Project</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {project.category === "free" ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      This project is free to access and use.
                    </p>
                    <Button asChild className="w-full">
                      <Link href={`/projects/${project.id}/repo`}>
                        <Download className="h-4 w-4 mr-2" />
                        Access Repository
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-lg font-semibold">
                        <Coins className="h-5 w-5 text-yellow-500" />
                        {project.price} coins
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Your balance: {userCoins} coins
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">
                      Purchase this project to get full access to all files and documentation.
                    </p>
                    {userCoins < (project.price || 0) ? (
                      <Button 
                        className="w-full" 
                        onClick={() => router.push('/upgrade')}
                        variant="destructive"
                      >
                        <Coins className="h-4 w-4 mr-2" />
                        Insufficient Coins - Upgrade
                      </Button>
                    ) : (
                      isPurchased ? (
                        <Button 
                          asChild
                          className="w-full"
                        >
                          <Link href={`/projects/${project.id}/code`}>
                            View Code
                          </Link>
                        </Button>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={handlePurchase}
                          disabled={purchasing}
                        >
                          {purchasing ? "Processing..." : `Purchase for ${project.price} coins`}
                        </Button>
                      )
                    )}
                  </>
                )}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Features</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                    Complete source code
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                    Documentation included
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                    Regular updates
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 bg-green-500 rounded-full" />
                    Community support
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
