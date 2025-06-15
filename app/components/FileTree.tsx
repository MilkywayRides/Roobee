import { useState } from 'react';
import { ChevronRight, ChevronDown, Folder, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileNode {
  name: string;
  path: string;
  type: string;
  size: number;
  children?: FileNode[];
}

interface FileTreeProps {
  files: FileNode[];
  onFileClick?: (file: FileNode) => void;
}

const FileTree = ({ files, onFileClick }: FileTreeProps) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  const toggleFolder = (path: string) => {
    setExpandedFolders(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const renderNode = (node: FileNode, level: number = 0) => {
    const isFolder = node.type === 'folder';
    const isExpanded = expandedFolders.has(node.path);
    const indent = level * 20;

    return (
      <div key={node.path}>
        <div
          className={cn(
            "flex items-center py-1 px-2 hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer rounded-md",
            "transition-colors duration-200"
          )}
          style={{ paddingLeft: `${indent + 8}px` }}
          onClick={() => isFolder ? toggleFolder(node.path) : onFileClick?.(node)}
        >
          {isFolder ? (
            <>
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              )}
              <Folder className="w-4 h-4 ml-1 text-blue-500 dark:text-blue-400" />
            </>
          ) : (
            <File className="w-4 h-4 ml-5 text-gray-500 dark:text-gray-400" />
          )}
          <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
            {node.name}
          </span>
          {!isFolder && (
            <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
              {(node.size / 1024).toFixed(1)} KB
            </span>
          )}
        </div>
        {isFolder && isExpanded && node.children && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full overflow-auto">
      {files.map(file => renderNode(file))}
    </div>
  );
};

export default FileTree; 