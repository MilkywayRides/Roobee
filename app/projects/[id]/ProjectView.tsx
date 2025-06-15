// ProjectView.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from "next-themes";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Editor, { loader } from '@monaco-editor/react';
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
  Menu,
  Sun,
  Moon,
  Python,
  Image as ImageIcon,
  Markdown,
  FileJs,
  FileTs,
  FileJson,
  FileCode2
} from 'lucide-react';
import { AvatarButton } from "@/components/ui/avatar-button";

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

// Configure Monaco loader
loader.config({
  paths: {
    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
  }
});

// Dark theme configuration
const darkTheme = {
  base: 'vs-dark' as const,
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6A9955' },
    { token: 'keyword', foreground: 'C586C0' },
    { token: 'string', foreground: 'CE9178' },
    { token: 'number', foreground: 'B5CEA8' },
    { token: 'regexp', foreground: 'D16969' },
    { token: 'type', foreground: '4EC9B0' },
    { token: 'class', foreground: '4EC9B0' },
    { token: 'function', foreground: 'DCDCAA' },
    { token: 'variable', foreground: '9CDCFE' },
    { token: 'constant', foreground: '4FC1FF' },
    { token: 'operator', foreground: 'D4D4D4' },
    { token: 'delimiter', foreground: 'D4D4D4' },
    { token: 'tag', foreground: '569CD6' },
    { token: 'attribute', foreground: '9CDCFE' },
  ],
  colors: {
    'editor.background': '#1E1E1E',
    'editor.foreground': '#D4D4D4',
    'editor.lineHighlightBackground': '#2A2D2E',
    'editorLineNumber.foreground': '#858585',
    'editorLineNumber.activeForeground': '#C6C6C6',
    'editor.selectionBackground': '#264F78',
    'editor.inactiveSelectionBackground': '#3A3D41',
    'editor.wordHighlightBackground': '#575757B8',
    'editor.findMatchBackground': '#515C6A',
    'editor.findMatchHighlightBackground': '#314365',
    'editor.findRangeHighlightBackground': '#2A2D2E',
    'editor.hoverHighlightBackground': '#2A2D2E',
    'editor.lineHighlightBorder': '#282828',
    'editor.rangeHighlightBackground': '#2A2D2E',
    'editorCursor.foreground': '#AEAFAD',
    'editorWhitespace.foreground': '#404040',
    'editorIndentGuide.background': '#404040',
    'editorIndentGuide.activeBackground': '#707070',
    'editor.selectionHighlightBackground': '#264F78',
    'editor.wordHighlightStrongBackground': '#004972',
    'editorBracketMatch.background': '#4B4B4B',
    'editorBracketMatch.border': '#888888',
    'editorGutter.background': '#1E1E1E',
    'editorError.foreground': '#F48771',
    'editorWarning.foreground': '#CCA700',
    'editorInfo.foreground': '#75BEFF',
    'editorHint.foreground': '#EEEEEE'
  }
};

// Light theme configuration
const lightTheme = {
  base: 'vs' as const,
  inherit: true,
  rules: [
    { token: 'comment', foreground: '008000' },
    { token: 'keyword', foreground: '0000FF' },
    { token: 'string', foreground: 'A31515' },
    { token: 'number', foreground: '098658' },
    { token: 'regexp', foreground: '811F3F' },
    { token: 'type', foreground: '267F99' },
    { token: 'class', foreground: '267F99' },
    { token: 'function', foreground: '795E26' },
    { token: 'variable', foreground: '001080' },
    { token: 'constant', foreground: '0070C1' },
    { token: 'operator', foreground: '000000' },
    { token: 'delimiter', foreground: '000000' },
    { token: 'tag', foreground: '0000FF' },
    { token: 'attribute', foreground: '001080' },
  ],
  colors: {
    'editor.background': '#FFFFFF',
    'editor.foreground': '#000000',
    'editor.lineHighlightBackground': '#F5F5F5',
    'editorLineNumber.foreground': '#237893',
    'editorLineNumber.activeForeground': '#0B216A',
    'editor.selectionBackground': '#ADD6FF',
    'editor.inactiveSelectionBackground': '#E5EBF1',
    'editor.wordHighlightBackground': '#575757B8',
    'editor.findMatchBackground': '#A97AC1',
    'editor.findMatchHighlightBackground': '#EA5C0055',
    'editor.findRangeHighlightBackground': '#F5F5F5',
    'editor.hoverHighlightBackground': '#F5F5F5',
    'editor.lineHighlightBorder': '#EEEEEE',
    'editor.rangeHighlightBackground': '#F5F5F5',
    'editorCursor.foreground': '#000000',
    'editorWhitespace.foreground': '#A6A6A6',
    'editorIndentGuide.background': '#D3D3D3',
    'editorIndentGuide.activeBackground': '#939393',
    'editor.selectionHighlightBackground': '#ADD6FF',
    'editor.wordHighlightStrongBackground': '#004972',
    'editorBracketMatch.background': '#E6F3FF',
    'editorBracketMatch.border': '#7F7F7F',
    'editorGutter.background': '#FFFFFF',
    'editorError.foreground': '#E51400',
    'editorWarning.foreground': '#CCA700',
    'editorInfo.foreground': '#75BEFF',
    'editorHint.foreground': '#6C6C6C'
  }
};

// Map file extensions to icons and Monaco languages
const fileTypeMap: Record<string, { icon: any; language: string }> = {
  'py': { icon: FileCode2, language: 'python' },
  'js': { icon: FileCode2, language: 'javascript' },
  'jsx': { icon: FileCode2, language: 'javascript' },
  'ts': { icon: FileCode2, language: 'typescript' },
  'tsx': { icon: FileCode2, language: 'typescript' },
  'json': { icon: FileJson, language: 'json' },
  'md': { icon: FileText, language: 'markdown' },
  'png': { icon: ImageIcon, language: '' },
  'jpg': { icon: ImageIcon, language: '' },
  'jpeg': { icon: ImageIcon, language: '' },
  'gif': { icon: ImageIcon, language: '' },
  'svg': { icon: ImageIcon, language: '' },
  'txt': { icon: FileText, language: 'plaintext' },
};

function getFileTypeInfo(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || '';
  return fileTypeMap[ext] || { icon: FileCode2, language: ext || 'plaintext' };
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
  const { theme } = useTheme();

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
        return theme === 'dark' ? 'bg-yellow-400' : 'bg-yellow-500';
      case 'ts':
      case 'tsx':
        return theme === 'dark' ? 'bg-blue-400' : 'bg-blue-500';
      case 'json':
        return theme === 'dark' ? 'bg-green-400' : 'bg-green-500';
      case 'css':
      case 'scss':
        return theme === 'dark' ? 'bg-purple-400' : 'bg-purple-500';
      case 'html':
        return theme === 'dark' ? 'bg-orange-400' : 'bg-orange-500';
      case 'md':
        return theme === 'dark' ? 'bg-gray-400' : 'bg-gray-500';
      case 'py':
        return theme === 'dark' ? 'bg-green-300' : 'bg-green-600';
      default:
        return theme === 'dark' ? 'bg-gray-300' : 'bg-gray-400';
    }
  };

  const { icon: FileIconComponent } = getFileTypeInfo(node.name);

  return (
    <div>
      <div 
        className={`flex items-center py-1.5 px-3 cursor-pointer rounded-sm group transition-colors duration-200 ${
          theme === 'dark'
            ? 'hover:bg-[#2A2D2E] text-gray-200'
            : 'hover:bg-gray-100 text-gray-700'
        }`}
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={handleClick}
      >
        {node.type === 'folder' ? (
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronDown className={`w-4 h-4 mr-2 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`} />
            ) : (
              <ChevronRight className={`w-4 h-4 mr-2 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`} />
            )}
            <Folder className={`w-4 h-4 mr-2 ${
              theme === 'dark' ? 'text-white' : 'text-black'
            }`} />
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-6 h-4 mr-2 flex items-center">
              <FileIconComponent className={`w-4 h-4 ${
                theme === 'dark' ? 'text-white' : 'text-black'
              }`} />
            </div>
            <div className={`w-2 h-2 rounded-full mr-2 ${getLanguageColor(node.name)} opacity-75`} />
          </div>
        )}
        <span className={`text-sm font-medium truncate ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}>
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
            .map((child) => (
              <FileTreeNode 
                key={`${child.path}-${child.type}-${child.name}`}
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
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // Handle initial mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle theme changes
  useEffect(() => {
    if (!mounted) return;

    const updateTheme = () => {
      if (monacoRef.current) {
        const currentTheme = theme === 'dark' ? 'custom-dark' : 'custom-light';
        monacoRef.current.editor.setTheme(currentTheme);
      }
    };

    updateTheme();
  }, [theme, mounted]);

  // Initialize Monaco editor
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define themes
    monaco.editor.defineTheme('custom-dark', darkTheme);
    monaco.editor.defineTheme('custom-light', lightTheme);

    // Set initial theme
    const currentTheme = theme === 'dark' ? 'custom-dark' : 'custom-light';
    monaco.editor.setTheme(currentTheme);

    // Set editor options
    editor.updateOptions({
      fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
      fontLigatures: true,
      fontSize: isMobile ? 12 : 14,
      lineHeight: 20,
      padding: { top: 8, bottom: 8 },
      scrollbar: {
        vertical: 'visible',
        horizontal: 'visible',
        useShadows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10,
      },
      minimap: {
        enabled: !isMobile,
        maxColumn: 80,
        renderCharacters: false,
        showSlider: 'mouseover',
      },
      renderWhitespace: 'selection',
      renderControlCharacters: true,
      renderLineHighlight: 'all',
      renderValidationDecorations: 'on',
      lineNumbers: 'on',
      renderFinalNewline: 'on',
    });
  };

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
    <div className={`min-h-screen transition-colors duration-200 ${
      !mounted ? 'bg-white text-gray-900' : theme === 'dark' ? 'bg-[#1e1e1e] text-[#d4d4d4]' : 'bg-white text-gray-900'
    }`}>
      {/* Activity Bar */}
      <div className={`fixed left-0 top-0 h-full w-12 transition-colors duration-200 ${
        !mounted ? 'bg-gray-100' : theme === 'dark' ? 'bg-[#333333]' : 'bg-gray-100'
      } flex flex-col items-center py-2 z-50`}>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-10 w-10 transition-colors duration-200 ${
            theme === 'dark' 
              ? 'text-gray-300 hover:bg-[#404040] hover:text-white' 
              : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
          } md:hidden`}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className={`h-10 w-10 transition-colors duration-200 ${
          theme === 'dark' 
            ? 'text-gray-300 hover:bg-[#404040] hover:text-white' 
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`} onClick={() => setActiveTab('explorer')}>
          <FileText className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className={`h-10 w-10 transition-colors duration-200 ${
          theme === 'dark' 
            ? 'text-gray-300 hover:bg-[#404040] hover:text-white' 
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`} onClick={() => setActiveTab('search')}>
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className={`h-10 w-10 transition-colors duration-200 ${
          theme === 'dark' 
            ? 'text-gray-300 hover:bg-[#404040] hover:text-white' 
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`} onClick={() => setActiveTab('source')}>
          <Code2 className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className={`h-10 w-10 transition-colors duration-200 ${
          theme === 'dark' 
            ? 'text-gray-300 hover:bg-[#404040] hover:text-white' 
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`} onClick={() => setActiveTab('git')}>
          <GitPullRequest className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className={`h-10 w-10 transition-colors duration-200 ${
          theme === 'dark' 
            ? 'text-gray-300 hover:bg-[#404040] hover:text-white' 
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`} onClick={() => setActiveTab('debug')}>
          <Bug className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className={`h-10 w-10 transition-colors duration-200 ${
          theme === 'dark' 
            ? 'text-gray-300 hover:bg-[#404040] hover:text-white' 
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`} onClick={() => setActiveTab('extensions')}>
          <LayoutGrid className="h-5 w-5" />
        </Button>
        <div className="flex-1" />
        <AvatarButton className="mb-2" />
      </div>

      {/* Main Content */}
      <div className="pl-12">
        {/* Header */}
        <div className={`sticky top-0 z-40 w-full border-b transition-colors duration-200 ${
          theme === 'dark' ? 'border-[#404040] bg-[#1e1e1e]' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex h-10 items-center px-4">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex items-center space-x-2 min-w-0">
                <User className={`h-4 w-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} flex-shrink-0`} />
                <span className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'} truncate`}>
                  {project.user?.name || 'owner'}
                </span>
                <span className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>/</span>
                <h1 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-200' : 'text-gray-900'} truncate`}>
                  {project.name}
                </h1>
              </div>
              {!project.isFree && (
                <Badge variant="outline" className={`${
                  theme === 'dark' 
                    ? 'bg-[#404040] text-gray-200 border-[#404040]' 
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                } flex-shrink-0`}>
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
            className={`fixed md:static inset-y-0 left-12 z-40 w-64 transition-all duration-200 ${
              theme === 'dark' 
                ? 'bg-[#252526] border-[#404040]' 
                : 'bg-[#f3f3f3] border-gray-200'
            } border-r ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0`}
          >
            <div className={`h-10 flex items-center px-4 border-b transition-colors duration-200 ${
              theme === 'dark' 
                ? 'border-[#404040] bg-[#252526]' 
                : 'border-gray-200 bg-[#f3f3f3]'
            }`}>
              <span className={`text-sm font-medium ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>EXPLORER</span>
            </div>
            <div className={`overflow-y-auto h-[calc(100%-2.5rem)] ${
              theme === 'dark' ? 'bg-[#252526]' : 'bg-[#f3f3f3]'
            }`}>
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
          <div className={`flex-1 transition-colors duration-200 ${
            theme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white'
          } min-w-0`}>
            {editorTabs.length > 0 ? (
              <div className="h-full flex flex-col">
                {/* Editor Tabs */}
                <div className={`h-10 flex items-center border-b transition-colors duration-200 ${
                  theme === 'dark' 
                    ? 'border-[#404040] bg-[#252526]' 
                    : 'border-gray-200 bg-gray-50'
                } overflow-x-auto`}>
                  {editorTabs.map((tab) => (
                    <div
                      key={tab.file.appwriteId}
                      className={`group flex items-center h-full px-4 border-r transition-colors duration-200 ${
                        theme === 'dark' ? 'border-[#404040]' : 'border-gray-200'
                      } cursor-pointer flex-shrink-0 ${
                        tab.isActive 
                          ? theme === 'dark' 
                            ? 'bg-[#1e1e1e]' 
                            : 'bg-white'
                          : theme === 'dark'
                            ? 'bg-[#2d2d2d] hover:bg-[#2d2d2d]'
                            : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                      onClick={() => handleTabClick(tab)}
                    >
                      <File className={`w-4 h-4 mr-2 ${
                        theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      } flex-shrink-0`} />
                      <span className={`text-sm ${
                        theme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                      } whitespace-nowrap truncate max-w-[150px]`}>
                        {tab.file.name}
                      </span>
                      <button
                        className={`ml-2 p-1 rounded transition-colors duration-200 ${
                          theme === 'dark' 
                            ? 'hover:bg-[#404040]' 
                            : 'hover:bg-gray-200'
                        } opacity-0 group-hover:opacity-100 flex-shrink-0`}
                        onClick={(e) => handleTabClose(e, tab)}
                      >
                        <X className={`w-3 h-3 ${
                          theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Editor */}
                <div className="flex-1 min-h-0">
                  {fileContent ? (
                    <Editor
                      height="100%"
                      defaultLanguage={getFileTypeInfo(selectedFile?.name || '').language}
                      value={fileContent}
                      onMount={handleEditorDidMount}
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
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                          theme === 'dark' ? 'border-[#007acc]' : 'border-blue-500'
                        } mx-auto`}></div>
                        <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                          Loading file content...
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <div className="text-center space-y-4">
                  <File className={`w-12 h-12 ${
                    theme === 'dark' ? 'text-gray-400' : 'text-gray-300'
                  } mx-auto`} />
                  <p className={theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>
                    Select a file to view its contents
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && isMobile && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity duration-200"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}