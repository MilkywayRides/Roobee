"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Upload, X, FolderOpen } from "lucide-react";
import { uploadFile, createAnonymousSession } from "@/lib/appwrite";
import { toast } from "sonner";

interface UploadedFile {
    name: string;
    size: number;
    type: string;
    appwriteId: string;
    path: string;
}

export default function CreateProjectPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectDetails, setProjectDetails] = useState({
    name: '',
    description: '',
    isFree: true,
    coinCost: 0
  });
  const [files, setFiles] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize Appwrite session
  useEffect(() => {
    const initSession = async () => {
      try {
        await createAnonymousSession();
      } catch (error) {
        console.error('Failed to initialize Appwrite session:', error);
        toast.error('Failed to initialize file upload system');
      }
    };
    initSession();
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles(prev => [...prev, ...droppedFiles]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const handleFolderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(prev => [...prev, ...Array.from(e.target.files)]);
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    setUploadProgress(prev => {
      const newProgress = { ...prev };
      for (const file of files) {
        delete newProgress[file.name];
      }
      return newProgress;
    });
  };

  const handleFileUpload = async (file: File) => {
    try {
      // Show upload progress
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 0
      }));

      // Upload file to Appwrite
      const response = await uploadFile(file);
      
      // Update progress to 100%
      setUploadProgress(prev => ({
        ...prev,
        [file.name]: 100
      }));

      // Add file to the list
      setFiles(prev => [...prev, file]);

      // Clear progress after a delay
      setTimeout(() => {
        setUploadProgress(prev => {
          const newProgress = { ...prev };
          delete newProgress[file.name];
          return newProgress;
        });
      }, 1000);

      return response;
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  };

  const handleFiles = async (selectedFiles: File[], projectId: string) => {
    setUploading(true);
    setError(null);

    try {
      for (const file of selectedFiles) {
        try {
          const response = await handleFileUpload(file);
          // Save file metadata to database
          const metadataResponse = await fetch(`/api/projects/${projectId}/files`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: file.name,
              fileId: response.$id,
              fileSize: file.size,
              mimeType: file.type,
              isPublic: true
            }),
          });
          if (!metadataResponse.ok) {
            const errorData = await metadataResponse.json();
            throw new Error(errorData.error || 'Failed to save file metadata');
          }
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error);
          // Continue with other files even if one fails
        }
      }
    } catch (error) {
      console.error('Error processing files:', error);
      setError('Failed to upload some files. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Create project
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: projectDetails.name,
          description: projectDetails.description,
          isFree: projectDetails.isFree,
          coinCost: projectDetails.coinCost
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create project');
      }

      const project = await response.json();

      // Upload files (real File objects)
      await handleFiles(files, project.id);
      
      toast.success('Project created successfully!');
      router.push('/admin/projects');
    } catch (error) {
      console.error('Error creating project:', error);
      setError(error instanceof Error ? error.message : 'Failed to create project');
      toast.error('Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create a New Project</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block font-medium mb-1">Project Name</label>
              <Input 
                value={projectDetails.name} 
                onChange={(e) => setProjectDetails(prev => ({ ...prev, name: e.target.value }))} 
                required 
                maxLength={100}
                placeholder="Enter project name"
              />
            </div>
            
            <div>
              <label className="block font-medium mb-1">Description</label>
              <Textarea 
                value={projectDetails.description} 
                onChange={(e) => setProjectDetails(prev => ({ ...prev, description: e.target.value }))} 
                rows={3} 
                maxLength={500}
                placeholder="Enter project description"
              />
            </div>

            <div className="flex items-center gap-4">
              <Switch checked={projectDetails.isFree} onCheckedChange={(checked) => setProjectDetails(prev => ({ ...prev, isFree: checked }))} />
              <span>{projectDetails.isFree ? "Free to view" : "Requires coins"}</span>
              {!projectDetails.isFree && (
                <Input
                  type="number"
                  min={1}
                  value={projectDetails.coinCost}
                  onChange={(e) => setProjectDetails(prev => ({ ...prev, coinCost: parseInt(e.target.value) }))}
                  className="w-24"
                  placeholder="Coin cost"
                  required
                />
              )}
            </div>

            <div>
              <label className="block font-medium mb-1">Upload Files or Folder</label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition"
                  onClick={() => document.getElementById('file-input')?.click()}
                >
                  <input
                    id="file-input"
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <span className="text-muted-foreground">Upload Files</span>
                </div>
                <div
                  className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:bg-muted transition"
                  onClick={() => document.getElementById('folder-input')?.click()}
                >
                  <input
                    id="folder-input"
                    type="file"
                    className="hidden"
                    onChange={handleFolderChange}
                    // @ts-ignore
                    webkitdirectory="true"
                    directory="true"
                  />
                  <FolderOpen className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
                  <span className="text-muted-foreground">Upload Folder</span>
                </div>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between p-2 bg-muted rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{file.name}</p>
                        {uploadProgress[file.name] !== undefined && (
                          <div className="w-full bg-background rounded-full h-1.5 mt-1">
                            <div 
                              className="bg-primary h-1.5 rounded-full transition-all duration-300"
                              style={{ width: `${uploadProgress[file.name]}%` }}
                            />
                          </div>
                        )}
                      </div>
                      <Button 
                        type="button" 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => removeFile(i)}
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={isSubmitting} 
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                  Creating Project...
                </>
              ) : (
                "Create Project"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 