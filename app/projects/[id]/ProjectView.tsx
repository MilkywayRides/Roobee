// ProjectView.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useTheme } from "next-themes";
import Head from 'next/head';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import Editor, { loader } from '@monaco-editor/react';
import { toast } from 'react-hot-toast';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
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
  Download as DownloadIcon,
  Video
} from 'lucide-react';
import { UserProfile } from "@/components/dashboard/user-profile";
import JSZip from 'jszip';
import { Terminal } from 'xterm';
import { FitAddon } from 'xterm-addon-fit';
import { WebLinksAddon } from 'xterm-addon-web-links';
import 'xterm/css/xterm.css';
import dynamic from 'next/dynamic';
import { OwnerAvatar } from "@/components/ui/owner-avatar";

interface FileNode {
  name: string;
  path: string;
  appwriteId: string;
  type: 'file' | 'folder';
  size?: number;
  children?: FileNode[];
}

interface EditorTab {
  file: FileNode;
  content: string;
  isActive: boolean;
}

interface Project {
  id: string;
  name: string;
  description: string;
  owner: {
    name: string;
    email: string;
    image: string;
  };
  files: FileNode[];
}

type SidebarTab = 'explorer' | 'search' | 'source' | 'git' | 'debug' | 'extensions';

interface FileTypeInfo {
  icon: React.ComponentType<{ className?: string }>;
  language: string;
}

const getFileTypeInfo = (filename: string): FileTypeInfo => {
  const extension = filename.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'js':
    case 'jsx':
      return { icon: Code, language: 'javascript' };
    case 'ts':
    case 'tsx':
      return { icon: Code, language: 'typescript' };
    case 'html':
      return { icon: FileText, language: 'html' };
    case 'css':
    case 'scss':
      return { icon: FileText, language: 'css' };
    case 'json':
      return { icon: FileJson, language: 'json' };
    case 'md':
      return { icon: FileText, language: 'markdown' };
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'webp':
      return { icon: ImageIcon, language: 'image' };
    case 'mp4':
    case 'webm':
    case 'mov':
      return { icon: Video, language: 'video' };
    case 'py':
      return { icon: Code, language: 'python' };
    case 'java':
      return { icon: Code, language: 'java' };
    case 'c':
    case 'cpp':
    case 'h':
    case 'hpp':
      return { icon: Code, language: 'cpp' };
    case 'go':
      return { icon: Code, language: 'go' };
    case 'rs':
      return { icon: Code, language: 'rust' };
    case 'php':
      return { icon: Code, language: 'php' };
    case 'rb':
      return { icon: Code, language: 'ruby' };
    case 'swift':
      return { icon: Code, language: 'swift' };
    case 'kt':
    case 'kts':
      return { icon: Code, language: 'kotlin' };
    case 'sql':
      return { icon: Code, language: 'sql' };
    case 'sh':
    case 'bash':
      return { icon: Code, language: 'shell' };
    case 'yaml':
    case 'yml':
      return { icon: FileText, language: 'yaml' };
    case 'xml':
      return { icon: FileText, language: 'xml' };
    case 'svg':
      return { icon: ImageIcon, language: 'svg' };
    default:
      return { icon: FileCode2, language: 'plaintext' };
  }
};

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

  const handleClick = () => {
    if (node.type === 'folder') {
      setIsExpanded(!isExpanded);
    } else {
      onFileClick(node);
    }
  };

  const { icon: FileIconComponent } = getFileTypeInfo(node.name);

  return (
    <div>
      <div
        className="flex items-center py-1.5 px-3 cursor-pointer rounded-sm group transition-all duration-200 hover:bg-muted/80 active:bg-muted"
        style={{ paddingLeft: `${level * 20 + 12}px` }}
        onClick={handleClick}
      >
        {node.type === 'folder' ? (
          <div className="flex items-center">
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 mr-2 text-muted-foreground transition-transform duration-200" />
            ) : (
              <ChevronRight className="w-4 h-4 mr-2 text-muted-foreground transition-transform duration-200" />
            )}
            <Folder className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
          </div>
        ) : (
          <div className="flex items-center">
            <div className="w-6 h-4 mr-2 flex items-center">
              <FileIconComponent className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors duration-200" />
            </div>
          </div>
        )}
        <span className="text-sm font-medium text-foreground/90 group-hover:text-foreground transition-colors duration-200">
          {node.name}
        </span>
      </div>

      {node.type === 'folder' && isExpanded && node.children && (
        <div className="transition-all duration-200">
          {node.children
            .sort((a, b) => {
              if (a.type === b.type) return (a.name || '').localeCompare(b.name || '');
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

const shineAnimation = `
@keyframes shine {
  0% {
    transform: translateX(-100%);
  }
  20%, 100% {
    transform: translateX(100%);
  }
}
`;

export default function ProjectView({ project }: { project: Project }) {
  const { theme: currentTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<EditorTab | null>(null);
  const [tabs, setTabs] = useState<EditorTab[]>([]);
  const [activeSidebarTab, setActiveSidebarTab] = useState<SidebarTab>('explorer');
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(300);
  const [fileContent, setFileContent] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const terminalInstanceRef = useRef<Terminal | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const isDraggingRef = useRef(false);
  const startYRef = useRef(0);
  const startHeightRef = useRef(0);
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);

  // Configure Monaco loader
  useEffect(() => {
    loader.config({
      paths: {
        vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.45.0/min/vs'
      }
    });
  }, []);

  // Handle initial mount
  useEffect(() => {
    try {
      setMounted(true);
      console.log('ProjectView mounted with project:', {
        id: project.id,
        name: project.name,
        description: project.description,
        owner: project.owner,
        filesCount: project.files.length,
        files: project.files
      });
    } catch (err) {
      console.error('Error in ProjectView mount:', err);
      setError('Failed to load project view');
    }
  }, [project]);

  // Add the style tag for the animation
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = shineAnimation;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Initialize Monaco editor
  const handleEditorDidMount = (editor: any, monaco: any) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Define custom themes with optimized colors
    monaco.editor.defineTheme('custom-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '008000', fontStyle: 'italic' },
        { token: 'keyword', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'string', foreground: 'A31515' },
        { token: 'number', foreground: '098658' },
        { token: 'type', foreground: '267F99', fontStyle: 'bold' },
        { token: 'function', foreground: '795E26', fontStyle: 'bold' },
        { token: 'variable', foreground: '001080' },
        { token: 'constant', foreground: '0070C1', fontStyle: 'bold' },
        { token: 'operator', foreground: '000000' },
        { token: 'delimiter', foreground: '000000' },
        { token: 'tag', foreground: '0000FF', fontStyle: 'bold' },
        { token: 'attribute', foreground: '001080' },
      ],
      colors: {
        'editor.background': '#FFFFFF',
        'editor.foreground': '#000000',
        'editor.lineHighlightBackground': '#F5F5F5',
        'editor.selectionBackground': '#ADD6FF',
        'editor.inactiveSelectionBackground': '#E5EBF1',
        'editorCursor.foreground': '#000000',
        'editorWhitespace.foreground': '#B3B3B3',
        'editorIndentGuide.background': '#D3D3D3',
        'editorIndentGuide.activeBackground': '#939393',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#000000',
        'editorGutter.background': '#FFFFFF',
        'editorError.foreground': '#E51400',
        'editorWarning.foreground': '#FF8C00',
        'editorInfo.foreground': '#007ACC',
        'editorBracketMatch.background': '#E5EBF1',
        'editorBracketMatch.border': '#B3B3B3',
        'editorSuggestWidget.background': '#FFFFFF',
        'editorSuggestWidget.border': '#B3B3B3',
        'editorSuggestWidget.selectedBackground': '#E5EBF1',
        'editorSuggestWidget.highlightForeground': '#007ACC',
        'editorHoverWidget.background': '#FFFFFF',
        'editorHoverWidget.border': '#B3B3B3',
        'editorWidget.background': '#FFFFFF',
        'editorWidget.border': '#B3B3B3',
        'editorWidget.shadow': '#000000',
        'editorWidget.resizeBorder': '#B3B3B3',
        'editorWidget.foreground': '#000000'
      }
    });

    monaco.editor.defineTheme('custom-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'type', foreground: '4EC9B0', fontStyle: 'bold' },
        { token: 'function', foreground: 'DCDCAA', fontStyle: 'bold' },
        { token: 'variable', foreground: '9CDCFE' },
        { token: 'constant', foreground: '4FC1FF', fontStyle: 'bold' },
        { token: 'operator', foreground: 'D4D4D4' },
        { token: 'delimiter', foreground: 'D4D4D4' },
        { token: 'tag', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'attribute', foreground: '9CDCFE' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editor.lineHighlightBackground': '#2A2D2E',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
        'editorCursor.foreground': '#FFFFFF',
        'editorWhitespace.foreground': '#3B3B3B',
        'editorIndentGuide.background': '#404040',
        'editorIndentGuide.activeBackground': '#707070',
        'editorLineNumber.foreground': '#858585',
        'editorLineNumber.activeForeground': '#C6C6C6',
        'editorGutter.background': '#1E1E1E',
        'editorError.foreground': '#F48771',
        'editorWarning.foreground': '#CCA700',
        'editorInfo.foreground': '#75BEFF',
        'editorBracketMatch.background': '#3A3D41',
        'editorBracketMatch.border': '#7F7F7F',
        'editorSuggestWidget.background': '#252526',
        'editorSuggestWidget.border': '#454545',
        'editorSuggestWidget.selectedBackground': '#37373D',
        'editorSuggestWidget.highlightForeground': '#75BEFF',
        'editorHoverWidget.background': '#252526',
        'editorHoverWidget.border': '#454545',
      }
    });

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
    if (!monacoRef.current) return;

    const editorTheme = currentTheme === 'dark' ? 'custom-dark' : 'custom-light';
    monacoRef.current.editor.setTheme(editorTheme);
  }, [currentTheme]);

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

    if (isTerminalOpen && terminalRef.current && !terminalInstanceRef.current) {
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
          if (!terminalInstanceRef.current) return;
          const terminal = terminalInstanceRef.current;

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
          const maxSize = Math.max(...nodes.map(n => n.size?.toString()?.length || 0));
          const maxName = Math.max(...nodes.map(n => n.name.length));

          nodes.forEach(node => {
            const prefix = node.type === 'folder' ? 'd' : '-';
            const permissions = 'rw-r--r--';
            const sizeStr = node.type === 'folder' ? '4096' : (node.size?.toString() || '0').padStart(maxSize);
            const fileDate = new Date().toLocaleDateString('en-US', {
              month: 'numeric',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            });
            const name = node.name.padEnd(maxName);
            terminal.writeln(`${prefix}${permissions} ${sizeStr} ${fileDate} ${name}`);
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

        terminalInstanceRef.current = term;

        // Handle window resize
        const handleResize = () => {
          fitAddon.fit();
        };
        window.addEventListener('resize', handleResize);

        cleanup = () => {
          window.removeEventListener('resize', handleResize);
          term.dispose();
          terminalInstanceRef.current = null;
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
      const existingTab = tabs.find(tab => tab.file.appwriteId === file.appwriteId);

      if (existingTab) {
        // If file is already open, just activate its tab
        setTabs(tabs =>
          tabs.map(tab => ({
            ...tab,
            isActive: tab.file.appwriteId === file.appwriteId
          }))
        );
        setActiveTab(existingTab);
      } else {
        // If file is not open, create a new tab
        const fileType = getFileTypeInfo(file.name).language;
        let content;

        if (fileType === 'image' || fileType === 'video') {
          // For media files, use the file URL directly
          content = `/api/files/content/${file.appwriteId}`;
        } else {
          // For other files, get the text content
          const response = await fetch(`/api/files/content/${file.appwriteId}`);
          content = await response.text();
        }

        // Add new tab and deactivate others
        setTabs(tabs => [
          ...tabs.map(tab => ({ ...tab, isActive: false })),
          { file, content, isActive: true }
        ]);
        setActiveTab({ file, content, isActive: true });
      }
    } catch (error) {
      console.error('Error loading file:', error);
      toast.error('Failed to load file');
    }
  };

  const handleTabClick = (tab: EditorTab) => {
    setActiveTab(tab);
    setTabs(tabs =>
      tabs.map(t => ({
        ...t,
        isActive: t.file.appwriteId === tab.file.appwriteId
      }))
    );
  };

  const handleTabClose = (e: React.MouseEvent, tab: EditorTab) => {
    e.stopPropagation();

    const newTabs = tabs.filter(t => t.file.appwriteId !== tab.file.appwriteId);
    setTabs(newTabs);

    if (tab.isActive && newTabs.length > 0) {
      // If closing active tab, activate the last tab
      const lastTab = newTabs[newTabs.length - 1];
      setActiveTab(lastTab);
    } else if (newTabs.length === 0) {
      // If no tabs left, clear the editor
      setActiveTab(null);
    }
  };

  const handleDownload = async () => {
    try {
      const zip = new JSZip();

      // Add each file to the zip
      for (const tab of tabs) {
        zip.file(tab.file.path, tab.content);
      }

      // Generate the zip file
      const content = await zip.generateAsync({ type: 'blob' });

      // Create a download link
      const url = window.URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.name}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success('Download started');
    } catch (error) {
      console.error('Error downloading files:', error);
      toast.error('Failed to download files');
    }
  };

  const fileTree = project.files || [];

  const handleSidebarTabClick = (tab: SidebarTab) => {
    setActiveSidebarTab(tab);
  };

  // Generate meta description
  const metaDescription = `View and edit ${project.name} - A project by ${project.owner.name || 'Anonymous'}. Explore files, code, and collaborate in real-time.`;

  // Show error if there is one
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-red-500">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  // Show loading if not mounted
  if (!mounted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>{project.name}</title>
        <meta name="description" content={metaDescription} />
        <meta name="keywords" content={`code editor, ${project.name}, programming, development, collaboration`} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={project.name} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={project.owner.image || '/default-project-image.png'} />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={project.name} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={project.owner.image || '/default-project-image.png'} />
        
        {/* Additional SEO meta tags */}
        <meta name="author" content={project.owner.name || 'Anonymous'} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href={`/projects/${project.id}`} />
      </Head>

      <div 
        suppressHydrationWarning 
        className="h-screen overflow-hidden transition-colors duration-200 bg-background text-foreground"
        role="application"
        aria-label={`${project.name} code editor`}
      >
        {/* Menu Bar */}
        <header className="h-10 border-b border-border bg-background flex items-center px-4">
          <nav className="flex items-center space-x-4" aria-label="Project navigation">
            <span className="text-sm font-medium text-foreground">
              <HoverCard>
                <HoverCardTrigger>
                  <Button variant="link" aria-label={`Project owner: ${project.owner.name || 'Anonymous'}`}>
                    @{project.owner.name || 'Anonymous'}
                  </Button>
                </HoverCardTrigger>
                <HoverCardContent className="flex items-center gap-2">
                  <span className='text-small'>This Project Is Created By {project.owner.name || 'Anonymous'}</span>
                </HoverCardContent>
              </HoverCard>
              <span>/</span>
              <span className='ml-2'>{project.name}</span>
            </span>
          </nav>
        </header>

        {/* Activity Bar */}
        <aside 
          className="fixed left-0 top-10 h-[calc(100vh-2.5rem)] w-12 transition-colors duration-200 bg-muted border-r border-border flex flex-col items-center py-2 z-50"
          aria-label="Activity bar"
        >
          <nav className="flex flex-col items-center h-full" aria-label="Activity navigation">
            <div className="flex flex-col items-center space-y-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 transition-colors duration-200 md:hidden"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                aria-label="Toggle sidebar"
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 transition-colors duration-200"
                onClick={() => handleSidebarTabClick('explorer')}
              >
                <File className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 transition-colors duration-200"
                onClick={() => handleSidebarTabClick('search')}
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 transition-colors duration-200"
                onClick={() => handleSidebarTabClick('source')}
              >
                <GitBranch className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 transition-colors duration-200"
                onClick={() => handleSidebarTabClick('git')}
              >
                <GitPullRequest className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 transition-colors duration-200"
                onClick={() => handleSidebarTabClick('debug')}
              >
                <Bug className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 transition-colors duration-200"
                onClick={() => handleSidebarTabClick('extensions')}
              >
                <LayoutGrid className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-auto pb-2">
              <UserProfile user={project.owner} collapsed={true} />
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="pl-12">
          {/* Split View */}
          <div className="flex h-[calc(100vh-2.5rem)] overflow-hidden">
            {/* Sidebar */}
            <aside 
              className={`w-64 border-r transition-colors duration-200 bg-muted/50 border-border ${isSidebarOpen ? 'block' : 'hidden md:block'}`}
              aria-label="File explorer"
            >
              <header className="h-10 flex items-center px-4 border-b transition-colors duration-200 border-border">
                <h2 className="text-sm font-medium text-muted-foreground">EXPLORER</h2>
              </header>
              <nav className="overflow-y-auto h-[calc(100%-2.5rem)] bg-background" aria-label="File tree">
                {fileTree.map((node, index) => (
                  <FileTreeNode 
                    key={index} 
                    node={node} 
                    onFileClick={handleFileClick}
                  />
                ))}
              </nav>
            </aside>

            {/* Editor Area */}
            <section className="flex-1 flex flex-col" aria-label="Editor area">
              {/* Editor Tabs */}
              <nav className="flex-none border-b border-border bg-background" aria-label="File tabs">
                <div className="flex items-center h-10 px-2 overflow-x-auto scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                  {tabs.map((tab) => {
                    const fileTypeInfo = getFileTypeInfo(tab.file.name);
                    const Icon = fileTypeInfo.icon;
                    return (
                      <div
                        key={tab.file.path}
                        className={`group flex items-center h-10 px-3 text-sm font-medium cursor-pointer border-r border-border transition-all duration-200 ${tab.isActive
                          ? 'bg-background text-foreground border-t-2 border-t-primary'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                        }`}
                        onClick={() => handleTabClick(tab)}
                        role="tab"
                        aria-selected={tab.isActive}
                        aria-label={`${tab.file.name} tab`}
                      >
                        <Icon className="h-4 w-4 mr-2 transition-colors duration-200" aria-hidden="true" />
                        <span className="truncate max-w-[150px]">{tab.file.name}</span>
                        <button
                          className="ml-2 p-1 rounded-sm opacity-0 group-hover:opacity-100 hover:bg-muted transition-all duration-200"
                          onClick={(e) => handleTabClose(e, tab)}
                          aria-label={`Close ${tab.file.name} tab`}
                        >
                          <X className="h-3 w-3" aria-hidden="true" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </nav>

              {/* Editor */}
              <div className="flex-1 relative bg-white dark:bg-[#1E1E1E]" role="region" aria-label="Editor content">
                {activeTab && (
                  <>
                    {getFileTypeInfo(activeTab.file.name).language === 'image' ? (
                      <figure className="h-full w-full flex items-center justify-center bg-white dark:bg-[#1E1E1E] p-4">
                        <div className="relative w-full h-full flex items-center justify-center">
                          <img 
                            src={activeTab.content} 
                            alt={activeTab.file.name}
                            className="max-h-full max-w-full object-contain rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                            loading="lazy"
                          />
                        </div>
                      </figure>
                    ) : getFileTypeInfo(activeTab.file.name).language === 'video' ? (
                      <figure className="h-full w-full flex items-center justify-center bg-white dark:bg-[#1E1E1E] p-4">
                        <div className="relative w-full h-full flex items-center justify-center">
                          <video 
                            src={activeTab.content} 
                            controls
                            className="max-h-full max-w-full rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
                            preload="metadata"
                            aria-label={`Video: ${activeTab.file.name}`}
                          >
                            Your browser does not support the video tag.
                          </video>
                        </div>
                      </figure>
                    ) : (
                      <Editor
                        height="100%"
                        defaultLanguage={getFileTypeInfo(activeTab.file.name).language}
                        value={activeTab.content}
                        theme={currentTheme === 'dark' ? 'custom-dark' : 'custom-light'}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 14,
                          lineNumbers: 'on',
                          roundedSelection: false,
                          scrollBeyondLastLine: false,
                          readOnly: true,
                          wordWrap: 'on',
                          padding: { top: 16, bottom: 16 },
                          renderLineHighlight: 'all',
                          renderWhitespace: 'selection',
                          scrollbar: {
                            vertical: 'visible',
                            horizontal: 'visible',
                            useShadows: false,
                            verticalScrollbarSize: 10,
                            horizontalScrollbarSize: 10,
                          },
                          bracketPairColorization: {
                            enabled: true,
                          },
                          guides: {
                            bracketPairs: true,
                            indentation: true,
                            highlightActiveIndentation: true,
                          },
                        }}
                        onMount={handleEditorDidMount}
                        aria-label={`Code editor for ${activeTab.file.name}`}
                      />
                    )}
                  </>
                )}
              </div>

              {/* Status Bar */}
              <footer className="flex-none h-6 border-t border-border bg-muted">
                <div className="flex items-center justify-between h-full px-4">
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-muted-foreground">
                      {activeTab ? getFileTypeInfo(activeTab.file.name).language.toUpperCase() : ''}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {activeTab ? `${activeTab.content.split('\n').length} lines` : ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-muted-foreground hover:text-foreground relative overflow-hidden group"
                      onClick={handleDownload}
                      aria-label="Download project files"
                    >
                      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shine" />
                      <DownloadIcon className="h-3 w-3 mr-1" aria-hidden="true" />
                      <span className="text-xs">Download</span>
                    </Button>
                  </div>
                </div>
              </footer>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}