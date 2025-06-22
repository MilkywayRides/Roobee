"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { MainLayout } from "@/components/layout/main-layout";

interface Project {
  id: string;
  name: string;
  description?: string;
  isFree: boolean;
  coinCost?: number;
  files: { id: string }[];
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();

  useEffect(() => {
    fetch("/api/projects/public")
      .then((res) => res.json())
      .then((data) => setProjects(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <MainLayout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">Projects</h1>
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
                  {project.isFree ? (
                    <Button asChild size="sm" className="mt-2">
                      <Link href={`/projects/${project.id}`}>View Project</Link>
                    </Button>
                  ) : session?.user ? (
                    <Button asChild size="sm" className="mt-2">
                      <Link href={`/projects/${project.id}`}>Unlock with Coins</Link>
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Sign in to unlock</span>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
} 