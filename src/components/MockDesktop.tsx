import React, { useState, useEffect, useRef } from 'react';
import { 
  X, Square, Minus, FileText, Globe, Calculator, Cpu, ShieldCheck, 
  Terminal as TermIcon, HardDrive, AlertTriangle, RefreshCw, Send, Check,
  Lock, Unlock, Key, Eye, EyeOff, Mic, Laptop, Fingerprint, CheckCircle
} from 'lucide-react';
import { AppWindow, AppWindowType, VirtualFile, SystemMetrics, Process } from '../types';

interface MockDesktopProps {
  windows: AppWindow[];
  activeWindowId: AppWindowType | null;
  files: VirtualFile[];
  metrics: SystemMetrics;
  processes: Process[];
  searchSources: { uri: string; title: string }[];
  searchQuery: string;
  notepadActiveFile?: string;
  isVoiceAuthEnabled: boolean;
  voiceAuthPassword: string;
  onChangeVoiceAuthEnabled: (val: boolean) => void;
  onChangeVoiceAuthPassword: (val: string) => void;
  onCloseWindow: (id: AppWindowType) => void;
  onMinimizeWindow: (id: AppWindowType) => void;
  onMaximizeWindow: (id: AppWindowType) => void;
  onFocusWindow: (id: AppWindowType) => void;
  onUpdateFileContent: (name: string, content: string) => void;
  onExecuteCommand: (cmd: string) => void;
}

export default function MockDesktop({
  windows,
  activeWindowId,
  files,
  metrics,
  processes,
  searchSources,
  searchQuery,
  notepadActiveFile,
  isVoiceAuthEnabled,
  voiceAuthPassword,
  onChangeVoiceAuthEnabled,
  onChangeVoiceAuthPassword,
  onCloseWindow,
  onMinimizeWindow,
  onMaximizeWindow,
  onFocusWindow,
  onUpdateFileContent,
  onExecuteCommand
}: MockDesktopProps) {
  // Notepad local state
  const [selectedFileName, setSelectedFileName] = useState<string>('');
  const [notepadContent, setNotepadContent] = useState<string>('');
  const [isSaved, setIsSaved] = useState(true);

  // Sync Notepad select file from parent prop
  useEffect(() => {
    if (notepadActiveFile) {
      setSelectedFileName(notepadActiveFile);
    }
  }, [notepadActiveFile]);

  // Chrome browser local state
  const [browserUrl, setBrowserUrl] = useState('https://www.google.com');
  const [currentSearch, setCurrentSearch] = useState('');
  const [browserHistory, setBrowserHistory] = useState<string[]>(['https://www.google.com']);
  const [simulatedWebPage, setSimulatedWebPage] = useState<{title: string, body: string} | null>(null);

  // Calculator local state
  const [calcDisplay, setCalcDisplay] = useState('0');
  const [calcFormula, setCalcFormula] = useState('');

  // Security Panel State
  const [isSecurityUnlocked, setIsSecurityUnlocked] = useState(false);
  const [securityPasscodeInput, setSecurityPasscodeInput] = useState('');
  const [newPasscodeInput, setNewPasscodeInput] = useState('');
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');
  const [securityActiveTab, setSecurityActiveTab] = useState<'config' | 'guide'>('config');
  const [showPassword, setShowPassword] = useState(false);

  // Dragging support refs
  const [windowState, setWindowState] = useState<Record<AppWindowType, { x: number; y: number; w: number; h: number }>>({
    notepad: { x: 50, y: 50, w: 580, h: 420 },
    chrome: { x: 120, y: 80, w: 680, h: 450 },
    calculator: { x: 420, y: 150, w: 260, h: 360 },
    cmd: { x: 80, y: 180, w: 600, h: 380 },
    monitor: { x: 160, y: 120, w: 540, h: 440 },
    status: { x: 200, y: 60, w: 500, h: 400 },
  });

  const dragRef = useRef<{ id: AppWindowType; startX: number; startY: number; initX: number; initY: number } | null>(null);

  // Sync Notepad select file
  useEffect(() => {
    if (files.length > 0 && !selectedFileName) {
      setSelectedFileName(files[0].name);
      setNotepadContent(files[0].content);
    }
  }, [files]);

  useEffect(() => {
    const file = files.find(f => f.name === selectedFileName);
    if (file) {
      setNotepadContent(file.content);
      setIsSaved(true);
    }
  }, [selectedFileName]);

  // Sync browser search query from JARVIS action
  useEffect(() => {
    if (searchQuery) {
      setCurrentSearch(searchQuery);
      setBrowserUrl(`https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`);
      setSimulatedWebPage(null);
    }
  }, [searchQuery]);

  // Handle saving notepad
  const handleSaveNotepad = () => {
    if (selectedFileName) {
      onUpdateFileContent(selectedFileName, notepadContent);
      setIsSaved(true);
    }
  };

  // Browser actions
  const handleBrowserSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSearch.trim()) return;
    setBrowserUrl(`https://www.google.com/search?q=${encodeURIComponent(currentSearch)}`);
    setSimulatedWebPage(null);
    onExecuteCommand(`web_search "${currentSearch}"`);
  };

  const handleVisitGroundingSource = (title: string, uri: string) => {
    setBrowserUrl(uri);
    setSimulatedWebPage({
      title: title,
      body: `Grounding source verified, Sir. Initiating full-bandwidth holographic content decryption. This secure URL refers to verified web intelligence databases loaded dynamically by our neural model. Under administrative overrides, the raw HTML markup has been parsed and structured into the summary displayed by the JARVIS Assistant. Safe web browsing is active.`
    });
  };

  // Calculator operations
  const handleCalcBtn = (val: string) => {
    if (val === 'C') {
      setCalcDisplay('0');
      setCalcFormula('');
    } else if (val === '=') {
      try {
        // Safe evaluation of simple math
        const cleanedFormula = calcFormula.replace(/[^-()\d/*+.]/g, '');
        const res = Function(`"use strict"; return (${cleanedFormula})`)();
        setCalcDisplay(String(res));
        setCalcFormula(String(res));
      } catch {
        setCalcDisplay('Error');
      }
    } else {
      let nextFormula = calcFormula;
      if (calcDisplay === '0' && !['+', '-', '*', '/'].includes(val)) {
        setCalcDisplay(val);
        nextFormula = val;
      } else {
        setCalcDisplay(prev => prev === '0' || ['+', '-', '*', '/'].includes(prev) ? val : prev + val);
        nextFormula = calcFormula + val;
      }
      setCalcFormula(nextFormula);
    }
  };

  // Security Panel Handlers
  const handleUnlockSecurity = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');
    if (securityPasscodeInput === voiceAuthPassword) {
      setIsSecurityUnlocked(true);
      setSecurityPasscodeInput('');
    } else {
      setSecurityError('ACCESS DENIED: Credentials mismatch. Administrative authorization failure.');
    }
  };

  const handleLockSecurity = () => {
    setIsSecurityUnlocked(false);
    setSecuritySuccess('');
    setSecurityError('');
  };

  const handleUpdateSecurityPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');
    if (!newPasscodeInput.trim()) {
      setSecurityError('Passcode cannot be blank.');
      return;
    }
    onChangeVoiceAuthPassword(newPasscodeInput.trim());
    setSecuritySuccess('Passcode updated successfully in quantum security core.');
    setNewPasscodeInput('');
  };

  // Drag window start
  const handleMouseDown = (id: AppWindowType, e: React.MouseEvent) => {
    onFocusWindow(id);
    const win = windowState[id];
    // Don't drag if maximized
    const winConfig = windows.find(w => w.id === id);
    if (winConfig?.isMaximized) return;

    dragRef.current = {
      id,
      startX: e.clientX,
      startY: e.clientY,
      initX: win.x,
      initY: win.y
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!dragRef.current) return;
    const { id, startX, startY, initX, initY } = dragRef.current;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    setWindowState(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        x: Math.max(0, Math.min(window.innerWidth - 200, initX + dx)),
        y: Math.max(0, Math.min(window.innerHeight - 150, initY + dy))
      }
    }));
  };

  const handleMouseUp = () => {
    dragRef.current = null;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="absolute inset-0 z-0 pointer-events-auto overflow-hidden select-none">
      {windows.map((win) => {
        if (!win.isOpen || win.isMinimized) return null;

        const pos = windowState[win.id];
        const isActive = activeWindowId === win.id;

        const winStyle: React.CSSProperties = win.isMaximized 
          ? { top: 0, left: 0, width: '100%', height: 'calc(100% - 40px)', zIndex: win.zIndex }
          : { top: pos.y, left: pos.x, width: pos.w, height: pos.h, zIndex: win.zIndex };

        return (
          <div 
            key={win.id}
            style={winStyle}
            onClick={() => onFocusWindow(win.id)}
            className={`absolute flex flex-col border rounded-xl shadow-2xl backdrop-blur-lg overflow-hidden transition-all duration-100 ${
              isActive 
                ? 'border-cyan-500/80 bg-slate-950/95 shadow-cyan-950/40' 
                : 'border-cyan-950 bg-slate-950/90 opacity-80 hover:opacity-95'
            }`}
          >
            {/* Title Bar */}
            <div 
              onMouseDown={(e) => handleMouseDown(win.id, e)}
              className={`flex items-center justify-between px-3.5 py-2.5 font-mono text-[11px] cursor-move select-none ${
                isActive ? 'bg-cyan-950/60 border-b border-cyan-500/30' : 'bg-slate-950 border-b border-cyan-950'
              }`}
            >
              <div className="flex items-center gap-2">
                {win.id === 'notepad' && <FileText className="w-3.5 h-3.5 text-cyan-400" />}
                {win.id === 'chrome' && <Globe className="w-3.5 h-3.5 text-cyan-400" />}
                {win.id === 'calculator' && <Calculator className="w-3.5 h-3.5 text-cyan-400" />}
                {win.id === 'monitor' && <Cpu className="w-3.5 h-3.5 text-cyan-400" />}
                {win.id === 'status' && <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />}
                <span className={`font-bold tracking-wider ${isActive ? 'text-cyan-300' : 'text-cyan-500/70'}`}>
                  {win.title.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center gap-2 pointer-events-auto">
                <button 
                  onClick={(e) => { e.stopPropagation(); onMinimizeWindow(win.id); }}
                  className="p-1 text-slate-500 hover:text-cyan-400 hover:bg-cyan-950/40 rounded transition-all"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onMaximizeWindow(win.id); }}
                  className="p-1 text-slate-500 hover:text-cyan-400 hover:bg-cyan-950/40 rounded transition-all"
                >
                  <Square className="w-2.5 h-2.5" />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); onCloseWindow(win.id); }}
                  className="p-1 text-slate-500 hover:text-red-500 hover:bg-red-950/40 rounded transition-all"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Window Content Container */}
            <div className="flex-1 overflow-hidden pointer-events-auto relative">
              
              {/* NOTEPAD CONTENT */}
              {win.id === 'notepad' && (
                <div className="flex flex-col h-full bg-slate-950 text-slate-200 font-mono">
                  <div className="flex items-center justify-between p-2.5 bg-slate-900 border-b border-cyan-950 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 uppercase tracking-widest text-[9px]">TARGET FILE:</span>
                      <select 
                        value={selectedFileName} 
                        onChange={(e) => setSelectedFileName(e.target.value)}
                        className="bg-slate-950 border border-cyan-950 rounded px-2 py-0.5 text-cyan-400 outline-none"
                      >
                        {files.map(f => (
                          <option key={f.name} value={f.name}>{f.name}</option>
                        ))}
                      </select>
                    </div>
                    <button
                      onClick={handleSaveNotepad}
                      disabled={isSaved}
                      className={`flex items-center gap-1 text-[10px] px-2.5 py-1 font-bold rounded transition-all ${
                        isSaved 
                          ? 'bg-cyan-950/20 text-cyan-600 border border-cyan-950 cursor-default' 
                          : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer'
                      }`}
                    >
                      {isSaved ? <Check className="w-3 h-3" /> : 'SAVE'}
                    </button>
                  </div>
                  <textarea
                    value={notepadContent}
                    onChange={(e) => { setNotepadContent(e.target.value); setIsSaved(false); }}
                    className="flex-1 p-4 bg-slate-950 border-none outline-none text-cyan-100 font-mono text-xs resize-none select-text leading-relaxed"
                    spellCheck="false"
                  />
                </div>
              )}

              {/* CHROME BROWSER CONTENT */}
              {win.id === 'chrome' && (
                <div className="flex flex-col h-full bg-slate-900 text-slate-200">
                  {/* Address bar */}
                  <div className="flex items-center gap-2 p-2 bg-slate-950 border-b border-cyan-950 font-mono text-xs">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-cyan-950 rounded-full flex-1 relative">
                      <Globe className="w-3.5 h-3.5 text-cyan-500" />
                      <input
                        type="text"
                        value={browserUrl}
                        readOnly
                        className="bg-transparent border-none outline-none text-slate-300 w-full pl-1 text-[11px] select-text"
                      />
                    </div>
                  </div>
                  
                  {/* Web Frame Body */}
                  <div className="flex-1 bg-white text-slate-800 overflow-y-auto p-5 select-text">
                    {simulatedWebPage ? (
                      <div className="max-w-2xl mx-auto py-4">
                        <button 
                          onClick={() => setSimulatedWebPage(null)}
                          className="font-mono text-xs text-cyan-600 hover:underline mb-4 block"
                        >
                          &larr; Back to Google Search
                        </button>
                        <h1 className="text-2xl font-bold text-slate-900 mb-3">{simulatedWebPage.title}</h1>
                        <p className="text-sm text-slate-500 mb-4">Secured network tunnel authenticated at {new Date().toLocaleTimeString()}</p>
                        <div className="text-sm leading-relaxed text-slate-700 bg-slate-50 border border-slate-200 p-4 rounded-lg italic">
                          {simulatedWebPage.body}
                        </div>
                      </div>
                    ) : (
                      <div className="max-w-2xl mx-auto py-4">
                        {/* Logo */}
                        <div className="flex flex-col items-center mb-6">
                          <span className="font-sans text-3xl font-extrabold tracking-tight text-slate-900">
                            Google<span className="text-cyan-500">Search</span>
                          </span>
                          <span className="font-mono text-[9px] text-cyan-600/80 uppercase tracking-widest mt-1">Grounded Mainframe Query</span>
                        </div>

                        {/* Search Input bar */}
                        <form onSubmit={handleBrowserSearch} className="flex gap-2 mb-8">
                          <input
                            type="text"
                            value={currentSearch}
                            onChange={(e) => setCurrentSearch(e.target.value)}
                            placeholder="Ask JARVIS to search anything or enter query here..."
                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-300 hover:border-slate-400 rounded-full text-sm outline-none focus:border-cyan-500 focus:bg-white select-text"
                          />
                          <button
                            type="submit"
                            className="px-5 py-2 bg-slate-900 hover:bg-cyan-600 hover:text-white rounded-full text-slate-100 text-xs font-bold font-mono tracking-wider transition-all"
                          >
                            SEARCH
                          </button>
                        </form>

                        {/* Grounding Results list */}
                        <div className="space-y-5">
                          <h3 className="font-mono text-[10px] text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-1.5 font-bold">
                            {searchSources.length > 0 ? `REAL-TIME GROUNDED INTELLIGENCE SOURCES (${searchSources.length})` : 'AI INTEGRATION METADATA'}
                          </h3>
                          
                          {searchSources.length > 0 ? (
                            searchSources.map((source, index) => (
                              <div key={index} className="p-4 border border-cyan-100 hover:border-cyan-400 bg-cyan-50/20 hover:bg-cyan-50/50 rounded-lg transition-all">
                                <button
                                  onClick={() => handleVisitGroundingSource(source.title, source.uri)}
                                  className="text-sm font-semibold text-cyan-700 hover:underline hover:text-cyan-900 text-left block w-full mb-1"
                                >
                                  {source.title}
                                </button>
                                <span className="text-[10px] text-emerald-600 block mb-2 select-text">{source.uri}</span>
                                <p className="text-xs text-slate-600">Grounded web result retrieved securely via Gemini Google Search grounding engine, Sir. Access this source to load the fully synthesized mainframe translation.</p>
                              </div>
                            ))
                          ) : (
                            <div className="py-6 text-center text-slate-400 text-xs font-mono">
                              <Globe className="w-8 h-8 text-slate-300 mx-auto mb-2 animate-bounce" />
                              <span>Awaiting grounded search directive, Sir.</span>
                              <p className="text-[10px] text-slate-400 mt-1">Try prompting JARVIS: "What's the weather like today in Tokyo?"</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* CALCULATOR CONTENT */}
              {win.id === 'calculator' && (
                <div className="flex flex-col h-full bg-slate-950 p-4 font-mono select-none">
                  <div className="bg-slate-900 border border-cyan-900/40 rounded p-3 mb-4 text-right">
                    <div className="text-[10px] text-slate-500 truncate h-4">{calcFormula || ' '}</div>
                    <div className="text-xl font-bold text-cyan-400 h-8 tracking-wider">{calcDisplay}</div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 flex-1">
                    {['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', 'C', '0', '=', '+'].map((btn) => (
                      <button
                        key={btn}
                        onClick={() => handleCalcBtn(btn)}
                        className={`py-2 text-sm font-bold font-mono rounded transition-all ${
                          btn === 'C' 
                            ? 'bg-red-950/50 hover:bg-red-900/50 border border-red-900 text-red-400' 
                            : btn === '=' 
                            ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 border border-cyan-400' 
                            : ['/', '*', '-', '+'].includes(btn) 
                            ? 'bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-900/40 text-cyan-400' 
                            : 'bg-slate-900 hover:bg-slate-800 border border-cyan-950 text-slate-200'
                        }`}
                      >
                        {btn}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SYSTEM MONITOR CONTENT */}
              {win.id === 'monitor' && (
                <div className="flex flex-col h-full bg-slate-950 p-4 font-mono text-cyan-400 overflow-y-auto scrollbar-thin">
                  <div className="flex justify-between items-center border-b border-cyan-900/20 pb-2 mb-4">
                    <span className="text-xs font-bold tracking-widest text-cyan-400/80">REAL-TIME TELEMETRY PLOTS</span>
                    <span className="text-[10px] text-slate-500 uppercase">SYS MONITOR ENGINE</span>
                  </div>

                  {/* Core usage grid */}
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="p-2.5 border border-cyan-950 bg-slate-900/20 rounded">
                      <div className="text-[8px] text-slate-500 mb-0.5">CPU TOTAL</div>
                      <div className="text-sm font-bold text-cyan-400">{metrics.cpuUsage.toFixed(1)}%</div>
                    </div>
                    <div className="p-2.5 border border-cyan-950 bg-slate-900/20 rounded">
                      <div className="text-[8px] text-slate-500 mb-0.5">RAM ALLOC</div>
                      <div className="text-sm font-bold text-cyan-400">{metrics.memoryUsage.toFixed(1)}%</div>
                    </div>
                    <div className="p-2.5 border border-cyan-950 bg-slate-900/20 rounded">
                      <div className="text-[8px] text-slate-500 mb-0.5">THERMALS</div>
                      <div className={`text-sm font-bold ${metrics.coreTemp > 50 ? 'text-pink-400' : 'text-cyan-400'}`}>{metrics.coreTemp.toFixed(1)}°C</div>
                    </div>
                  </div>

                  {/* Waveform Canvas */}
                  <div className="h-28 border border-cyan-950 bg-black/80 rounded mb-4 relative overflow-hidden p-2 flex flex-col justify-between">
                    <div className="text-[8px] text-slate-500 tracking-wider">HARMONIC CORE OSCILLATIONS</div>
                    <div className="flex-1 flex items-end gap-[2px] h-14">
                      {Array.from({ length: 45 }).map((_, i) => {
                        const height = Math.abs(Math.sin((i + Date.now() * 0.005) * 0.3) * (metrics.cpuUsage * 0.8)) + 10;
                        return (
                          <div 
                            key={i} 
                            style={{ height: `${height}%` }}
                            className={`flex-1 rounded-t transition-all duration-300 ${
                              metrics.coreTemp > 50 ? 'bg-pink-500' : 'bg-cyan-500'
                            }`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex justify-between text-[7px] text-slate-600 border-t border-cyan-950/20 pt-1">
                      <span>450 MHz CHANNEL B</span>
                      <span>SECURE BUS FLOW ACTIVE</span>
                    </div>
                  </div>

                  {/* Active processes list */}
                  <div className="flex-1">
                    <div className="text-[10px] text-cyan-600 uppercase tracking-widest mb-2 font-bold">RUNNING PROCESS MANAGER</div>
                    <div className="space-y-1">
                      {processes.slice(0, 5).map(p => (
                        <div key={p.pid} className="flex justify-between items-center text-xs p-2 bg-slate-900/30 border border-cyan-950/40 rounded">
                          <span className="text-slate-300 font-bold">{p.name}</span>
                          <div className="flex gap-4 text-[10px]">
                            <span>CPU: {p.cpu}%</span>
                            <span>MEM: {p.memory} MB</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY STATUS CONTENT */}
              {win.id === 'status' && (
                <div className="flex flex-col h-full bg-slate-950 p-4 font-mono text-cyan-400 overflow-y-auto scrollbar-thin">
                  <div className="flex justify-between items-center border-b border-cyan-900/20 pb-2 mb-4">
                    <span className="text-xs font-bold tracking-widest text-cyan-400/80">MAINFRAME SECURITY CHECKS</span>
                    <span className="text-[10px] text-emerald-400 font-bold">ALL SECURE</span>
                  </div>

                  <div className="space-y-4">
                    <div className="p-3 border border-emerald-950 bg-emerald-950/10 rounded-lg flex items-start gap-3">
                      <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5 animate-pulse" />
                      <div>
                        <div className="text-xs font-bold text-slate-200">LOCAL SECURE ENCLAVE</div>
                        <p className="text-[10px] text-slate-400 leading-relaxed mt-1">
                          The simulated local system environment is running securely. Cryptographic handshakes, storage vaults, and Gemini network proxies are locked down, Sir.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 border border-cyan-950 bg-slate-900/20 rounded">
                        <div className="text-[8px] text-slate-500 uppercase">FIREWALL STATE</div>
                        <div className="text-xs font-bold text-emerald-400 mt-1">SHIELD INTEGRITY: 100%</div>
                      </div>
                      <div className="p-3 border border-cyan-950 bg-slate-900/20 rounded">
                        <div className="text-[8px] text-slate-500 uppercase">IP LINK ADDRESS</div>
                        <div className="text-xs font-bold text-cyan-400 mt-1 truncate">192.168.1.100</div>
                      </div>
                    </div>

                    {/* VOICE BIOMETRIC LOCK SYSTEM */}
                    <div className="p-3 border border-cyan-900 bg-slate-900/40 rounded-lg relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl bg-cyan-950/20 pointer-events-none" />
                      
                      <div className="flex items-center justify-between border-b border-cyan-900/30 pb-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Fingerprint className="w-4 h-4 text-cyan-400" />
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-200">VOICE BIOMETRIC GATEKEEPER</span>
                        </div>
                        {isSecurityUnlocked ? (
                          <button
                            onClick={handleLockSecurity}
                            className="flex items-center gap-1 text-[8px] font-bold text-red-400 bg-red-950/30 border border-red-900/50 px-2 py-0.5 rounded uppercase hover:bg-red-900/30 transition-all cursor-pointer"
                          >
                            <Lock className="w-2.5 h-2.5" />
                            Lock System
                          </button>
                        ) : (
                          <div className="flex items-center gap-1 text-[8px] font-bold text-cyan-500 bg-cyan-950/30 border border-cyan-900/50 px-2 py-0.5 rounded uppercase">
                            <Lock className="w-2.5 h-2.5" />
                            SECURE LOCK
                          </div>
                        )}
                      </div>

                      {!isSecurityUnlocked ? (
                        /* PASSWORD INPUT (LOCKED STATE) */
                        <form onSubmit={handleUnlockSecurity} className="space-y-3">
                          <p className="text-[9px] text-slate-400 leading-normal">
                            Modifying biometric voice print parameters and setting up local laptop sync requires administrator passcode override. (Initial Key: <span className="text-cyan-400 font-bold select-all">7889472924</span>)
                          </p>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                value={securityPasscodeInput}
                                onChange={(e) => {
                                  setSecurityPasscodeInput(e.target.value);
                                  setSecurityError('');
                                }}
                                placeholder="Input Master Access Passcode..."
                                className="w-full bg-slate-950 border border-cyan-900 focus:border-cyan-700 rounded p-2 text-[10px] text-cyan-400 font-mono outline-none"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-cyan-400 cursor-pointer"
                              >
                                {showPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              </button>
                            </div>
                            <button
                              type="submit"
                              className="px-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] font-mono rounded transition-all cursor-pointer"
                            >
                              AUTHORIZE
                            </button>
                          </div>
                          {securityError && (
                            <p className="text-[8px] text-red-400 font-bold">{securityError}</p>
                          )}
                        </form>
                      ) : (
                        /* UNLOCKED CONFIGURATION DECK */
                        <div className="space-y-4">
                          {/* Navigation Tabs for config vs setup guide */}
                          <div className="flex border-b border-cyan-950 pb-1.5 gap-2">
                            <button
                              type="button"
                              onClick={() => { setSecurityActiveTab('config'); setSecuritySuccess(''); setSecurityError(''); }}
                              className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded cursor-pointer ${
                                securityActiveTab === 'config'
                                  ? 'bg-cyan-950 border border-cyan-700 text-cyan-400'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              Biometric Options
                            </button>
                            <button
                              type="button"
                              onClick={() => { setSecurityActiveTab('guide'); setSecuritySuccess(''); setSecurityError(''); }}
                              className={`px-2.5 py-1 text-[9px] font-bold uppercase rounded cursor-pointer ${
                                securityActiveTab === 'guide'
                                  ? 'bg-cyan-950 border border-cyan-700 text-cyan-400'
                                  : 'text-slate-500 hover:text-slate-300'
                              }`}
                            >
                              Local Laptop Sync & VS Code Setup
                            </button>
                          </div>

                          {securityActiveTab === 'config' ? (
                            <div className="space-y-4">
                              {/* Option 1: Enable/Disable Toggle */}
                              <div className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-cyan-950">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-[10px] font-bold text-slate-200">Biometric Authentication Gate</span>
                                  <span className="text-[8px] text-slate-500">Require matching voice spectrum signature before dispatching voice dictations.</span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => onChangeVoiceAuthEnabled(!isVoiceAuthEnabled)}
                                  className={`px-3 py-1 text-[9px] font-bold rounded border uppercase transition-all cursor-pointer ${
                                    isVoiceAuthEnabled
                                      ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                                      : 'bg-slate-950 border-cyan-950 text-slate-500'
                                  }`}
                                >
                                  {isVoiceAuthEnabled ? 'Active' : 'Disabled'}
                                </button>
                              </div>

                              {/* Option 2: Change Password */}
                              <form onSubmit={handleUpdateSecurityPassword} className="space-y-2 p-2 rounded bg-slate-950/60 border border-cyan-950">
                                <div className="flex flex-col gap-0.5 mb-1">
                                  <span className="text-[10px] font-bold text-slate-200">Update Secure Override Key</span>
                                  <span className="text-[8px] text-slate-500">Change the administrative password from current ({voiceAuthPassword}).</span>
                                </div>
                                <div className="flex gap-2">
                                  <input
                                    type="text"
                                    value={newPasscodeInput}
                                    onChange={(e) => {
                                      setNewPasscodeInput(e.target.value);
                                      setSecurityError('');
                                      setSecuritySuccess('');
                                    }}
                                    placeholder="Input New Master Passcode..."
                                    className="flex-1 bg-slate-900 border border-cyan-900 focus:border-cyan-700 rounded p-1.5 text-[9px] text-cyan-400 font-mono outline-none"
                                  />
                                  <button
                                    type="submit"
                                    className="px-2.5 py-1.5 bg-cyan-950 border border-cyan-800 hover:border-cyan-600 text-cyan-400 font-bold text-[9px] rounded transition-all cursor-pointer"
                                  >
                                    UPDATE KEY
                                  </button>
                                </div>
                              </form>

                              {securitySuccess && (
                                <p className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                                  <CheckCircle className="w-3.5 h-3.5 animate-pulse" />
                                  {securitySuccess}
                                </p>
                              )}
                              {securityError && (
                                <p className="text-[9px] text-red-400 font-bold">{securityError}</p>
                              )}
                            </div>
                          ) : (
                            /* DETAILED SETUP BLUEPRINT GUIDE */
                            <div className="space-y-3.5 text-[9.5px] leading-relaxed text-slate-300">
                              <div className="bg-cyan-950/20 border border-cyan-950 p-2.5 rounded">
                                <div className="font-bold text-cyan-400 uppercase tracking-wide mb-1 flex items-center gap-1">
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                  Security & Voice Print Privacy Protocol
                                </div>
                                <p className="text-slate-400 text-[9px]">
                                  <strong>Will I send my voice to you?</strong><br />
                                  <span className="text-emerald-400">Absolutely NOT, Sir.</span> Your voice data is strictly private. Standard web API integrations of speaker verification run fully 100% locally and offline on your system. No voice waves, spectrogram data, or recordings are ever transmitted to external servers or third-party databases.
                                </p>
                              </div>

                              <div className="space-y-1.5">
                                <span className="font-bold text-slate-200">How to Setup Real Voice Biometrics locally on your Laptop (VS Code Direct):</span>
                                <p className="text-[9px] text-slate-400">
                                  To connect real biometric security from your microphone directly to a Node/Python backend in VS Code:
                                </p>
                                <ol className="list-decimal pl-4 space-y-1 text-[9px] text-slate-400">
                                  <li>
                                    Create a folder in your local VS Code workspace (e.g. <code className="text-cyan-400 px-1 bg-slate-900 border border-cyan-950 rounded">/voice-auth-backend</code>).
                                  </li>
                                  <li>
                                    Write a simple Python Flask or Fast API server that uses the <code className="text-cyan-400 px-1 bg-slate-900 border border-cyan-950 rounded">PyAudio</code> library to record voice, and <code className="text-cyan-400 px-1 bg-slate-900 border border-cyan-950 rounded">scikit-learn</code> (or a simple deep learning model like ECAPA-TDNN) to extract <strong>MFCC (Mel-Frequency Cepstral Coefficients)</strong> features.
                                  </li>
                                  <li>
                                    Compare the live MFCC voice print against your saved reference signature using cosine similarity (threshold &gt; 0.85).
                                  </li>
                                </ol>
                              </div>

                              <div className="space-y-1">
                                <span className="font-bold text-slate-200 uppercase text-[8px] tracking-wider">Example Python Speaker Recognition Daemon:</span>
                                <pre className="p-2 bg-black rounded text-[8px] font-mono border border-cyan-950 text-slate-300 overflow-x-auto select-all leading-normal max-h-40 overflow-y-auto">
{`# voice_auth_daemon.py
import pyaudio
import numpy as np
import librosa
from sklearn.metrics.pairwise import cosine_similarity

# 1. Capture microphone wave vectors
def capture_voice():
    p = pyaudio.PyAudio()
    stream = p.open(format=pyaudio.paFloat32, channels=1, rate=16000, input=True, frames_per_buffer=1024)
    print("Recording biometric signature...")
    frames = []
    for _ in range(0, int(16000 / 1024 * 3)): # 3 seconds
        data = stream.read(1024)
        frames.append(np.frombuffer(data, dtype=np.float32))
    return np.concatenate(frames)

# 2. Match live spectrum against Stark Voiceprint model
def verify_voice(live_audio, reference_mfcc):
    live_mfcc = np.mean(librosa.feature.mfcc(y=live_audio, sr=16000, n_mfcc=13), axis=1)
    similarity = cosine_similarity([live_mfcc], [reference_mfcc])[0][0]
    return similarity > 0.88 # Verified if match yield is high`}
                                </pre>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="p-3 border border-cyan-950 bg-slate-900/20 rounded">
                      <div className="text-[9px] text-cyan-500 uppercase tracking-widest font-bold border-b border-cyan-950 pb-1 mb-2">SYSTEM AUDITING DIARIES</div>
                      <div className="space-y-1.5 text-[9px] text-slate-400">
                        <div className="flex justify-between">
                          <span>[03:56:18] CORE MAIN_BUS BOOT SEQUENCE</span>
                          <span className="text-emerald-400 font-bold">SUCCESS</span>
                        </div>
                        <div className="flex justify-between">
                          <span>[03:56:19] INTELLIGENCE INTERFACE PROTOCOLS</span>
                          <span className="text-emerald-400 font-bold">SUCCESS</span>
                        </div>
                        <div className="flex justify-between">
                          <span>[03:56:21] DECIPHER SECURE STORAGE UNIT</span>
                          <span className="text-emerald-400 font-bold">ONLINE</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        );
      })}
    </div>
  );
}
