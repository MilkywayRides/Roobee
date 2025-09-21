"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Project } from "@/types/project";
import { Search, Plus, Github, Edit, Trash2, Eye, BarChart3 } from "lucide-react";

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = projects.filter((project) => 
        project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [projects, searchQuery]);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      fetchProjects();
    } catch (error) {
      console.error("Error deleting project:", error);
    } finally {
      setDeletingId(null);
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "free":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Free</Badge>;
      case "paid":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Paid</Badge>;
      case "premium":
        return <Badge variant="secondary" className="bg-purple-100 text-purple-800">Premium</Badge>;
      default:
        return <Badge variant="outline">{category}</Badge>;
    }
  };

  const getStats = () => {
    const total = projects.length;
    const free = projects.filter(p => p.category === "free").length;
    const paid = projects.filter(p => p.category === "paid").length;
    const premium = projects.filter(p => p.category === "premium").length;
    return { total, free, paid, premium };
  };

  const stats = getStats();

  const TableSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total</span>
            </div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-green-500 rounded-full" />
              <span className="text-sm text-muted-foreground">Free</span>
            </div>
            <div className="text-2xl font-bold">{stats.free}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-yellow-500 rounded-full" />
              <span className="text-sm text-muted-foreground">Paid</span>
            </div>
            <div className="text-2xl font-bold">{stats.paid}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 bg-purple-500 rounded-full" />
              <span className="text-sm text-muted-foreground">Premium</span>
            </div>
            <div className="text-2xl font-bold">{stats.premium}</div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <CardTitle>Projects Management</CardTitle>
            <Button asChild>
              <Link href="/admin/projects/import">
                <Github className="h-4 w-4 mr-2" />
                Import from GitHub
              </Link>
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>GitHub Repo</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableSkeleton key={i} />
                ))}
              </TableBody>
            </Table>
          ) : filteredProjects.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-muted-foreground mb-4">
                {searchQuery ? "No projects found matching your search" : "No projects found"}
              </div>
              {searchQuery ? (
                <Button variant="outline" onClick={() => setSearchQuery("")}>
                  Clear search
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/admin/projects/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first project
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>GitHub Repo</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{getCategoryBadge(project.category)}</TableCell>
                    <TableCell>
                      {project.price ? `${project.price} coins` : "Free"}
                    </TableCell>
                    <TableCell>
                      {project.githubRepo ? (
                        <Link 
                          href={project.githubRepo} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Github className="h-3 w-3" />
                          Repository
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">No repository</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/projects/${project.id}`}>
                            <Eye className="h-3 w-3" />
                          </Link>
                        </Button>
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/admin/projects/edit/${project.id}`}>
                            <Edit className="h-3 w-3" />
                          </Link>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Project</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete "{project.name}"? This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(project.id)}
                                disabled={deletingId === project.id}
                              >
                                {deletingId === project.id ? "Deleting..." : "Delete"}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
