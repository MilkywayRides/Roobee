"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileIcon, Download, Lock } from "lucide-react";
import dynamic from "next/dynamic";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-hot-toast";

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(() => import("@monaco-editor/react").then(mod => mod.Editor), { ssr: false });

interface File {
  id: string;
  fileName: string;
  appwriteId: string;
  fileSize: number;
  mimeType: string;
  isPublic: boolean;
  previewUrl: string;
  uploadedBy: {
    name: string;
    image: string;
  };
}

interface Project {
  id: string;
  name: string;
  description?: string;
  isFree: boolean;
  coinCost?: number;
  files: File[];
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetch(`/api/projects/${id}`)
      .then((res) => res.json())
      .then((data) => setProject(data))
      .finally(() => setLoading(false));
  }, [id]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFileClick = async (file: File) => {
    try {
      setSelectedFile(file);
      setIsModalOpen(true);
      const response = await fetch(`/api/files/content/${file.appwriteId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch file content');
      }
      const content = await response.text();
      setFileContent(content);
    } catch (error) {
      console.error('Error loading file content:', error);
      toast.error('Error loading file content');
      setIsModalOpen(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto py-8">Loading...</div>;
  if (!project) return <div className="max-w-2xl mx-auto py-8">Project not found.</div>;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="flex flex-col md:flex-row gap-6">
        {/* File Explorer (Left Side) */}
        <div className="w-full md:w-1/4 bg-gray-50 rounded-lg p-4">
          <h2 className="text-lg font-semibold mb-4">Files</h2>
          <div className="space-y-2">
            {project.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-2 bg-white rounded cursor-pointer hover:bg-gray-100"
                onClick={() => handleFileClick(file)}
              >
                <div className="flex items-center gap-2">
                  <FileIcon className="h-5 w-5 text-gray-500" />
                  <span className="font-mono text-sm">{file.fileName}</span>
                </div>
                <span className="text-xs text-gray-500">{formatFileSize(file.fileSize)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content (Right Side) */}
        <div className="w-full md:w-3/4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>{project.name}</span>
                {!project.isFree && (
                  <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded">
                    {project.coinCost} coins
                  </span>
                )}
                {project.isFree && (
                  <span className="text-xs bg-green-200 text-green-800 px-2 py-0.5 rounded">
                    Free
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 text-muted-foreground">{project.description}</div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-1 mt-6 text-blue-600 hover:text-blue-700 text-sm"
              >
                Back to Projects
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {isModalOpen && selectedFile && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedFile.fileName}</DialogTitle>
            </DialogHeader>
            <div className="flex-1 min-h-0">
              {fileContent ? (
                <Editor
                  height="100%"
                  defaultLanguage="javascript"
                  value={fileContent}
                  options={{
                    readOnly: true,
                    minimap: { enabled: true },
                    scrollBeyondLastLine: false,
                    fontSize: 14,
                    wordWrap: 'on',
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p>Loading file content...</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
} 