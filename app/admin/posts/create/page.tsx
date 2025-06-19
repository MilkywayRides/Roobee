"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

export default function CreatePostPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [markdown, setMarkdown] = useState("");
  const [tags, setTags] = useState("");
  const [feature, setFeature] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          markdown,
          tags: tags.split(",").map(t => t.trim()).filter(Boolean),
          feature,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create post");
      }
      router.push("/admin/posts");
    } catch (err: any) {
      setError(err.message || "Failed to create post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Create Post</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="markdown">Markdown Content</Label>
              <Textarea
                id="markdown"
                value={markdown}
                onChange={e => setMarkdown(e.target.value)}
                className="mt-1 min-h-[200px] font-mono"
                required
              />
            </div>
            <div>
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input
                id="tags"
                value={tags}
                onChange={e => setTags(e.target.value)}
                className="mt-1"
                placeholder="e.g. react, nextjs, prisma"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="feature"
                checked={feature}
                onCheckedChange={setFeature}
              />
              <Label htmlFor="feature" className="mb-0">Feature this post</Label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Post"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/admin/posts")}>Cancel</Button>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 