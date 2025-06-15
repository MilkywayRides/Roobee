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
import '@/app/styles/monaco.css';
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
  Image as ImageIcon,
  FileJson,
  FileCode2,
  Download as DownloadIcon
} from 'lucide-react';
import { AvatarButton } from "@/components/ui/avatar-button";
import JSZip from 'jszip';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import dynamic from 'next/dynamic';

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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = !mounted ? 'light' : theme;

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
        return currentTheme === 'dark' ? 'bg-yellow-400' : 'bg-yellow-500';
      case 'ts':
      case 'tsx':
        return currentTheme === 'dark' ? 'bg-blue-400' : 'bg-blue-500';
      case 'json':
        return currentTheme === 'dark' ? 'bg-green-400' : 'bg-green-500';
      case 'css':
      case 'scss':
        return currentTheme === 'dark' ? 'bg-purple-400' : 'bg-purple-500';
      case 'html':
        return currentTheme === 'dark' ? 'bg-orange-400' : 'bg-orange-500';
      case 'md':
        return currentTheme === 'dark' ? 'bg-gray-400' : 'bg-gray-500';
      case 'py':
        return currentTheme === 'dark' ? 'bg-green-300' : 'bg-green-600';
      default:
        return currentTheme === 'dark' ? 'bg-gray-300' : 'bg-gray-400';
    }
  };

  const { icon: FileIconComponent } = getFileTypeInfo(node.name);

  return (
    <div>
      <div 
        className={`flex items-center py-1.5 px-3 cursor-pointer rounded-sm group transition-colors duration-200 ${
          currentTheme === 'dark'
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
                currentTheme === 'dark' ? 'text-white' : 'text-black'
              }`} />
            ) : (
              <ChevronRight className={`w-4 h-4 mr-2 ${
                currentTheme === 'dark' ? 'text-white' : 'text-black'
              }`} />
            )}
            <Folder className={`w-4 h-4 mr-2 ${
              currentTheme === 'dark' ? 'text-white' : 'text-black'
            }`} />
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-6 h-4 mr-2 flex items-center">
              <FileIconComponent className={`w-4 h-4 ${
                currentTheme === 'dark' ? 'text-white' : 'text-black'
              }`} />
            </div>
            <div className={`w-2 h-2 rounded-full mr-2 ${getLanguageColor(node.name)} opacity-75`} />
          </div>
        )}
        <span className={`text-sm font-medium truncate ${
          currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-700'
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
                key={child.appwriteId || `${child.path}-${child.type}-${child.name}`}
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
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(300); // Default height in pixels
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermRef = useRef<Terminal | null>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);

  // Handle initial mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Default to light theme until mounted
  const currentTheme = !mounted ? 'light' : theme;

  // Initialize Monaco editor
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define themes
    monaco.editor.defineTheme('custom-dark', darkTheme);
    monaco.editor.defineTheme('custom-light', lightTheme);

    // Set initial theme
    const editorTheme = currentTheme === 'dark' ? 'custom-dark' : 'custom-light';
    monaco.editor.setTheme(editorTheme);

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
        useShadows: true,
        verticalScrollbarSize: 16,
        horizontalScrollbarSize: 16,
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

  // Handle theme changes
  useEffect(() => {
    if (!mounted || !monacoRef.current) return;

    const editorTheme = currentTheme === 'dark' ? 'custom-dark' : 'custom-light';
    monacoRef.current.editor.setTheme(editorTheme);
  }, [currentTheme, mounted]);

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

  // Initialize terminal
  useEffect(() => {
    let cleanup: (() => void) | undefined;

    if (isTerminalOpen && terminalRef.current && !xtermRef.current) {
      Promise.all([
        import('xterm'),
        import('xterm-addon-fit'),
        import('xterm-addon-web-links')
      ]).then(([{ Terminal }, { FitAddon }, { WebLinksAddon }]) => {
        if (!terminalRef.current) return;

        const term = new Terminal({
          cursorBlink: true,
          fontSize: 14,
          fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
          theme: {
            background: currentTheme === 'dark' ? '#1E1E1E' : '#FFFFFF',
            foreground: currentTheme === 'dark' ? '#D4D4D4' : '#000000',
            cursor: currentTheme === 'dark' ? '#FFFFFF' : '#000000',
          },
        });

        const fitAddon = new FitAddon();
        const webLinksAddon = new WebLinksAddon();

        term.loadAddon(fitAddon);
        term.loadAddon(webLinksAddon);
        term.open(terminalRef.current);
        fitAddon.fit();

        // Add some initial content
        term.writeln('Welcome to the project terminal!');
        term.writeln('Available commands:');
        term.writeln('  ls     - List project files and directories');
        term.writeln('  clear  - Clear the terminal');
        term.writeln('  help   - Show this help message');
        term.write('\r\n$ ');

        // Command handling
        let currentLine = '';
        term.onKey(({ key, domEvent }) => {
          const printable = !domEvent.altKey && !domEvent.ctrlKey && !domEvent.metaKey;

          if (domEvent.keyCode === 13) { // Enter
            term.write('\r\n');
            handleCommand(currentLine.trim());
            currentLine = '';
            term.write('$ ');
          } else if (domEvent.keyCode === 8) { // Backspace
            if (currentLine.length > 0) {
              currentLine = currentLine.slice(0, -1);
              term.write('\b \b');
            }
          } else if (printable) {
            currentLine += key;
            term.write(key);
          }
        });

        const handleCommand = (command: string) => {
          if (!xtermRef.current) return;
          const terminal = xtermRef.current;

          switch (command.toLowerCase()) {
            case 'ls':
              displayFileList(fileTree, terminal);
              break;
            case 'tree':
              displayFileTree(fileTree, terminal);
              break;
            case 'clear':
              terminal.clear();
              break;
            case 'help':
              terminal.writeln('Available commands:');
              terminal.writeln('  ls     - List files and directories');
              terminal.writeln('  tree   - Display directory structure as a tree');
              terminal.writeln('  clear  - Clear the terminal');
              terminal.writeln('  help   - Show this help message');
              break;
            case '':
              break;
            default:
              terminal.writeln(`Command not found: ${command}`);
          }
        };

        const displayFileList = (nodes: FileNode[], terminal: Terminal) => {
          // Calculate column widths
          const maxSize = Math.max(...nodes.map(n => n.size.toString().length));
          const maxName = Math.max(...nodes.map(n => n.name.length));
          
          // Sort nodes: directories first, then files, both alphabetically
          const sortedNodes = [...nodes].sort((a, b) => {
            if (a.type === b.type) {
              return a.name.localeCompare(b.name);
            }
            return a.type === 'folder' ? -1 : 1;
          });

          sortedNodes.forEach(node => {
            const prefix = node.type === 'folder' ? 'd' : '-';
            const permissions = 'rw-r--r--';
            const fileSize = node.type === 'folder' ? '4096' : node.size.toString().padStart(maxSize);
            const fileDate = new Date().toLocaleDateString('en-US', {
              month: 'numeric',
              day: 'numeric',
              year: 'numeric'
            });
            const fileName = node.name.padEnd(maxName);
            
            // Format: drwxr-xr-x 1 user group 4096 Mar 15 2024 filename
            terminal.writeln(`${prefix}${permissions} 1 user group ${fileSize} ${fileDate} ${fileName}`);
            
            if (node.type === 'folder' && node.children) {
              displayFileList(node.children, terminal);
            }
          });
        };

        const displayFileTree = (nodes: FileNode[], terminal: Terminal, prefix = '', isLast = true) => {
          nodes.forEach((node, index) => {
            const isLastNode = index === nodes.length - 1;
            const currentPrefix = prefix + (isLast ? '    ' : '│   ');
            const nodePrefix = prefix + (isLast ? '└── ' : '├── ');
            
            // Print current node
            terminal.writeln(`${nodePrefix}${node.name}${node.type === 'folder' ? '/' : ''}`);
            
            // Recursively print children
            if (node.type === 'folder' && node.children) {
              displayFileTree(node.children, terminal, currentPrefix, isLastNode);
            }
          });
        };

        xtermRef.current = term;

        // Handle window resize
        const handleResize = () => {
          fitAddon.fit();
        };
        window.addEventListener('resize', handleResize);

        cleanup = () => {
          window.removeEventListener('resize', handleResize);
          term.dispose();
          xtermRef.current = null;
        };
      });
    }

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [isTerminalOpen, currentTheme]);

  // Handle keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === '`') {
        e.preventDefault();
        setIsTerminalOpen(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle terminal resize
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startYRef.current = e.clientY;
    startHeightRef.current = terminalHeight;
    document.body.style.cursor = 'ns-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaY = startYRef.current - e.clientY;
      const newHeight = Math.max(100, Math.min(600, startHeightRef.current + deltaY));
      setTerminalHeight(newHeight);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [terminalHeight]);

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
    <div suppressHydrationWarning className={`h-screen overflow-hidden transition-colors duration-200 ${
      currentTheme === 'dark' ? 'bg-[#1e1e1e] text-gray-200' : 'bg-white text-gray-900'
    }`}>
      {/* Activity Bar */}
      <div className={`fixed left-0 top-0 h-full w-12 transition-colors duration-200 ${
        currentTheme === 'dark' ? 'bg-[#333333]' : 'bg-gray-100'
      } flex flex-col items-center py-2 z-50`}>
        <Button 
          variant="ghost" 
          size="icon" 
          className={`h-10 w-10 transition-colors duration-200 ${
            currentTheme === 'dark' 
              ? 'text-gray-300 hover:bg-[#404040] hover:text-white' 
              : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
          } md:hidden`}
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className={`h-10 w-10 transition-colors duration-200 ${
          currentTheme === 'dark' 
            ? 'text-gray-300 hover:bg-[#404040] hover:text-white' 
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`} onClick={() => setActiveTab('explorer')}>
          <FileText className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className={`h-10 w-10 transition-colors duration-200 ${
          currentTheme === 'dark' 
            ? 'text-gray-300 hover:bg-[#404040] hover:text-white' 
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`} onClick={() => setActiveTab('search')}>
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className={`h-10 w-10 transition-colors duration-200 ${
          currentTheme === 'dark' 
            ? 'text-gray-300 hover:bg-[#404040] hover:text-white' 
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`} onClick={() => setActiveTab('source')}>
          <Code2 className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className={`h-10 w-10 transition-colors duration-200 ${
          currentTheme === 'dark' 
            ? 'text-gray-300 hover:bg-[#404040] hover:text-white' 
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`} onClick={() => setActiveTab('git')}>
          <GitPullRequest className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className={`h-10 w-10 transition-colors duration-200 ${
          currentTheme === 'dark' 
            ? 'text-gray-300 hover:bg-[#404040] hover:text-white' 
            : 'text-gray-600 hover:bg-gray-200 hover:text-gray-900'
        }`} onClick={() => setActiveTab('debug')}>
          <Bug className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className={`h-10 w-10 transition-colors duration-200 ${
          currentTheme === 'dark' 
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
          currentTheme === 'dark' ? 'border-[#404040] bg-[#1e1e1e]' : 'border-gray-200 bg-white'
        }`}>
          <div className="flex h-10 items-center justify-between px-4">
            <div className="flex items-center space-x-3 overflow-hidden">
              <div className="flex items-center space-x-2 min-w-0">
                <User className={`h-4 w-4 ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                } flex-shrink-0`} />
                <span className={`text-sm ${
                  currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                } truncate`}>
                  {project.user?.name || 'Anonymous'}
                </span>
                <span className={currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'}>/</span>
                <h1 className={`text-sm font-medium ${
                  currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                } truncate`}>
                  {project.name}
                </h1>
              </div>
              {!project.isFree && (
                <Badge variant="outline" className={`${
                  currentTheme === 'dark' 
                    ? 'bg-[#404040] text-gray-200 border-[#404040]' 
                    : 'bg-gray-100 text-gray-700 border-gray-200'
                } flex-shrink-0`}>
                  Private
                </Badge>
              )}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className={`relative group overflow-hidden ${
                currentTheme === 'dark'
                  ? 'border-[#404040] text-gray-300 hover:text-white hover:bg-[#404040] hover:border-[#404040]'
                  : 'border-gray-200 text-gray-600 hover:text-gray-900 hover:bg-gray-100 hover:border-gray-300'
              } transform transition-all duration-300 hover:scale-105 active:scale-95`}
              onClick={async () => {
                try {
                  // Create a zip file containing all project files
                  const zip = new JSZip();
                  
                  // Add each file to the zip
                  for (const file of project.files) {
                    const response = await fetch(`/api/files/content/${file.appwriteId}`);
                    if (!response.ok) throw new Error('Failed to fetch file content');
                    const content = await response.text();
                    zip.file(file.fileName, content);
                  }
                  
                  // Generate and download the zip file
                  const blob = await zip.generateAsync({ type: 'blob' });
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `${project.name}.zip`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  window.URL.revokeObjectURL(url);
                  
                  toast.success('Project downloaded successfully!');
                } catch (error) {
                  console.error('Download error:', error);
                  toast.error('Failed to download project');
                }
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer" />
              <div className="flex items-center gap-2 relative z-10 group-hover:gap-3 transition-all duration-300">
                <Download className="h-4 w-4 transform transition-transform duration-300 group-hover:-translate-y-1" />
                <span className="text-sm font-medium">Download</span>
              </div>
            </Button>
          </div>
        </div>

        {/* Split View */}
        <div className="flex h-[calc(100vh-2.5rem)] overflow-hidden">
          {/* Sidebar */}
          <div 
            className={`fixed md:static inset-y-0 left-12 z-40 w-64 transition-all duration-200 ${
              currentTheme === 'dark' 
                ? 'bg-[#252526] border-[#404040]' 
                : 'bg-[#f3f3f3] border-gray-200'
            } border-r ${
              isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
            } md:translate-x-0`}
          >
            <div className={`h-10 flex items-center px-4 border-b transition-colors duration-200 ${
              currentTheme === 'dark' 
                ? 'border-[#404040] bg-[#252526]' 
                : 'border-gray-200 bg-[#f3f3f3]'
            }`}>
              <span className={`text-sm font-medium ${
                currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}>EXPLORER</span>
            </div>
            <div className={`overflow-y-auto h-[calc(100%-2.5rem)] ${
              currentTheme === 'dark' ? 'bg-[#252526]' : 'bg-[#f3f3f3]'
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
          <div 
            className={`flex-1 transition-colors duration-200 ${
              currentTheme === 'dark' ? 'bg-[#1e1e1e]' : 'bg-white'
            } min-w-0 overflow-hidden`}
            style={{
              paddingBottom: isTerminalOpen ? `${terminalHeight}px` : '0'
            }}
          >
            {editorTabs.length > 0 ? (
              <div className="h-full flex flex-col">
                {/* Editor Tabs */}
                <div className={`h-10 flex items-center border-b transition-colors duration-200 ${
                  currentTheme === 'dark' ? 'border-[#404040] bg-[#252526]' : 'border-gray-200 bg-white'
                } overflow-x-auto`}>
                  {editorTabs.map((tab) => (
                    <div
                      key={tab.file.appwriteId}
                      className={`group flex items-center h-full px-4 border-r transition-colors duration-200 ${
                        currentTheme === 'dark' ? 'border-[#404040]' : 'border-gray-200'
                      } cursor-pointer flex-shrink-0 ${
                        tab.isActive 
                          ? currentTheme === 'dark' ? 'bg-[#404040]' : 'bg-gray-200'
                          : currentTheme === 'dark' ? 'bg-[#2d2d2d]' : 'bg-gray-50'
                      }`}
                      onClick={() => handleTabClick(tab)}
                    >
                      <File className={`w-4 h-4 mr-2 ${
                        currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                      } flex-shrink-0`} />
                      <span className={`text-sm ${
                        currentTheme === 'dark' ? 'text-gray-200' : 'text-gray-900'
                      } whitespace-nowrap truncate max-w-[150px]`}>
                        {tab.file.name}
                      </span>
                      <button
                        className={`ml-2 p-1 rounded transition-colors duration-200 ${
                          currentTheme === 'dark' 
                            ? 'hover:bg-[#404040]' 
                            : 'hover:bg-gray-200'
                        } opacity-0 group-hover:opacity-100 flex-shrink-0`}
                        onClick={(e) => handleTabClose(e, tab)}
                      >
                        <X className={`w-3 h-3 ${
                          currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }`} />
                      </button>
                    </div>
                  ))}
                </div>
                
                {/* Editor */}
                <div className="flex-1 min-h-0">
                  {fileContent ? (
                    <div className="h-full overflow-auto">
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
                          scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible',
                            useShadows: true,
                            verticalScrollbarSize: 16,
                            horizontalScrollbarSize: 16,
                            verticalSliderSize: 12,
                            horizontalSliderSize: 12,
                            arrowSize: 13,
                            verticalHasArrows: true,
                            horizontalHasArrows: true,
                          },
                          overviewRulerBorder: true,
                          overviewRulerLanes: 3,
                          fixedOverflowWidgets: true,
                        }}
                        className="h-full"
                      />
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center space-y-4">
                        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${
                          currentTheme === 'dark' ? 'border-[#007acc]' : 'border-blue-500'
                        } mx-auto`}></div>
                        <p className={
                          currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                        }>
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
                    currentTheme === 'dark' ? 'text-gray-400' : 'text-gray-300'
                  } mx-auto`} />
                  <p className={
                    currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }>
                    Select a file to view its contents
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Terminal */}
      {isTerminalOpen && (
        <div 
          className={`fixed bottom-0 left-[calc(12px+16rem)] right-0 border-t transition-colors duration-200 ${
            currentTheme === 'dark' ? 'border-[#404040] bg-[#1E1E1E]' : 'border-gray-200 bg-white'
          }`}
          style={{ 
            height: `${terminalHeight}px`,
            width: isSidebarOpen ? 'calc(100% - 16rem - 3rem)' : 'calc(100% - 3rem)',
            left: isSidebarOpen ? 'calc(16rem + 3rem)' : '3rem',
            zIndex: 30
          }}
        >
          <div 
            className={`absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-500/50 transition-colors duration-200 ${
              currentTheme === 'dark' ? 'bg-[#404040]' : 'bg-gray-200'
            }`}
            onMouseDown={handleMouseDown}
          />
          <div className="flex items-center justify-between px-4 py-2 border-b transition-colors duration-200 ${
            currentTheme === 'dark' ? 'border-[#404040]' : 'border-gray-200'
          }">
            <span className={`text-sm font-medium ${
              currentTheme === 'dark' ? 'text-gray-300' : 'text-gray-600'
            }`}>Terminal</span>
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 ${
                currentTheme === 'dark'
                  ? 'text-gray-300 hover:text-white hover:bg-[#404040]'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
              }`}
              onClick={() => setIsTerminalOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div ref={terminalRef} className="h-[calc(100%-2.5rem)] p-2" />
        </div>
      )}

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