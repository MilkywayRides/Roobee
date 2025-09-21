"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Folder, FileText, Star, GitFork, Eye, Calendar } from "lucide-react";
import Link from "next/link";

interface RepoFile {
  name: string;
  path: string;
  type: "file" | "dir";
  size?: number;
  download_url?: string;
}

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  githubRepo: string;
}

export default function RepoViewer() {
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [files, setFiles] = useState<RepoFile[]>([]);
  const [currentPath, setCurrentPath] = useState("");
  const [loading, setLoading] = useState(true);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  useEffect(() => {
    fetchProject();
  }, [params.id]);

  useEffect(() => {
    if (project?.githubRepo) {
      fetchFiles(currentPath);
    }
  }, [project, currentPath]);

  const fetchProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`);
      const data = await res.json();
      setProject(data);
    } catch (error) {
      console.error("Error fetching project:", error);
    }
  };

  const fetchFiles = async (path: string = "") => {
    if (!project?.githubRepo) return;
    
    setLoading(true);
    try {
      const repoUrl = project.githubRepo.replace("https://github.com/", "");
      const apiUrl = `https://api.github.com/repos/${repoUrl}/contents/${path}`;
      
      const res = await fetch(apiUrl);
      const data = await res.json();
      
      if (Array.isArray(data)) {
        setFiles(data);
        setFileContent(null);
        setSelectedFile(null);
      }
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFileContent = async (file: RepoFile) => {
    if (file.type === "dir") {
      setCurrentPath(file.path);
      return;
    }

    if (!file.download_url) return;
    
    setLoading(true);
    try {
      const res = await fetch(file.download_url);
      const content = await res.text();
      setFileContent(content);
      setSelectedFile(file.name);
    } catch (error) {
      console.error("Error fetching file content:", error);
    } finally {
      setLoading(false);
    }
  };

  const navigateUp = () => {
    const pathParts = currentPath.split("/").filter(Boolean);
    pathParts.pop();
    setCurrentPath(pathParts.join("/"));
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "";
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  if (!project) {
    return <div className="p-8">Loading...</div>;
  }

  if (project.category !== "free") {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Access Restricted</h2>
            <p className="text-muted-foreground mb-4">
              This is a {project.category} project. Purchase access to view the repository.
            </p>
            <Button asChild>
              <Link href={`/projects/${project.id}`}>Back to Project</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <Button asChild variant="ghost" className="mb-4">
          <Link href={`/projects/${project.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Project
          </Link>
        </Button>
        
        <div className="flex items-center gap-4 mb-4">
          <h1 className="text-2xl font-bold">{project.name}</h1>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Free
          </Badge>
        </div>
        
        {project.description && (
          <p className="text-muted-foreground mb-4">{project.description}</p>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-medium">
                    {currentPath ? currentPath : project.name}
                  </span>
                </div>
                {currentPath && (
                  <Button variant="outline" size="sm" onClick={navigateUp}>
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                  </Button>
                )}
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="p-0">
              {loading ? (
                <div className="p-8 text-center">Loading...</div>
              ) : fileContent ? (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-medium">{selectedFile}</h3>
                    <Button variant="outline" size="sm" onClick={() => {
                      setFileContent(null);
                      setSelectedFile(null);
                    }}>
                      Close
                    </Button>
                  </div>
                  <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                    <code>{fileContent}</code>
                  </pre>
                </div>
              ) : (
                <div className="divide-y">
                  {files.map((file) => (
                    <div
                      key={file.path}
                      className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => fetchFileContent(file)}
                    >
                      {file.type === "dir" ? (
                        <Folder className="h-4 w-4 text-blue-600" />
                      ) : (
                        <FileText className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="flex-1 font-medium">{file.name}</span>
                      {file.size && (
                        <span className="text-sm text-muted-foreground">
                          {formatFileSize(file.size)}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Repository Info</h3>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4" />
                <span>Stars: 0</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <GitFork className="h-4 w-4" />
                <span>Forks: 0</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Eye className="h-4 w-4" />
                <span>Watchers: 0</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Updated recently</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h3 className="font-semibold">Actions</h3>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" className="w-full">
                <Link href={project.githubRepo} target="_blank">
                  View on GitHub
                </Link>
              </Button>
              <Button variant="outline" className="w-full">
                Download ZIP
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}