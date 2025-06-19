"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";

interface Project {
  id: string;
  name: string;
  description?: string;
  isFree: boolean;
  coinCost?: number;
  files: { id: string }[];
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/projects/all")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete project");
      }
      setProjects((prev) => prev.filter((p) => p.id !== id));
      toast.success("Project deleted");
    } catch (err: any) {
      toast.error(err.message || "Failed to delete project");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8 px-2 md:px-0">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b mb-6 flex items-center justify-between py-4 px-2 md:px-6">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Projects</h1>
        <Button asChild>
          <Link href="/admin/projects/create">New Project</Link>
        </Button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : projects.length === 0 ? (
        <div className="text-center text-muted-foreground py-16">No projects found.</div>
      ) : (
        <ul className="space-y-3">
          {projects.map((project) => (
            <li key={project.id}>
              <Card className="border shadow-sm hover:shadow-md transition-shadow group">
                <CardContent className="py-4 px-5 flex flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Link
                        href={`/admin/projects/${project.id}`}
                        className="font-semibold text-base text-blue-600 hover:underline truncate max-w-[14rem]"
                      >
                        {project.name}
                      </Link>
                      {!project.isFree && (
                        <Badge variant="secondary" className="text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                          {project.coinCost} coins
                        </Badge>
                      )}
                      {project.isFree && (
                        <Badge variant="outline" className="text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                          Free
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="text-xs px-3"
                      >
                        <Link href={`/admin/projects/${project.id}`}>View</Link>
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        asChild
                        className="text-xs px-3"
                      >
                        <Link href={`/admin/projects/${project.id}/edit`}>Edit</Link>
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="text-xs px-3"
                        disabled={deletingId === project.id}
                        onClick={() => handleDelete(project.id)}
                      >
                        {deletingId === project.id ? "Deleting..." : "Delete"}
                      </Button>
                    </div>
                  </div>
                  <div className="text-muted-foreground text-sm mt-1 min-h-[1.5rem]">
                    {project.description || <span className="italic text-xs">No description</span>}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>Files: {project.files.length}</span>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 