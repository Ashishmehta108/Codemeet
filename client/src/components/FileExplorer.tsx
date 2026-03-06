import React, { useState } from 'react';
import { ChevronRight, ChevronDown, File, Folder, Trash2, FolderPlus, FilePlus } from 'lucide-react';
import { cn } from '../lib/utils';

export interface FileNode {
  id: string;
  name: string;
  type: 'file' | 'folder';
  children?: FileNode[];
  content?: string;
  parentId?: string | null;
}

interface FileExplorerProps {
  files: FileNode[];
  onFileSelect: (file: FileNode) => void;
  selectedFileId?: string;
  onCreateFile: (parentId: string | null) => void;
  onCreateFolder: (parentId: string | null) => void;
  onDelete: (id: string) => void;
}

const FileTreeItem: React.FC<{
  node: FileNode;
  level: number;
  onFileSelect: (file: FileNode) => void;
  selectedFileId?: string;
  onCreateFile: (parentId: string | null) => void;
  onCreateFolder: (parentId: string | null) => void;
  onDelete: (id: string) => void;
}> = ({ node, level, onFileSelect, selectedFileId, onCreateFile, onCreateFolder, onDelete }) => {
  const [isOpen, setIsOpen] = useState(true);

  const isFolder = node.type === 'folder';
  const isSelected = selectedFileId === node.id;

  return (
    <div className="select-none">
      <div
        className={cn(
          "group flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-zinc-800/50 rounded-md transition-colors",
          isSelected && "bg-blue-600/20 text-blue-400"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={() => {
          if (isFolder) setIsOpen(!isOpen);
          else onFileSelect(node);
        }}
      >
        <span className="text-zinc-500">
          {isFolder ? (
            isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
          ) : (
            <File className="h-4 w-4 text-zinc-400" />
          )}
        </span>
        {isFolder && <Folder className="h-4 w-4 text-blue-500/70" />}
        <span className="text-sm truncate">{node.name}</span>

        <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-1">
          {isFolder && (
            <>
              <button onClick={(e) => { e.stopPropagation(); onCreateFile(node.id); }} title="New File">
                <FilePlus className="h-3 w-3 text-zinc-500 hover:text-blue-400" />
              </button>
              <button onClick={(e) => { e.stopPropagation(); onCreateFolder(node.id); }} title="New Folder">
                <FolderPlus className="h-3 w-3 text-zinc-500 hover:text-blue-400" />
              </button>
            </>
          )}
          <button onClick={(e) => { e.stopPropagation(); onDelete(node.id); }} title="Delete">
            <Trash2 className="h-3 w-3 text-zinc-500 hover:text-rose-400" />
          </button>
        </div>
      </div>

      {isFolder && isOpen && node.children && (
        <div>
          {node.children.map((child) => (
            <FileTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              onFileSelect={onFileSelect}
              selectedFileId={selectedFileId}
              onCreateFile={onCreateFile}
              onCreateFolder={onCreateFolder}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  onFileSelect,
  selectedFileId,
  onCreateFile,
  onCreateFolder,
  onDelete,
}) => {
  return (
    <div className="flex flex-col h-full bg-zinc-950/50 border-r border-zinc-800 w-64">
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Explorer</span>
        <div className="flex items-center gap-2">
          <button onClick={() => onCreateFile(null)} title="New File">
            <FilePlus className="h-4 w-4 text-zinc-500 hover:text-blue-400 transition-colors" />
          </button>
          <button onClick={() => onCreateFolder(null)} title="New Folder">
            <FolderPlus className="h-4 w-4 text-zinc-500 hover:text-blue-400 transition-colors" />
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-2">
        {files.map((file) => (
          <FileTreeItem
            key={file.id}
            node={file}
            level={0}
            onFileSelect={onFileSelect}
            selectedFileId={selectedFileId}
            onCreateFile={onCreateFile}
            onCreateFolder={onCreateFolder}
            onDelete={onDelete}
          />
        ))}
        {files.length === 0 && (
          <div className="px-4 py-8 text-center">
            <p className="text-xs text-zinc-600 italic">No files yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
