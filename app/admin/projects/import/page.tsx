"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Github, Star, GitFork, Calendar, Search, ArrowLeft, Lock, Globe } from "lucide-react";
import Link from "next/link";

interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  language: string | null;
  private: boolean;
}

export default function ImportProjectPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [filteredRepos, setFilteredRepos] = useState<GitHubRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<GitHubRepo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [category, setCategory] = useState<"free" | "paid" | "premium">("free");
  const [price, setPrice] = useState<number>(0);
  const [customDescription, setCustomDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [authAttempted, setAuthAttempted] = useState(false);

  const fetchRepos = async () => {
    if (status !== "authenticated") return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("/api/github/repos");
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data: GitHubRepo[] = await response.json();
      setRepos(data);
      setFilteredRepos(data);
    } catch (error) {
      console.error("Error fetching repos:", error);
      setError("Failed to fetch repositories. Please try reconnecting to GitHub.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchRepos();
    }
  }, [status]);

  useEffect(() => {
    if (searchQuery) {
      const filtered = repos.filter((repo) => 
        repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.full_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRepos(filtered);
    } else {
      setFilteredRepos(repos);
    }
  }, [repos, searchQuery]);

  useEffect(() => {
    if (selectedRepo) {
      setCustomDescription(selectedRepo.description || "");
    }
  }, [selectedRepo]);

  const handleConnect = () => {
    setAuthAttempted(true);
    signIn("github", { 
      callbackUrl: "/admin/projects/import",
      redirect: true 
    });
  };

  // Auto-authenticate if not authenticated
  useEffect(() => {
    if (status === "unauthenticated" && !authAttempted) {
      setTimeout(() => handleConnect(), 100);
    }
  }, [status, authAttempted]);

  const handleImport = async () => {
    if (!selectedRepo || !session?.user?.email) return;
    
    setImporting(true);
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: selectedRepo.name,
          description: customDescription || selectedRepo.description || "",
          category,
          price: category !== "free" ? price : undefined,
          githubRepo: selectedRepo.html_url,
        }),
      });
      
      if (res.ok) {
        router.push("/admin/projects");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to import project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert(error instanceof Error ? error.message : "Failed to import project. Please try again.");
    } finally {
      setImporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Debug info
  console.log("Session status:", status);
  console.log("Session data:", session);
  console.log("Access token:", session?.accessToken);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost">
          <Link href="/admin/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Import from GitHub</h1>
          <p className="text-muted-foreground">Import repositories from your GitHub account</p>
        </div>
      </div>
      
      {status !== "authenticated" ? (
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Github className="h-6 w-6" />
            </div>
            <CardTitle>Connect to GitHub</CardTitle>
            <p className="text-sm text-muted-foreground">
              Connect your GitHub account to import your repositories
            </p>
          </CardHeader>
          <CardContent>
            <Button onClick={handleConnect} className="w-full">
              <Github className="h-4 w-4 mr-2" />
              Connect GitHub Account
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Your Repositories</CardTitle>
                <Button variant="outline" size="sm" onClick={fetchRepos} disabled={loading}>
                  {loading ? "Refreshing..." : "Refresh"}
                </Button>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search repositories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardHeader>
            <CardContent className="max-h-96 overflow-y-auto space-y-2">
              {error ? (
                <div className="text-center py-8">
                  <p className="text-red-500 mb-4">{error}</p>
                  <Button variant="outline" onClick={handleConnect}>
                    Reconnect to GitHub
                  </Button>
                </div>
              ) : loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <Skeleton className="h-5 w-3/4" />
                          <Skeleton className="h-4 w-full" />
                          <div className="flex gap-4">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredRepos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchQuery ? "No repositories found matching your search" : "No repositories found"}
                </div>
              ) : (
                filteredRepos.map((repo) => (
                  <Card 
                    key={repo.id} 
                    className={`cursor-pointer transition-all hover:shadow-md ${
                      selectedRepo?.id === repo.id ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted/50"
                    }`}
                    onClick={() => setSelectedRepo(repo)}
                  >
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {repo.private ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                            <h3 className="font-medium">{repo.name}</h3>
                          </div>
                          <Badge variant={repo.private ? "secondary" : "outline"}>
                            {repo.private ? "Private" : "Public"}
                          </Badge>
                        </div>
                        {repo.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {repo.description}
                          </p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          {repo.language && (
                            <span className="flex items-center gap-1">
                              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                              {repo.language}
                            </span>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3" />
                            {repo.stargazers_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <GitFork className="h-3 w-3" />
                            {repo.forks_count}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(repo.updated_at)}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Import Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedRepo ? (
                <>
                  <div className="space-y-2">
                    <Label>Repository</Label>
                    <div className="flex items-center gap-2 p-2 bg-muted rounded">
                      {selectedRepo.private ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                      <span className="font-medium">{selectedRepo.full_name}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Project Name</Label>
                    <Input value={selectedRepo.name} disabled />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea
                      value={customDescription}
                      onChange={(e) => setCustomDescription(e.target.value)}
                      placeholder="Enter project description..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select value={category} onValueChange={(value: "free" | "paid" | "premium") => setCategory(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {category !== "free" && (
                    <div className="space-y-2">
                      <Label>Price (coins)</Label>
                      <Input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        min={1}
                        placeholder="Enter price in coins"
                      />
                    </div>
                  )}
                  
                  <Button 
                    onClick={handleImport} 
                    disabled={importing}
                    className="w-full"
                  >
                    {importing ? "Importing..." : "Import Repository"}
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Github className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a repository to import</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}