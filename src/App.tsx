import React, { useState, useEffect } from 'react';
import { 
  Activity, Cpu, ShieldCheck, Zap, Terminal as TermIcon, FileText, 
  Globe, Calculator, MessageSquare, HardDrive, RefreshCw
} from 'lucide-react';
import { VirtualFile, AppWindow, AppWindowType, ChatMessage, SystemMetrics, Process } from './types';
import JarvisCore from './components/JarvisCore';
import SystemStats from './components/SystemStats';
import Terminal from './components/Terminal';
import FileSystem from './components/FileSystem';
import MockDesktop from './components/MockDesktop';
import ChatConsole from './components/ChatConsole';

// Helper to get formatted timestamp
const getTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
};

export default function App() {
  // Navigation / Tab Selection for right pane
  const [activeTab, setActiveTab] = useState<'desktop' | 'chat' | 'terminal' | 'storage'>('desktop');

  // Core Status of JARVIS
  const [jarvisState, setJarvisState] = useState<'idle' | 'analyzing' | 'speaking' | 'offline'>('idle');
  const [isMuted, setIsMuted] = useState(false);

  // Virtual Filesystem
  const [files, setFiles] = useState<VirtualFile[]>([
    {
      name: 'sir_notes.txt',
      content: "Sir,\n\nI have successfully modeled the Mark-85 reactor core cooling grids. Particle collision vectors have stabilized at 112% yield rates.\n\n- JARVIS",
      path: 'C:\\Users\\Sir\\Documents\\sir_notes.txt',
      size: 168,
      updatedAt: '2026-07-03 03:56:18'
    },
    {
      name: 'system_config.json',
      content: "{\n  \"core_version\": \"JARVIS_PRO_V3.1\",\n  \"reactor_status\": \"nominal\",\n  \"security_level\": \"TonyStark_Sec_Alpha\",\n  \"firewall_encryption\": \"quantum_cascade_2048\"\n}",
      path: 'C:\\Users\\Sir\\Documents\\system_config.json',
      size: 172,
      updatedAt: '2026-07-03 03:56:18'
    },
    {
      name: 'stark_todo.md',
      content: "# Stark Mainframe Directives\n- [x] Stabilize particle collision containment grid\n- [ ] Recalibrate energy absorption protocols\n- [ ] Refactor quantum decryption loops\n- [ ] Clean workspace and organize schematics",
      path: 'C:\\Users\\Sir\\Documents\\stark_todo.md',
      size: 228,
      updatedAt: '2026-07-03 03:56:18'
    }
  ]);

  // Terminal Logs
  const [terminalLog, setTerminalLog] = useState<string[]>([
    'Microsoft Windows [Version 10.0.19045.2251]',
    '(c) Microsoft Corporation. All rights reserved.',
    '',
    'Initializing secure command handshakes with JARVIS mainframe...',
    '[SUCCESS] 128-bit quantum security handshake complete.',
    '[SYSTEM] Operational status is nominal.',
    'Ready for input, Sir.',
    ''
  ]);

  // Chat/Dialogue logs
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: 'init-msg',
      sender: 'jarvis',
      text: "Good morning, Sir. Core mainframe operational status is fully green. Security buffers are locked down, and search grounding protocols are online. How may I assist you today?",
      timestamp: getTimestamp()
    }
  ]);

  const [isThinking, setIsThinking] = useState(false);

  // Search Results Metadata from Grounding
  const [searchSources, setSearchSources] = useState<{ uri: string; title: string }[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Floating Desktop Windows
  const [windows, setWindows] = useState<AppWindow[]>([
    { id: 'notepad', title: 'Virtual Notepad', isOpen: false, isMinimized: false, isMaximized: false, x: 40, y: 30, width: 550, height: 400, zIndex: 10 },
    { id: 'chrome', title: 'Grounded Web Search (Chrome)', isOpen: false, isMinimized: false, isMaximized: false, x: 80, y: 50, width: 620, height: 420, zIndex: 10 },
    { id: 'calculator', title: 'Quantum Calculator', isOpen: false, isMinimized: false, isMaximized: false, x: 200, y: 150, width: 260, height: 350, zIndex: 10 },
    { id: 'monitor', title: 'System Telemetry Monitor', isOpen: false, isMinimized: false, isMaximized: false, x: 120, y: 100, width: 520, height: 420, zIndex: 10 },
    { id: 'status', title: 'Mainframe Diagnostics', isOpen: false, isMinimized: false, isMaximized: false, x: 150, y: 80, width: 480, height: 380, zIndex: 10 }
  ]);
  const [activeWindowId, setActiveWindowId] = useState<AppWindowType | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string>('sir_notes.txt');

  // Voice Biometric & Passcode states
  const [isVoiceAuthEnabled, setIsVoiceAuthEnabled] = useState<boolean>(true);
  const [voiceAuthPassword, setVoiceAuthPassword] = useState<string>('7889472924');

  // System Metrics & Running Processes
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 14.5,
    memoryUsage: 48.2,
    diskUsage: 35.8,
    coreTemp: 41.5,
    networkSpeedDown: 1254.8,
    networkSpeedUp: 456.2,
    firewallActive: true,
    quantumDecryptor: true,
    uptime: 108 // Uptime in seconds
  });

  const [processes, setProcesses] = useState<Process[]>([
    { pid: 0, name: 'System Idle Process', cpu: 78.5, memory: 4, status: 'Running' },
    { pid: 1085, name: 'jarvis_core.exe', cpu: 12.8, memory: 284, status: 'Running' },
    { pid: 2040, name: 'explorer.exe', cpu: 3.5, memory: 145, status: 'Running' },
    { pid: 3140, name: 'chrome.exe', cpu: 2.1, memory: 524, status: 'Running' },
    { pid: 4096, name: 'telemetry_sys.exe', cpu: 1.8, memory: 86, status: 'Running' },
    { pid: 5012, name: 'notepad.exe', cpu: 0.0, memory: 32, status: 'Suspended' }
  ]);

  // Telemetry tick (dynamically fluctuate gauges/speeds/processes)
  useEffect(() => {
    const timer = setInterval(() => {
      setMetrics((prev) => {
        let computeDelta = jarvisState === 'analyzing' ? 25 : jarvisState === 'speaking' ? 8 : 0;
        let cpuRandom = Math.random() * 8 - 4 + computeDelta;
        let tempRandom = Math.random() * 2 - 1 + (computeDelta * 0.3);
        let currentUptime = prev.uptime + 2;

        return {
          ...prev,
          cpuUsage: Math.max(5, Math.min(98, 12 + cpuRandom)),
          coreTemp: Math.max(37, Math.min(85, 42 + tempRandom)),
          memoryUsage: Math.max(40, Math.min(95, prev.memoryUsage + (Math.random() * 0.4 - 0.2))),
          networkSpeedDown: Math.max(500, Math.min(8000, prev.networkSpeedDown + (Math.random() * 400 - 200))),
          networkSpeedUp: Math.max(100, Math.min(2000, prev.networkSpeedUp + (Math.random() * 100 - 50))),
          uptime: currentUptime
        };
      });

      setProcesses((prev) => 
        prev.map((proc) => {
          if (proc.name === 'System Idle Process') return proc;
          let loadFactor = jarvisState === 'analyzing' ? 3 : 1;
          let randomCpu = Math.max(0, Math.min(80, proc.cpu + (Math.random() * 4 - 2) * loadFactor));
          return {
            ...proc,
            cpu: parseFloat(randomCpu.toFixed(1))
          };
        })
      );
    }, 2000);

    return () => clearInterval(timer);
  }, [jarvisState]);

  // Revert speaking core back to idle once TTS completes
  const handleVocalSpeakTimer = (text: string) => {
    // Roughly estimate speaking duration: 160ms per word + 500ms pad
    const wordCount = text.split(' ').length;
    const duration = Math.max(1500, (wordCount * 180) + 600);
    
    setTimeout(() => {
      setJarvisState('idle');
    }, duration);
  };

  // Window operations
  const handleOpenWindow = (id: AppWindowType) => {
    setWindows(prev => prev.map(w => {
      if (w.id === id) {
        // Bring window to front
        const maxZ = Math.max(...prev.map(win => win.zIndex), 10);
        return { ...w, isOpen: true, isMinimized: false, zIndex: maxZ + 1 };
      }
      return w;
    }));
    setActiveWindowId(id);
    setActiveTab('desktop');
  };

  const handleCloseWindow = (id: AppWindowType) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isOpen: false } : w));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const handleMinimizeWindow = (id: AppWindowType) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMinimized: true } : w));
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const handleMaximizeWindow = (id: AppWindowType) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, isMaximized: !w.isMaximized } : w));
  };

  const handleFocusWindow = (id: AppWindowType) => {
    setWindows(prev => {
      const maxZ = Math.max(...prev.map(win => win.zIndex), 10);
      return prev.map(w => w.id === id ? { ...w, isMinimized: false, zIndex: maxZ + 1 } : w);
    });
    setActiveWindowId(id);
  };

  // Virtual file creation / write / delete
  const handleCreateFile = (name: string, content: string) => {
    const existingIndex = files.findIndex(f => f.name === name);
    const size = content.length;
    const updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);

    if (existingIndex !== -1) {
      // Overwrite
      setFiles(prev => prev.map((f, i) => i === existingIndex ? { ...f, content, size, updatedAt } : f));
      addTerminalLine(`[SYSTEM] File modified successfully: C:\\Users\\Sir\\Documents\\${name}`);
    } else {
      // Create new
      const newFile: VirtualFile = {
        name,
        content,
        path: `C:\\Users\\Sir\\Documents\\${name}`,
        size,
        updatedAt
      };
      setFiles(prev => [...prev, newFile]);
      addTerminalLine(`[SYSTEM] File created successfully: C:\\Users\\Sir\\Documents\\${name}`);
    }
  };

  const handleDeleteFile = (name: string) => {
    setFiles(prev => prev.filter(f => f.name !== name));
    addTerminalLine(`[SYSTEM] WARNING: File purged from local sector: C:\\Users\\Sir\\Documents\\${name}`);
  };

  const handleUpdateFileContent = (name: string, content: string) => {
    const size = content.length;
    const updatedAt = new Date().toISOString().replace('T', ' ').substring(0, 19);
    setFiles(prev => prev.map(f => f.name === name ? { ...f, content, size, updatedAt } : f));
    addTerminalLine(`[SYSTEM] File written successfully: C:\\Users\\Sir\\Documents\\${name}`);
  };

  const addTerminalLine = (line: string) => {
    setTerminalLog(prev => [...prev, line]);
  };

  const handleClearTerminal = () => {
    setTerminalLog([
      'Terminal logs cleared.',
      'Ready for input, Sir.',
      ''
    ]);
  };

  // Execute terminal command simulations
  const handleExecuteTerminalCommand = (rawCmd: string) => {
    addTerminalLine(`C:\\Users\\Sir>${rawCmd}`);

    const parts = rawCmd.trim().split(' ');
    const baseCmd = parts[0].toLowerCase();
    const args = parts.slice(1).join(' ');

    setTimeout(() => {
      switch (baseCmd) {
        case 'dir':
        case 'ls':
          addTerminalLine(` Directory of C:\\Users\\Sir\\Documents\n`);
          files.forEach(f => {
            const timeStr = f.updatedAt;
            const sizeStr = f.size.toString().padStart(8, ' ');
            addTerminalLine(`${timeStr}      ${sizeStr} bytes     ${f.name}`);
          });
          addTerminalLine(`\n               ${files.length} File(s)      ${files.reduce((acc, f) => acc + f.size, 0)} bytes`);
          break;

        case 'tasklist':
        case 'ps':
          addTerminalLine(`Image Name                     PID Session Name        Session#    Mem Usage`);
          addTerminalLine(`========================= ======== ================ =========== ============`);
          processes.forEach(p => {
            const nameCol = p.name.padEnd(25, ' ');
            const pidCol = p.pid.toString().padStart(8, ' ');
            const memCol = `${p.memory} MB`.padStart(11, ' ');
            addTerminalLine(`${nameCol}${pidCol} Console                    1 ${memCol}`);
          });
          break;

        case 'ipconfig':
          addTerminalLine(`Windows IP Configuration\n`);
          addTerminalLine(`Ethernet adapter Core_Link_0:`);
          addTerminalLine(`   Connection-specific DNS Suffix  . : starkindustries.local`);
          addTerminalLine(`   Link-local IPv6 Address . . . . . : fe80::f32a:45de:9021:1085%4`);
          addTerminalLine(`   IPv4 Address. . . . . . . . . . . : 192.168.1.100`);
          addTerminalLine(`   Subnet Mask . . . . . . . . . . . : 255.255.255.0`);
          addTerminalLine(`   Default Gateway . . . . . . . . . : 192.168.1.1`);
          break;

        case 'systeminfo':
          addTerminalLine(`Host Name:                 STARK-MAINFRAME`);
          addTerminalLine(`OS Name:                   JARVIS Virtual Environment OS`);
          addTerminalLine(`OS Version:                V3.1.2026`);
          addTerminalLine(`System Manufacturer:       Stark Industries Corp.`);
          addTerminalLine(`System Type:               x64-based Holographic Workstation`);
          addTerminalLine(`Processor(s):              Stark Arc Co-Processor x8 [Stabilized]`);
          addTerminalLine(`BIOS Version:              STARK_BIOS_03072026`);
          addTerminalLine(`Total Physical Memory:     32,768 MB`);
          addTerminalLine(`Network Card(s):           High-Bandwidth Quantum Transceiver`);
          addTerminalLine(`Mainframe Uptime:          ${Math.floor(metrics.uptime / 60)} minutes, ${metrics.uptime % 60} seconds`);
          break;

        case 'ping':
          if (!args) {
            addTerminalLine(`Usage: ping <hostname>`);
          } else {
            addTerminalLine(`Pinging ${args} with 32 bytes of data:`);
            addTerminalLine(`Reply from ${args}: bytes=32 time=14ms TTL=128`);
            addTerminalLine(`Reply from ${args}: bytes=32 time=15ms TTL=128`);
            addTerminalLine(`Reply from ${args}: bytes=32 time=13ms TTL=128`);
            addTerminalLine(`Reply from ${args}: bytes=32 time=14ms TTL=128\n`);
            addTerminalLine(`Ping statistics for ${args}:`);
            addTerminalLine(`    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),`);
            addTerminalLine(`Approximate round trip times in milli-seconds:`);
            addTerminalLine(`    Minimum = 13ms, Maximum = 15ms, Average = 14ms`);
          }
          break;

        case 'shutdown':
          addTerminalLine(`[SYSTEM] WARNING: Initiating reactor cooldown sequence in 1 hour.`);
          addTerminalLine(`Scheduled shutdown sequence successfully armed, Sir.`);
          setChatHistory(prev => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              sender: 'system',
              text: "Mainframe power cycle armed: 3600 second timer ticking.",
              timestamp: getTimestamp()
            }
          ]);
          break;

        case 'clear':
        case 'cls':
          handleClearTerminal();
          return;

        case 'help':
          addTerminalLine(`Supported terminal commands (simulation):`);
          addTerminalLine(`  dir, ls          - List files in current virtual storage sector`);
          addTerminalLine(`  tasklist, ps     - List active process cores`);
          addTerminalLine(`  ipconfig         - Display virtual network linkage parameters`);
          addTerminalLine(`  systeminfo       - Display processor core and memory configurations`);
          addTerminalLine(`  ping <address>   - Execute ICMP echo handshake test`);
          addTerminalLine(`  shutdown         - Schedule local mainframe power down`);
          addTerminalLine(`  clear, cls       - Clear terminal logs`);
          addTerminalLine(`  help             - Show this instruction ledger`);
          break;

        default:
          addTerminalLine(`'${baseCmd}' is not recognized as an internal or external command,`);
          addTerminalLine(`operable program or batch file.`);
          addTerminalLine(`Type 'help' to review supported protocols.`);
          break;
      }
      addTerminalLine('');
    }, 400);
  };

  // Chat conversation execution with Backend API
  const handleSendMessage = async (text: string) => {
    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: getTimestamp()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setIsThinking(true);
    setJarvisState('analyzing');

    try {
      // Call backend chat API
      const res = await fetch('/api/jarvis/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          // Limit history to last 8 turns to save tokens
          history: chatHistory.slice(-8)
        })
      });

      const resJson = await res.json();
      if (!resJson.success) {
        throw new Error(resJson.error || "Neural matrix experienced an anomaly, Sir.");
      }

      const payload = resJson.data;

      // Handle search sources
      if (payload.searchSources && payload.searchSources.length > 0) {
        setSearchSources(payload.searchSources);
      } else {
        setSearchSources([]);
      }

      setSearchQuery(payload.search_query || '');

      // Create JARVIS reply
      const jarvisMsg: ChatMessage = {
        id: `jarvis-${Date.now()}`,
        sender: 'jarvis',
        text: payload.speak,
        timestamp: getTimestamp(),
        action: payload
      };

      setChatHistory(prev => [...prev, jarvisMsg]);
      setIsThinking(false);
      setJarvisState('speaking');
      handleVocalSpeakTimer(payload.speak);

      // Execute associated JARVIS simulated actions
      if (payload.action === 'open_app' && payload.app) {
        handleOpenWindow(payload.app);
      } else if (payload.action === 'system_command' && payload.command) {
        handleExecuteTerminalCommand(payload.command);
        addTerminalLine(`[JARVIS] Command executed automatically, Sir: ${payload.command}`);
      } else if (payload.action === 'file_ops' && payload.file_action && payload.file_path) {
        const path = payload.file_path;
        if (payload.file_action === 'create' || payload.file_action === 'write') {
          handleCreateFile(path, payload.file_content || '');
        } else if (payload.file_action === 'delete') {
          handleDeleteFile(path);
        } else if (payload.file_action === 'read') {
          handleOpenWindow('notepad');
          setSelectedFileName(path);
          const f = files.find(f => f.name === path);
          if (f) {
            handleOpenWindow('notepad');
          } else {
            addTerminalLine(`[SYSTEM] Error reading file: C:\\Users\\Sir\\Documents\\${path} not found.`);
          }
        }
      } else if (payload.action === 'web_search') {
        handleOpenWindow('chrome');
      }

    } catch (error: any) {
      console.error(error);
      setIsThinking(false);
      setJarvisState('idle');

      const errText = error.message || "An exception occurred in the Jarvis core, Sir.";
      setChatHistory(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          sender: 'jarvis',
          text: `My apologies, Sir. My cognitive mainframe is experiencing a connection anomaly: ${errText}`,
          timestamp: getTimestamp()
        }
      ]);
    }
  };

  return (
    <div id="jarvis_root_workspace" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden select-none">
      
      {/* Background Holographic Glow */}
      <div className="absolute top-0 right-0 w-[45vw] h-[45vh] rounded-full blur-[160px] bg-cyan-950/20 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[40vw] h-[40vh] rounded-full blur-[140px] bg-slate-900/40 pointer-events-none" />

      {/* Futuristic Navigation Header */}
      <header className="h-14 border-b border-cyan-900/30 bg-slate-950/90 backdrop-blur-md px-5 flex items-center justify-between relative z-30 select-none">
        {/* Left Title Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center">
            <div className="w-7 h-7 rounded-full border-2 border-dashed border-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            <Activity className="w-3.5 h-3.5 text-cyan-400 absolute animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="font-mono text-sm font-black tracking-[0.18em] text-cyan-300">JARVIS<span className="text-white">PRO</span></span>
            <span className="font-mono text-[8px] text-cyan-500/80 tracking-widest uppercase">MARK V3 CORE ENGINE</span>
          </div>
        </div>

        {/* Center Mainframe Metrics Bar */}
        <div className="hidden lg:flex items-center gap-6 font-mono text-[10px] text-slate-500 uppercase tracking-widest">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-500/70" />
            <span>REACTOR OUTPUT:</span>
            <span className="text-cyan-400 font-bold">112.5% NOMINAL</span>
          </div>
          <span className="text-slate-800">|</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>SECURITY MATRIX:</span>
            <span className="text-emerald-400 font-bold">SECURE_A</span>
          </div>
          <span className="text-slate-800">|</span>
          <div className="flex items-center gap-1.5 animate-pulse">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span>COGNITIVE PIPELINE:</span>
            <span className="text-cyan-300 font-bold">{jarvisState.toUpperCase()}</span>
          </div>
        </div>

        {/* Right HUD Control Toggles */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => handleOpenWindow('status')}
            className="flex items-center gap-1 px-2.5 py-1.5 font-mono text-[9px] font-bold border border-cyan-950 hover:border-cyan-700 bg-slate-900/60 rounded text-cyan-400 tracking-wider hover:bg-cyan-950/20 transition-all"
          >
            <ShieldCheck className="w-3 h-3" />
            DIAGNOSTICS
          </button>
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" title="Mainframe synced" />
        </div>
      </header>

      {/* Main Full-Stack Cockpit Grid */}
      <main className="flex-1 p-5 grid grid-cols-1 xl:grid-cols-12 gap-5 overflow-hidden min-h-[calc(100vh-56px)] select-none">
        
        {/* Left Side: Jarvis Core & Local System Telemetry (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-5 h-full">
          {/* JARVIS Core Visualizer */}
          <div className="flex-1 min-h-[300px]">
            <JarvisCore 
              state={jarvisState} 
              isMuted={isMuted} 
              onToggleMute={() => setIsMuted(!isMuted)} 
            />
          </div>
          {/* Dynamic hardware monitors */}
          <div className="flex-1 min-h-[320px]">
            <SystemStats metrics={metrics} processes={processes} />
          </div>
        </div>

        {/* Right Side: Virtual Workspace Deck (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-4 h-full">
          {/* Dynamic Workspace Selector Tabbar */}
          <div className="flex items-center justify-between border-b border-cyan-950 pb-2 relative z-20">
            <div className="flex items-center gap-1.5 font-mono text-[10px] tracking-wider">
              <button
                onClick={() => setActiveTab('desktop')}
                className={`px-3 py-1.5 font-bold uppercase rounded border transition-all ${
                  activeTab === 'desktop' 
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                    : 'bg-slate-900/40 border-cyan-950/30 text-slate-400 hover:text-cyan-400 hover:border-cyan-900'
                }`}
              >
                Simulation Deck
              </button>
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1.5 font-bold uppercase rounded border transition-all ${
                  activeTab === 'chat' 
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                    : 'bg-slate-900/40 border-cyan-950/30 text-slate-400 hover:text-cyan-400 hover:border-cyan-900'
                }`}
              >
                Vocal dialogue ({chatHistory.length})
              </button>
              <button
                onClick={() => setActiveTab('terminal')}
                className={`px-3 py-1.5 font-bold uppercase rounded border transition-all ${
                  activeTab === 'terminal' 
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                    : 'bg-slate-900/40 border-cyan-950/30 text-slate-400 hover:text-cyan-400 hover:border-cyan-900'
                }`}
              >
                Console terminal
              </button>
              <button
                onClick={() => setActiveTab('storage')}
                className={`px-3 py-1.5 font-bold uppercase rounded border transition-all ${
                  activeTab === 'storage' 
                    ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                    : 'bg-slate-900/40 border-cyan-950/30 text-slate-400 hover:text-cyan-400 hover:border-cyan-900'
                }`}
              >
                Vault explorer
              </button>
            </div>
            
            {/* Quick shortcuts */}
            <div className="hidden sm:flex items-center gap-1.5 font-mono text-[9px] text-slate-500">
              <span className="font-bold">LAUNCHPAD:</span>
              {['notepad', 'chrome', 'calculator', 'monitor', 'status'].map((winId) => (
                <button
                  key={winId}
                  onClick={() => handleOpenWindow(winId as AppWindowType)}
                  className="px-2 py-0.5 border border-cyan-950 hover:border-cyan-800 bg-slate-900/50 hover:bg-cyan-950/10 rounded uppercase text-[8px] text-cyan-400/80 tracking-wide transition-all"
                >
                  {winId === 'status' ? 'security' : winId}
                </button>
              ))}
            </div>
          </div>

          {/* Active Workspace Container (Render selected panel) */}
          <div className="flex-1 relative min-h-[450px] overflow-hidden rounded-2xl border border-cyan-950/20 bg-slate-950/30">
            {activeTab === 'desktop' && (
              <>
                {/* Desktop Wallpaper HUD styling */}
                <div className="absolute inset-0 flex flex-col items-center justify-center opacity-10 pointer-events-none select-none z-0">
                  <div className="w-80 h-80 rounded-full border border-cyan-500 border-dashed animate-spin" style={{ animationDuration: '40s' }} />
                  <div className="font-mono text-[9px] tracking-widest text-cyan-500 mt-4 uppercase">SECURE MULTI-DESKTOP SECTOR</div>
                </div>

                {/* Floating draggable window layer */}
                <MockDesktop
                  windows={windows}
                  activeWindowId={activeWindowId}
                  files={files}
                  metrics={metrics}
                  processes={processes}
                  searchSources={searchSources}
                  searchQuery={searchQuery}
                  notepadActiveFile={selectedFileName}
                  isVoiceAuthEnabled={isVoiceAuthEnabled}
                  voiceAuthPassword={voiceAuthPassword}
                  onChangeVoiceAuthEnabled={setIsVoiceAuthEnabled}
                  onChangeVoiceAuthPassword={setVoiceAuthPassword}
                  onCloseWindow={handleCloseWindow}
                  onMinimizeWindow={handleMinimizeWindow}
                  onMaximizeWindow={handleMaximizeWindow}
                  onFocusWindow={handleFocusWindow}
                  onUpdateFileContent={handleUpdateFileContent}
                  onExecuteCommand={handleSendMessage}
                />

                {/* Minimized windows tray bar */}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full border border-cyan-950/80 bg-slate-950/90 backdrop-blur-md flex items-center gap-2 z-20 shadow-lg select-none">
                  <span className="font-mono text-[8px] text-slate-500 uppercase tracking-wider mr-1.5">WINDOW TASKBAR</span>
                  {windows.map((win) => {
                    const isOpen = win.isOpen;
                    const isMin = win.isMinimized;
                    const isActive = activeWindowId === win.id;

                    return (
                      <button
                        key={win.id}
                        onClick={() => {
                          if (!isOpen) handleOpenWindow(win.id);
                          else if (isMin) handleFocusWindow(win.id);
                          else if (isActive) handleMinimizeWindow(win.id);
                          else handleFocusWindow(win.id);
                        }}
                        className={`px-3 py-1 font-mono text-[9px] rounded-full border transition-all ${
                          !isOpen 
                            ? 'bg-slate-950 border-slate-900 text-slate-600 hover:text-slate-400' 
                            : isMin 
                            ? 'bg-cyan-950/30 border-cyan-950 text-cyan-500/70 hover:bg-cyan-950/50 hover:text-cyan-400' 
                            : isActive
                            ? 'bg-cyan-500 border-cyan-400 text-slate-950 font-bold shadow-[0_0_8px_rgba(6,182,212,0.15)]'
                            : 'bg-slate-900 border-cyan-950 text-cyan-400/80 hover:bg-slate-850'
                        }`}
                      >
                        {win.id.toUpperCase()}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {activeTab === 'chat' && (
              <ChatConsole
                chatHistory={chatHistory}
                isThinking={isThinking}
                onSendMessage={handleSendMessage}
                isMuted={isMuted}
                onToggleMute={() => setIsMuted(!isMuted)}
                isVoiceAuthEnabled={isVoiceAuthEnabled}
              />
            )}

            {activeTab === 'terminal' && (
              <Terminal
                files={files}
                processes={processes}
                terminalLog={terminalLog}
                onAddTerminalLine={addTerminalLine}
                onClearTerminal={handleClearTerminal}
                onOpenFile={(name) => {
                  handleOpenWindow('notepad');
                  setSelectedFileName(name);
                }}
                onExecuteCommand={handleExecuteTerminalCommand}
              />
            )}

            {activeTab === 'storage' && (
              <FileSystem
                files={files}
                onOpenFile={(name) => {
                  handleOpenWindow('notepad');
                  setSelectedFileName(name);
                }}
                onDeleteFile={handleDeleteFile}
                onCreateFile={handleCreateFile}
              />
            )}
          </div>
        </div>
      </main>

      {/* Footer bar containing metadata logs */}
      <footer className="h-10 border-t border-cyan-900/10 bg-slate-950/60 px-5 flex items-center justify-between font-mono text-[9px] text-slate-500 tracking-wider relative z-30 select-none">
        <span>JARVIS MAIN FRAMEWORK ACTIVE (PORT 3000)</span>
        <span className="hidden sm:inline">COGNITIVE COMPUTES: LOCAL GEMINI-3.5-FLASH INTERFACE</span>
        <span>SECURITY ENVELOPE: TONY_STARK_ALPHA_V3</span>
      </footer>
    </div>
  );
}
