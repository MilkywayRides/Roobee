"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
    <div className="max-w-4xl mx-auto py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Projects</h1>
        <Button asChild>
          <Link href="/admin/projects/create">Create Project</Link>
        </Button>
      </div>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <Card key={project.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>{project.name}</span>
                  {!project.isFree && (
                    <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">{project.coinCost} coins</span>
                  )}
                  {project.isFree && (
                    <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">Free</span>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-muted-foreground mb-2">{project.description}</div>
                <div className="text-xs text-muted-foreground">Files: {project.files.length}</div>
                <div className="flex items-center gap-4 mt-2">
                  <Link href={`/admin/projects/${project.id}`} className="text-blue-600 hover:underline text-sm">View Details</Link>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deletingId === project.id}
                    onClick={() => handleDelete(project.id)}
                  >
                    {deletingId === project.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 