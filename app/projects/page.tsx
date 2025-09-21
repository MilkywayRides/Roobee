"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MainLayout } from "@/components/layout/main-layout";
import { Project } from "@/types/project";
import { Search, Github, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<"all" | "free" | "paid" | "premium">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await fetch("/api/projects");
        const data = await res.json();
        // Handle both old and new API response formats
        const projectsData = Array.isArray(data) ? data : data.projects || [];
        setProjects(projectsData);
        setFilteredProjects(projectsData);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProjects();
  }, []);

  useEffect(() => {
    let filtered = projects;
    
    if (filter !== "all") {
      filtered = filtered.filter((project) => project.category === filter);
    }
    
    if (searchQuery) {
      filtered = filtered.filter((project) => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setFilteredProjects(filtered);
  }, [projects, filter, searchQuery]);

  const getCategoryBadge = (category: string, price?: number) => {
    switch (category) {
      case "free":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Free</Badge>;
      case "paid":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">{price} coins</Badge>;
      case "premium":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">{price} coins</Badge>;
      default:
        return null;
    }
  };

  const ProjectSkeleton = () => (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <Skeleton className="h-9 w-24" />
      </CardContent>
    </Card>
  );

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Projects</h1>
          <p className="text-muted-foreground">Discover and explore our collection of projects</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setFilter("all")} 
              variant={filter === "all" ? "default" : "outline"}
              size="sm"
            >
              All ({projects.length})
            </Button>
            <Button 
              onClick={() => setFilter("free")} 
              variant={filter === "free" ? "default" : "outline"}
              size="sm"
            >
              Free ({projects.filter(p => p.category === "free").length})
            </Button>
            <Button 
              onClick={() => setFilter("paid")} 
              variant={filter === "paid" ? "default" : "outline"}
              size="sm"
            >
              Paid ({projects.filter(p => p.category === "paid").length})
            </Button>
            <Button 
              onClick={() => setFilter("premium")} 
              variant={filter === "premium" ? "default" : "outline"}
              size="sm"
            >
              Premium ({projects.filter(p => p.category === "premium").length})
            </Button>
          </div>
        </div>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <ProjectSkeleton key={i} />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">No projects found</div>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear search
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    {getCategoryBadge(project.category, project.price)}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4 line-clamp-2">
                    {project.description || "No description available"}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    {project.githubRepo && (
                      <div className="flex items-center gap-1">
                        <Github className="h-4 w-4" />
                        <span>GitHub</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Recently updated</span>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button asChild size="sm" className="flex-1">
                      <Link href={`/projects/${project.id}`}>View Details</Link>
                    </Button>
                    {project.githubRepo && (
                      <Button asChild variant="outline" size="sm">
                        <Link href={project.githubRepo} target="_blank" rel="noopener noreferrer">
                          <Github className="h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
