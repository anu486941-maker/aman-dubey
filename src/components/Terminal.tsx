import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, ShieldAlert } from 'lucide-react';
import { VirtualFile, Process } from '../types';

interface TerminalProps {
  files: VirtualFile[];
  processes: Process[];
  terminalLog: string[];
  onAddTerminalLine: (line: string) => void;
  onClearTerminal: () => void;
  onOpenFile: (filename: string) => void;
  onExecuteCommand: (command: string) => void;
}

export default function Terminal({
  files,
  processes,
  terminalLog,
  onAddTerminalLine,
  onClearTerminal,
  onOpenFile,
  onExecuteCommand
}: TerminalProps) {
  const [inputValue, setInputValue] = useState('');
  const terminalEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [terminalLog]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    
    onExecuteCommand(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full bg-black/90 border border-cyan-950 rounded-xl overflow-hidden font-mono text-cyan-400">
      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-cyan-950 bg-slate-950">
        <div className="flex items-center gap-2">
          <TerminalIcon className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400/80">JARVIS DECRYPTED INTERACTIVE SHELL</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button 
            onClick={onClearTerminal}
            className="text-[9px] px-2 py-0.5 border border-cyan-950 hover:border-cyan-800 bg-cyan-950/20 hover:bg-cyan-950/50 rounded text-cyan-400/80 transition-all"
          >
            CLEAR LOG
          </button>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
        </div>
      </div>

      {/* Terminal Output */}
      <div className="flex-1 p-4 overflow-y-auto space-y-1.5 text-xs text-left selection:bg-cyan-900 selection:text-white scrollbar-thin">
        {terminalLog.map((line, idx) => {
          let color = 'text-cyan-400';
          if (line.startsWith('>') || line.startsWith('C:\\Users\\Sir>')) {
            color = 'text-white font-bold';
          } else if (line.toLowerCase().includes('error') || line.toLowerCase().includes('failed') || line.toLowerCase().includes('refused')) {
            color = 'text-red-400';
          } else if (line.toLowerCase().includes('success') || line.toLowerCase().includes('complete') || line.toLowerCase().includes('online')) {
            color = 'text-emerald-400';
          } else if (line.startsWith('[SYSTEM]')) {
            color = 'text-yellow-400';
          } else if (line.startsWith('[JARVIS]')) {
            color = 'text-cyan-300';
          }

          return (
            <div key={idx} className={`whitespace-pre-wrap leading-relaxed ${color}`}>
              {line}
            </div>
          );
        })}
        <div ref={terminalEndRef} />
      </div>

      {/* Terminal Command Input */}
      <form onSubmit={handleSubmit} className="flex items-center border-t border-cyan-950 bg-slate-950 px-3 py-2.5">
        <span className="text-white font-bold mr-2 text-xs select-none">C:\Users\Sir&gt;</span>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter command (e.g. 'dir', 'tasklist', 'systeminfo', 'ping google.com', 'help')..."
          className="flex-1 bg-transparent border-none outline-none text-white text-xs font-mono placeholder:text-cyan-950"
          autoComplete="off"
          spellCheck="false"
        />
      </form>
    </div>
  );
}
