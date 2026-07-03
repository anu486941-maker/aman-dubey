import React, { useState } from 'react';
import { Folder, FileText, Plus, Trash2, Search, RefreshCw, FileCode } from 'lucide-react';
import { VirtualFile } from '../types';

interface FileSystemProps {
  files: VirtualFile[];
  onOpenFile: (filename: string) => void;
  onDeleteFile: (filename: string) => void;
  onCreateFile: (name: string, content: string) => void;
}

export default function FileSystem({ files, onOpenFile, onDeleteFile, onCreateFile }: FileSystemProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [newFileName, setNewFileName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const filteredFiles = files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFileName.trim()) return;

    // Default template text for new files
    const extension = newFileName.split('.').pop() || 'txt';
    let defaultContent = `// File created on ${new Date().toLocaleDateString()}\n// Initialized via JARVIS System core, Sir.\n`;
    if (extension === 'txt' || extension === 'md') {
      defaultContent = `# ${newFileName}\nCreated on ${new Date().toLocaleDateString()}\nInitialized via JARVIS, Sir.\n`;
    }

    onCreateFile(newFileName.trim(), defaultContent);
    setNewFileName('');
    setIsCreating(false);
  };

  const getFileIcon = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase();
    if (['js', 'ts', 'jsx', 'tsx', 'json', 'py', 'sh', 'html', 'css'].includes(ext || '')) {
      return <FileCode className="w-4 h-4 text-cyan-400" />;
    }
    return <FileText className="w-4 h-4 text-cyan-500/80" />;
  };

  return (
    <div className="flex flex-col h-full bg-slate-950/90 border border-cyan-900/40 rounded-xl overflow-hidden font-mono text-cyan-400">
      {/* Explorer Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-cyan-900/20 bg-slate-950">
        <div className="flex items-center gap-2">
          <Folder className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400/80">JARVIS VIRTUAL STORAGE UNIT</span>
        </div>
        <button
          onClick={() => setIsCreating(!isCreating)}
          className="flex items-center gap-1 text-[9px] px-2 py-1 border border-cyan-800 hover:border-cyan-400 bg-cyan-950/40 hover:bg-cyan-900/40 text-cyan-300 rounded transition-all"
        >
          <Plus className="w-3 h-3" />
          ADD FILE
        </button>
      </div>

      {/* Explorer Toolbar */}
      <div className="px-4 py-2 border-b border-cyan-900/10 bg-slate-950/40 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-cyan-600" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search directory..."
            className="w-full bg-slate-950 border border-cyan-950 rounded px-2.5 py-1.5 pl-8 text-xs text-white outline-none focus:border-cyan-800"
          />
        </div>
      </div>

      {/* File Creation Form */}
      {isCreating && (
        <form onSubmit={handleCreate} className="p-3 bg-slate-900/30 border-b border-cyan-900/20 flex gap-2">
          <input
            type="text"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
            placeholder="Filename (e.g. system_report.txt)"
            className="flex-1 bg-slate-950 border border-cyan-900/40 rounded px-2.5 py-1.5 text-xs text-white outline-none focus:border-cyan-500"
            required
            autoFocus
          />
          <button
            type="submit"
            className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded transition-all"
          >
            CREATE
          </button>
          <button
            type="button"
            onClick={() => setIsCreating(false)}
            className="px-2 py-1 border border-cyan-950 text-slate-400 hover:text-white text-xs rounded"
          >
            CANCEL
          </button>
        </form>
      )}

      {/* Directory Table */}
      <div className="flex-1 overflow-y-auto max-h-[350px] scrollbar-thin">
        {filteredFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center text-slate-500 text-xs">
            <Folder className="w-8 h-8 text-slate-700 mb-2" />
            <span>Directory empty or no search matches.</span>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-cyan-950 text-[10px] text-cyan-600 uppercase">
                <th className="py-2 px-4 font-bold">NAME</th>
                <th className="py-2 px-4 font-bold hidden sm:table-cell">SIZE</th>
                <th className="py-2 px-4 font-bold hidden md:table-cell">LAST MODIFIED</th>
                <th className="py-2 px-4 font-bold text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.map((file) => (
                <tr
                  key={file.name}
                  className="border-b border-cyan-950/40 hover:bg-cyan-950/10 cursor-pointer transition-all"
                  onClick={() => onOpenFile(file.name)}
                >
                  <td className="py-2.5 px-4 flex items-center gap-2 text-xs">
                    {getFileIcon(file.name)}
                    <span className="text-slate-200 font-bold hover:text-cyan-300 transition-colors">{file.name}</span>
                  </td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-400 hidden sm:table-cell">
                    {(file.size / 1024).toFixed(2)} KB
                  </td>
                  <td className="py-2.5 px-4 text-[11px] text-slate-500 hidden md:table-cell">
                    {file.updatedAt}
                  </td>
                  <td className="py-2.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => onDeleteFile(file.name)}
                      className="p-1 text-slate-500 hover:text-red-400 rounded transition-all"
                      title="Delete virtual file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Directory Footer */}
      <div className="px-4 py-2 border-t border-cyan-950 bg-slate-950 text-[10px] text-slate-500 flex justify-between items-center">
        <span>STORAGE: C:\Users\Sir\Documents</span>
        <span>FILES: {files.length} ITEMS TOTAL</span>
      </div>
    </div>
  );
}
