// ProjectView.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Editor from '@monaco-editor/react';
import { toast } from 'react-hot-toast';
import { 
  GitBranch, 
  Star, 
  GitFork, 
  Eye, 
  Download, 
  Code, 
  FileText, 
  Folder, 
  ChevronRight,
  Clock,
  User,
  History,
  Settings,
  Shield,
  PauseIcon as Pulse,
  Users,
  Book,
  File,
  ChevronDown,
  X,
  Search,
  Code2,
  GitPullRequest,
  Bug,
  LayoutGrid,
  Settings2,
  Menu
} from 'lucide-react';

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
  createdAt?: string;
  updatedAt?: string;
  user?: {
    name: string;
    email: string;
  };
}

interface EditorTab {
  file: FileNode;
  content: string;
  isActive: boolean;
}

function buildFileTree(files: any[]): FileNode[] {
  const tree: { [key: string]: FileNode } = {};
  const root: FileNode[] = [];

  files.sort((a, b) => a.fileName.localeCompare(b.fileName));

  files.forEach(file => {
    const parts = file.fileName.split('/');
    if (parts.length > 1) {
      parts.shift();
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

function FileTreeNode({ node, level = 0, onFileClick }: { 
  node: FileNode; 
  level?: number; 
  onFileClick: (file: FileNode) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2);

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(node);
    }
  };

  const getLanguageColor = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'js':
      case 'jsx':
        return 'bg-yellow-500';
      case 'ts':
      case 'tsx':
        return 'bg-blue-500';
      case 'json':
        return 'bg-green-500';
      case 'css':
      case 'scss':
        return 'bg-purple-500';
      case 'html':
        return 'bg-orange-500';
      case 'md':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div>
      <div 
        className={`flex items-center py-2 px-3 hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm group`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={handleClick}
      >
        {node.type === 'folder' ? (
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-2 text-muted-foreground" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2 text-muted-foreground" />
            )}
            <Folder className="w-4 h-4 mr-2 text-blue-600 dark:text-blue-400" />
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-6 h-4 mr-2 flex items-center">
              <File className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className={`w-2 h-2 rounded-full mr-2 ${getLanguageColor(node.name)} opacity-75`} />
          </div>
        )}
        <span className="text-sm font-medium truncate">
          {node.name}
        </span>
      </div>
      
      {node.type === 'folder' && isExpanded && node.children && (
        <div>
          {node.children
            .sort((a, b) => {
              if (a.type === b.type) return a.name.localeCompare(b.name);
              return a.type === 'folder' ? -1 : 1;
            })
            .map((child, index) => (
              <FileTreeNode 
                key={index} 
                node={child} 
                level={level + 1} 
                onFileClick={onFileClick}
              />
            ))}
        </div>
      )}
    </div>
  );
}

export default function ProjectView({ project }: { project: Project }) {
  const [selectedFile, setSelectedFile] = useState<FileNode | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [activeTab, setActiveTab] = useState('explorer');
  const [editorTabs, setEditorTabs] = useState<EditorTab[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFileClick = async (file: FileNode) => {
    if (file.type === 'folder') return;
    
    try {
      // Check if file is already open in a tab
      const existingTab = editorTabs.find(tab => tab.file.appwriteId === file.appwriteId);
      
      if (existingTab) {
        // If file is already open, just activate its tab
        setEditorTabs(tabs => 
          tabs.map(tab => ({
            ...tab,
            isActive: tab.file.appwriteId === file.appwriteId
          }))
        );
        setSelectedFile(file);
        setFileContent(existingTab.content);
      } else {
        // If file is not open, create a new tab
        setSelectedFile(file);
        setFileContent(""); // Reset content
        const response = await fetch(`/api/files/content/${file.appwriteId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch file content');
        }
        const content = await response.text();
        setFileContent(content);
        
        // Add new tab and deactivate others
        setEditorTabs(tabs => [
          ...tabs.map(tab => ({ ...tab, isActive: false })),
          { file, content, isActive: true }
        ]);
      }
    } catch (error) {
      console.error('Error loading file content:', error);
      toast.error('Error loading file content');
    }
  };

  const handleTabClick = (tab: EditorTab) => {
    setSelectedFile(tab.file);
    setFileContent(tab.content);
    setEditorTabs(tabs =>
      tabs.map(t => ({
        ...t,
        isActive: t.file.appwriteId === tab.file.appwriteId
      }))
    );
  };

  const handleTabClose = (e: React.MouseEvent, tab: EditorTab) => {
    e.stopPropagation();
    
    const newTabs = editorTabs.filter(t => t.file.appwriteId !== tab.file.appwriteId);
    setEditorTabs(newTabs);
    
    if (tab.isActive && newTabs.length > 0) {
      // If closing active tab, activate the last tab
      const lastTab = newTabs[newTabs.length - 1];
      setSelectedFile(lastTab.file);
      setFileContent(lastTab.content);
      setEditorTabs(tabs =>
        tabs.map(t => ({
          ...t,
          isActive: t.file.appwriteId === lastTab.file.appwriteId
        }))
      );
    } else if (newTabs.length === 0) {
      // If no tabs left, clear the editor
      setSelectedFile(null);
      setFileContent("");
    }
  };

  const fileTree = buildFileTree(project.files);

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#d4d4d4]">
      {/* Activity Bar */}
      <div className="fixed left-0 top-0 h-full w-12 bg-[#333333] flex flex-col items-center py-2 z-50">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 text-[#d4d4d4] hover:bg-[#404040] hover:text-white md:hidden"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-[#d4d4d4] hover:bg-[#404040] hover:text-white" onClick={() => setActiveTab('explorer')}>
          <FileText className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-[#d4d4d4] hover:bg-[#404040] hover:text-white" onClick={() => setActiveTab('search')}>
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-[#d4d4d4] hover:bg-[#404040] hover:text-white" onClick={() => setActiveTab('source')}>
          <Code2 className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-[#d4d4d4] hover:bg-[#404040] hover:text-white" onClick={() => setActiveTab('git')}>
          <GitPullRequest className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-[#d4d4d4] hover:bg-[#404040] hover:text-white" onClick={() => setActiveTab('debug')}>
          <Bug className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="h-10 w-10 text-[#d4d4d4] hover:bg-[#404040] hover:text-white" onClick={() => setActiveTab('extensions')}>
          <LayoutGrid className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="icon" className="h-10 w-10 text-[#d4d4d4] hover:bg-[#404040] hover:text-white" onClick={() => setActiveTab('settings')}>
          <Settings2 className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content */}
      <div className="pl-12">
        {/* Header */}
        <div className="sticky top-0 z-40 w-full border-b border-[#404040] bg-[#1e1e1e]">
          <div className="flex h-10 items-center px-4">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex items-center space-x-2 min-w-0">
                <User className="h-4 w-4 text-[#d4d4d4] flex-shrink-0" />
                <span className="text-sm text-[#d4d4d4] truncate">{project.user?.name || 'owner'}</span>
                <span className="text-[#d4d4d4] flex-shrink-0">/</span>
                <h1 className="text-sm font-medium text-[#d4d4d4] truncate">
                  {project.name}
                </h1>
              </div>
              {!project.isFree && (
                <Badge variant="outline" className="bg-[#404040] text-[#d4d4d4] border-[#404040] flex-shrink-0">
                  Private
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Split View */}
        <div className="flex h-[calc(100vh-2.5rem)]">
          {/* Sidebar */}
          <div 
            className={`fixed md:static inset-y-0 left-12 z-40 w-64 bg-[#252526] border-r border-[#404040] transition-transform duration-200 ease-in-out ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0`}
          >
            <div className="h-10 flex items-center px-4 border-b border-[#404040]">
              <span className="text-sm font-medium text-[#d4d4d4]">EXPLORER</span>
            </div>
            <div className="overflow-y-auto h-[calc(100%-2.5rem)]">
              {fileTree.map((node, index) => (
                <FileTreeNode 
                  key={index} 
                  node={node} 
                  onFileClick={handleFileClick}
                />
              ))}
            </div>
          </div>

          {/* Editor Area */}
          <div className="flex-1 bg-[#1e1e1e] min-w-0">
            {editorTabs.length > 0 ? (
              <div className="h-full flex flex-col">
                {/* Editor Tabs */}
                <div className="h-10 flex items-center border-b border-[#404040] bg-[#252526] overflow-x-auto">
                  {editorTabs.map((tab) => (
                    <div
                      key={tab.file.appwriteId}
                      className={`group flex items-center h-full px-4 border-r border-[#404040] cursor-pointer flex-shrink-0 ${
                        tab.isActive ? 'bg-[#1e1e1e]' : 'bg-[#2d2d2d] hover:bg-[#2d2d2d]'
                      }`}
                      onClick={() => handleTabClick(tab)}
                    >
                      <File className="w-4 h-4 mr-2 text-[#d4d4d4] flex-shrink-0" />
                      <span className="text-sm text-[#d4d4d4] whitespace-nowrap truncate max-w-[150px]">{tab.file.name}</span>
                      <button
                        className="ml-2 p-1 rounded hover:bg-[#404040] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={(e) => handleTabClose(e, tab)}
                      >
                        <X className="w-3 h-3 text-[#d4d4d4]" />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Editor */}
                <div className="flex-1 min-h-0">
                  {fileContent ? (
                    <Editor
                      height="100%"
                      defaultLanguage="javascript"
                      value={fileContent}
                      options={{
                        readOnly: true,
                        minimap: { enabled: !isMobile },
                        scrollBeyondLastLine: false,
                        fontSize: isMobile ? 12 : 14,
                        wordWrap: 'on',
                        lineNumbers: 'on',
                        renderLineHighlight: 'all',
                        cursorBlinking: 'smooth',
                        cursorSmoothCaretAnimation: 'on',
                        smoothScrolling: true,
                        mouseWheelZoom: true,
                      }}
                      theme="vs-dark"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007acc] mx-auto"></div>
                        <p className="text-[#d4d4d4]">Loading file content...</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <File className="w-12 h-12 text-[#d4d4d4] mx-auto" />
                  <p className="text-[#d4d4d4]">Select a file to view its contents</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}