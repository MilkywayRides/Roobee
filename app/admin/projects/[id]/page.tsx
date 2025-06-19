"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "react-hot-toast";
import FileTree from "../../../components/FileTree";
import { Textarea } from "@/components/ui/textarea";

interface Project {
  id: string;
  name: string;
  description?: string;
  isFree: boolean;
  coinCost?: number;
  files: { id: string }[];
}

export default function ProjectDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [coinCost, setCoinCost] = useState<number | undefined>(undefined);

  // --- Code update state ---
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<any | null>(null);
  const [fileContent, setFileContent] = useState("");
  const [savingFile, setSavingFile] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingFileContent, setLoadingFileContent] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    fetch(`/api/projects/${projectId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch project");
        return res.json();
      })
      .then((data) => {
        setProject(data);
        setName(data.name || "");
        setDescription(data.description || "");
        setIsFree(data.isFree);
        setCoinCost(data.coinCost);
      })
      .catch(() => setError("Failed to load project"))
      .finally(() => setLoading(false));
  }, [projectId]);

  // Fetch file list on mount
  useEffect(() => {
    if (!projectId) return;
    setLoadingFiles(true);
    fetch(`/api/projects/${projectId}/files`)
      .then(res => res.json())
      .then(files => setFiles(
        Array.isArray(files)
          ? files.map(f => ({
              name: f.fileName,
              path: f.id, // unique
              type: "file",
              size: f.fileSize || 0,
              id: f.id,
              appwriteId: f.appwriteId,
            }))
          : []
      ))
      .catch(() => toast.error("Failed to load files"))
      .finally(() => setLoadingFiles(false));
  }, [projectId]);

  // Fetch file content when a file is selected
  useEffect(() => {
    if (!selectedFile) return;
    setLoadingFileContent(true);
    fetch(`/api/files/content/${selectedFile.appwriteId}`)
      .then(res => res.text())
      .then(setFileContent)
      .catch(() => toast.error("Failed to load file content"))
      .finally(() => setLoadingFileContent(false));
  }, [selectedFile]);

  const handleEdit = () => setEditing(true);
  const handleCancel = () => {
    setEditing(false);
    if (project) {
      setName(project.name || "");
      setDescription(project.description || "");
      setIsFree(project.isFree);
      setCoinCost(project.coinCost);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          isFree,
          coinCost: isFree ? undefined : coinCost,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update project");
      }
      toast.success("Project updated!");
      // Refetch project
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project");
    } finally {
      setSaving(false);
    }
  };

  // Upload file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !projectId) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("fileName", file.name);
      formData.append("isPublic", "false");
      // You may need to add more fields depending on your API
      const res = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Failed to upload file");
      toast.success("File uploaded!");
      // Refresh file list
      fetch(`/api/projects/${projectId}/files`)
        .then(res => res.json())
        .then(setFiles);
    } catch {
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Delete file
  const handleDeleteFile = async () => {
    if (!selectedFile) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/files/content/${selectedFile.appwriteId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete file");
      toast.success("File deleted!");
      // Refresh file list
      fetch(`/api/projects/${projectId}/files`)
        .then(res => res.json())
        .then(setFiles);
      setSelectedFile(null);
      setFileContent("");
    } catch {
      toast.error("Failed to delete file");
    } finally {
      setDeleting(false);
    }
  };

  // Save file content
  const handleSaveFile = async () => {
    if (!selectedFile) return;
    setSavingFile(true);
    try {
      const res = await fetch(`/api/files/content/${selectedFile.appwriteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: fileContent }),
      });
      if (!res.ok) throw new Error("Failed to save file");
      toast.success("File updated!");
    } catch {
      toast.error("Failed to save file");
    } finally {
      setSavingFile(false);
    }
  };

  if (loading) return <div className="max-w-xl mx-auto py-12">Loading...</div>;
  if (error) return <div className="max-w-xl mx-auto py-12 text-red-500">{error}</div>;
  if (!project) return <div className="max-w-xl mx-auto py-12">Project not found.</div>;

  return (
    <div className="max-w-xl mx-auto py-12">
      <Card>
        <CardHeader>
          <CardTitle>Edit Project Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
              />
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="isFree"
                checked={isFree}
                onCheckedChange={setIsFree}
              />
              <Label htmlFor="isFree" className="mb-0">Free Project</Label>
            </div>
            {!isFree && (
              <div>
                <Label htmlFor="coinCost">Coin Cost</Label>
                <Input
                  id="coinCost"
                  type="number"
                  min={1}
                  value={coinCost ?? ""}
                  onChange={(e) => setCoinCost(Number(e.target.value))}
                  className="mt-1"
                  required
                />
              </div>
            )}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Saving..." : "Update Project"}
              </Button>
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
          </form>
        </CardContent>
      </Card>
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-2">Project Files</h2>
        <div className="mb-4 flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="block"
            disabled={uploading}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            variant="secondary"
          >
            {uploading ? "Uploading..." : "Upload New File"}
          </Button>
        </div>
        <div className="flex gap-6">
          <div className="w-1/3">
            {loadingFiles ? (
              <div className="text-muted-foreground">Loading files...</div>
            ) : (
              <FileTree files={files} onFileClick={setSelectedFile} />
            )}
          </div>
          <div className="flex-1">
            {selectedFile ? (
              <div>
                <div className="mb-2 font-mono text-sm flex items-center justify-between">
                  <span>{selectedFile.name}</span>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={handleDeleteFile}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete"}
                  </Button>
                </div>
                {loadingFileContent ? (
                  <div className="text-muted-foreground">Loading file content...</div>
                ) : (
                  <>
                    <Textarea
                      className="w-full min-h-[300px] font-mono"
                      value={fileContent}
                      onChange={e => setFileContent(e.target.value)}
                    />
                    <Button
                      className="mt-2"
                      onClick={handleSaveFile}
                      disabled={savingFile}
                    >
                      {savingFile ? "Saving..." : "Save"}
                    </Button>
                  </>
                )}
              </div>
            ) : (
              <div className="text-muted-foreground">Select a file to edit</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}