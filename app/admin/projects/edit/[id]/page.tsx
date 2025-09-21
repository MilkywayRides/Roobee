"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project } from "@/types/project";
import { notFound } from "next/navigation";
import { ArrowLeft, Edit, Github, Coins, Eye } from "lucide-react";
import Link from "next/link";

export default function EditProjectPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<"free" | "paid" | "premium">("free");
  const [price, setPrice] = useState("");
  const [githubRepo, setGithubRepo] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalProject, setOriginalProject] = useState<Project | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const res = await fetch(`/api/projects/${params.id}`);
        if (!res.ok) {
          notFound();
        }
        const data = await res.json();
        setOriginalProject(data);
        setName(data.name);
        setDescription(data.description || "");
        setCategory(data.category);
        setPrice(data.price?.toString() || "");
        setGithubRepo(data.githubRepo || "");
      } catch (error) {
        console.error("Error fetching project:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [params.id]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) {
      newErrors.name = "Project name is required";
    }
    
    if (!description.trim()) {
      newErrors.description = "Project description is required";
    }
    
    if (category !== "free" && (!price || Number(price) <= 0)) {
      newErrors.price = "Price must be greater than 0 for paid/premium projects";
    }
    
    if (githubRepo && !isValidGitHubUrl(githubRepo)) {
      newErrors.githubRepo = "Please enter a valid GitHub repository URL";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const isValidGitHubUrl = (url: string) => {
    const githubUrlPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
    return githubUrlPattern.test(url);
  };

  const hasChanges = () => {
    if (!originalProject) return false;
    return (
      name !== originalProject.name ||
      description !== (originalProject.description || "") ||
      category !== originalProject.category ||
      price !== (originalProject.price?.toString() || "") ||
      githubRepo !== (originalProject.githubRepo || "")
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSaving(true);
    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          price: category === "free" ? undefined : Number(price),
          githubRepo: githubRepo.trim() || undefined,
        }),
      });
      
      if (res.ok) {
        router.push("/admin/projects");
      } else {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update project");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Failed to update project. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const getCategoryInfo = (cat: string) => {
    switch (cat) {
      case "free":
        return { color: "bg-green-100 text-green-800", description: "Available to all users at no cost" };
      case "paid":
        return { color: "bg-yellow-100 text-yellow-800", description: "Requires payment to access" };
      case "premium":
        return { color: "bg-purple-100 text-purple-800", description: "Premium content with advanced features" };
      default:
        return { color: "bg-gray-100 text-gray-800", description: "" };
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-10 w-32" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost">
          <Link href="/admin/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground">Update project details and settings</p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/projects/${params.id}`}>
            <Eye className="h-4 w-4 mr-2" />
            View Project
          </Link>
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="h-5 w-5" />
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Project Name *</Label>
                  <Input 
                    id="name" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter project name"
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe your project..."
                    rows={4}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select onValueChange={(value: "free" | "paid" | "premium") => setCategory(value)} value={category}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-green-500 rounded-full" />
                          Free
                        </div>
                      </SelectItem>
                      <SelectItem value="paid">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-yellow-500 rounded-full" />
                          Paid
                        </div>
                      </SelectItem>
                      <SelectItem value="premium">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 bg-purple-500 rounded-full" />
                          Premium
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    {getCategoryInfo(category).description}
                  </p>
                </div>
                
                {category !== "free" && (
                  <div className="space-y-2">
                    <Label htmlFor="price" className="flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      Price (coins) *
                    </Label>
                    <Input 
                      id="price" 
                      type="number" 
                      value={price} 
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="Enter price in coins"
                      min="1"
                      className={errors.price ? "border-red-500" : ""}
                    />
                    {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                  </div>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="githubRepo" className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub Repository (optional)
                  </Label>
                  <Input 
                    id="githubRepo" 
                    value={githubRepo} 
                    onChange={(e) => setGithubRepo(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className={errors.githubRepo ? "border-red-500" : ""}
                  />
                  {errors.githubRepo && <p className="text-sm text-red-500">{errors.githubRepo}</p>}
                  <p className="text-sm text-muted-foreground">
                    Link to the GitHub repository for this project
                  </p>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button type="submit" disabled={saving || !hasChanges()}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => router.back()}>
                    Cancel
                  </Button>
                </div>
                
                {!hasChanges() && (
                  <p className="text-sm text-muted-foreground">
                    No changes detected
                  </p>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">{name || "Project Name"}</h3>
                  <Badge className={getCategoryInfo(category).color}>
                    {category === "free" ? "Free" : `${price || 0} coins`}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {description || "Project description will appear here..."}
                </p>
              </div>
              
              {githubRepo && (
                <div className="flex items-center gap-2 text-sm">
                  <Github className="h-4 w-4" />
                  <span className="text-blue-600">GitHub Repository</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {originalProject && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Original Values</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Name:</span> {originalProject.name}
                </div>
                <div>
                  <span className="font-medium">Category:</span> {originalProject.category}
                </div>
                {originalProject.price && (
                  <div>
                    <span className="font-medium">Price:</span> {originalProject.price} coins
                  </div>
                )}
                {originalProject.githubRepo && (
                  <div>
                    <span className="font-medium">GitHub:</span> 
                    <Link href={originalProject.githubRepo} className="text-blue-600 hover:underline ml-1" target="_blank">
                      Repository
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}