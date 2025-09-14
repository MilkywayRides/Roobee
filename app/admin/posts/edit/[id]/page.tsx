"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditorDemo } from "@/components/tiptap/rich-text-editor";
import { marked } from "marked";
import TurndownService from "turndown";
import { ArrowLeft, Save, X, Tag, FileText, Star, AlertCircle } from "lucide-react";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [tags, setTags] = useState("");
  const [feature, setFeature] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const turndownService = new TurndownService();

  // Parse tags for preview
  const parsedTags = tags.split(",").map(t => t.trim()).filter(Boolean);

  useEffect(() => {
    if (!id) return;

    fetch(`/api/posts/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch post");
        return res.json();
      })
      .then((post) => {
        setTitle(post.title);
        setDescription(post.description || "");
        setMarkdown(post.markdown || "");
        setTags(post.tags?.join(", ") || "");
        setFeature(post.feature || false);
      })
      .catch(() => setError("Failed to load post data"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    try {
      const res = await fetch(`/api/posts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          markdown,
          tags: parsedTags,
          feature,
        }),
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update post");
      }
      
      router.push("/admin/posts");
    } catch (err: any) {
      setError(err.message || "Failed to update post");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push("/admin/posts");
  };

  if (loading) {
    return (
      <div className="container mx-auto w-full py-8 px-4">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Skeleton className="h-6 w-6" />
            <Skeleton className="h-8 w-32" />
          </div>
          <Skeleton className="h-4 w-64" />
        </div>

        {/* Form Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-20 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-40 w-full" />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-24" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-10 w-full" />
                </div>
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-12" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 w-20" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCancel}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Post</h1>
        </div>
        <p className="text-muted-foreground">
          Make changes to your blog post. All changes will be saved when you click update.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter post title..."
                    required
                    className="text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Brief description of your post..."
                    rows={3}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    This will be shown in post previews and search results.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="markdown">Content</Label>
                  <div className="border rounded-lg overflow-hidden">
                    <RichTextEditorDemo
                      value={marked(markdown) as string}
                      onChange={(html) => setMarkdown(turndownService.turndown(html))}
                      className="min-h-[300px]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    value={tags}
                    onChange={e => setTags(e.target.value)}
                    placeholder="react, nextjs, typescript"
                  />
                  <p className="text-xs text-muted-foreground">
                    Separate tags with commas
                  </p>
                  
                  {/* Tag Preview */}
                  {parsedTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {parsedTags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="feature" className="text-base flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Featured Post
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Show this post prominently on the homepage
                    </p>
                  </div>
                  <Switch
                    id="feature"
                    checked={feature}
                    onCheckedChange={setFeature}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-2">
                  <Button 
                    type="submit" 
                    disabled={saving}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Updating..." : "Update Post"}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={saving}
                    className="w-full"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
                
                <Separator className="my-4" />
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>• Changes are saved immediately upon update</p>
                  <p>• Use Ctrl+S to save (coming soon)</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}