'use client';

import { useState } from 'react';
import FileTree from '@/app/components/FileTree';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Editor from '@monaco-editor/react';
import { toast } from 'react-hot-toast';

interface FileNode {
  name: string;
  path: string;
  type: string;
  size: number;
  children?: FileNode[];
  appwriteId?: string;
}

interface Project {
  id: string;
  name: string;
  description?: string;
  isFree: boolean;
  coinCost?: number;
  files: any[];
}

function buildFileTree(files: any[]): FileNode[] {
  const tree: { [key: string]: FileNode } = {};
  const root: FileNode[] = [];

  // Sort files to ensure parent folders are processed first
  files.sort((a, b) => a.fileName.localeCompare(b.fileName));

  files.forEach(file => {
    // Split the path and remove the parent folder name
    const parts = file.fileName.split('/');
    // Remove the parent folder (first part) if it exists
    if (parts.length > 1) {
      parts.shift(); // Remove the parent folder name
    }
    
    let currentPath = '';
    let parentNode: FileNode | null = null;

    parts.forEach((part: string, index: number) => {
      const isLastPart = index === parts.length - 1;
      currentPath = currentPath ? `${currentPath}/${part}` : part;

      if (!tree[currentPath]) {
        const node: FileNode = {
          name: part,
          path: currentPath,
          type: isLastPart ? 'file' : 'folder',
          size: isLastPart ? file.fileSize : 0,
          children: [],
          appwriteId: isLastPart ? file.appwriteId : undefined
        };

        tree[currentPath] = node;

        if (parentNode) {
          parentNode.children?.push(node);
        } else {
          root.push(node);
        }
      }

      parentNode = tree[currentPath];
    });
  });

  return root;
}

export default function ProjectView({ project }: { project: Project }) {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleFileClick = async (file: FileNode) => {
    if (file.type === 'folder') return;
    
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

  // Build file tree structure
  const fileTree = buildFileTree(project.files);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
          {project.name}
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {project.description}
        </p>
        
        <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Project Files
          </h2>
          <FileTree files={fileTree} onFileClick={handleFileClick} />
        </div>
      </div>

      {isModalOpen && selectedFile && (
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="max-w-4xl h-[80vh]">
            <DialogHeader>
              <DialogTitle>{selectedFile.path}</DialogTitle>
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
                  theme="vs-dark"
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