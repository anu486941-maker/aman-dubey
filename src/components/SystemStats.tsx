import React, { useEffect, useState } from 'react';
import { Cpu, Thermometer, Clock, Database, Wifi, ShieldCheck, Zap } from 'lucide-react';
import { SystemMetrics, Process } from '../types';

interface SystemStatsProps {
  metrics: SystemMetrics;
  processes: Process[];
}

export default function SystemStats({ metrics, processes }: SystemStatsProps) {
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString('en-US', { hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setDateStr(now.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatUptime = (secs: number) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="border border-cyan-900/40 bg-slate-950/80 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden flex flex-col h-full">
      {/* Grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />

      {/* Clock section */}
      <div className="flex items-center justify-between border-b border-cyan-900/30 pb-4 mb-5 relative z-10">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-xs text-cyan-400/80 tracking-widest font-bold">TEMPORAL LOG</span>
        </div>
        <div className="text-right">
          <div className="font-mono text-base font-bold text-cyan-400 tracking-wider glow-text">{timeStr || '00:00:00 AM'}</div>
          <div className="font-mono text-[9px] text-slate-500 tracking-widest uppercase">{dateStr || 'JULY 03, 2026'}</div>
        </div>
      </div>

      {/* Metrics layout */}
      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
        {/* CPU Load Gauge */}
        <div className="p-3 bg-slate-900/40 border border-cyan-950 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-slate-400 tracking-wider">CPU CORES (8x)</span>
            <Cpu className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-end justify-between mb-1">
              <span className="font-mono text-xs font-bold text-cyan-300">{metrics.cpuUsage.toFixed(1)}%</span>
              <span className="font-mono text-[8px] text-slate-500 uppercase">LOAD</span>
            </div>
            <div className="h-1.5 w-full bg-cyan-950/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${metrics.cpuUsage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Temperature Load Gauge */}
        <div className="p-3 bg-slate-900/40 border border-cyan-950 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-slate-400 tracking-wider">CORE THERMALS</span>
            <Thermometer className={`w-4 h-4 ${metrics.coreTemp > 50 ? 'text-pink-500 animate-pulse' : 'text-cyan-400'}`} />
          </div>
          <div>
            <div className="flex items-end justify-between mb-1">
              <span className={`font-mono text-xs font-bold ${metrics.coreTemp > 50 ? 'text-pink-400' : 'text-cyan-300'}`}>{metrics.coreTemp.toFixed(1)}°C</span>
              <span className="font-mono text-[8px] text-slate-500 uppercase">TEMP</span>
            </div>
            <div className="h-1.5 w-full bg-cyan-950/40 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${metrics.coreTemp > 50 ? 'bg-pink-500' : 'bg-cyan-400'}`}
                style={{ width: `${(metrics.coreTemp / 100) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Memory Load Gauge */}
        <div className="p-3 bg-slate-900/40 border border-cyan-950 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-slate-400 tracking-wider">RAM ALLOCATION</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-end justify-between mb-1">
              <span className="font-mono text-xs font-bold text-cyan-300">{metrics.memoryUsage.toFixed(1)}%</span>
              <span className="font-mono text-[8px] text-slate-500 uppercase">32GB TOTAL</span>
            </div>
            <div className="h-1.5 w-full bg-cyan-950/40 rounded-full overflow-hidden">
              <div 
                className="h-full bg-cyan-400 transition-all duration-300"
                style={{ width: `${metrics.memoryUsage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Network Metrics */}
        <div className="p-3 bg-slate-900/40 border border-cyan-950 rounded-xl flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[10px] text-slate-400 tracking-wider">OS LINK STATE</span>
            <Wifi className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex flex-col gap-0.5 font-mono text-[9px] text-slate-400">
              <div className="flex justify-between">
                <span>DOWNSTREAM</span>
                <span className="text-cyan-400 font-bold">{(metrics.networkSpeedDown / 1024).toFixed(1)} GB/s</span>
              </div>
              <div className="flex justify-between">
                <span>UPSTREAM</span>
                <span className="text-cyan-400 font-bold">{(metrics.networkSpeedUp / 1024).toFixed(1)} GB/s</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Auxiliary Status Toggles */}
      <div className="mb-6 relative z-10 grid grid-cols-3 gap-2">
        <div className="p-2 border border-cyan-950 bg-slate-900/20 rounded flex items-center justify-between gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <div className="flex flex-col">
            <span className="font-mono text-[7px] text-slate-500">FIREWALL</span>
            <span className="font-mono text-[9px] text-emerald-400 font-bold">ACTIVE</span>
          </div>
        </div>
        <div className="p-2 border border-cyan-950 bg-slate-900/20 rounded flex items-center justify-between gap-1">
          <Zap className="w-3.5 h-3.5 text-cyan-400" />
          <div className="flex flex-col">
            <span className="font-mono text-[7px] text-slate-500">DECRYPTOR</span>
            <span className="font-mono text-[9px] text-cyan-400 font-bold">READY</span>
          </div>
        </div>
        <div className="p-2 border border-cyan-950 bg-slate-900/20 rounded flex items-center justify-between gap-1">
          <Clock className="w-3.5 h-3.5 text-cyan-500/70" />
          <div className="flex flex-col">
            <span className="font-mono text-[7px] text-slate-500">MAINFRAME</span>
            <span className="font-mono text-[9px] text-cyan-500/70 font-bold truncate">{formatUptime(metrics.uptime)}</span>
          </div>
        </div>
      </div>

      {/* Process list */}
      <div className="flex-1 flex flex-col relative z-10 min-h-[140px]">
        <div className="font-mono text-[10px] text-cyan-500/80 tracking-widest font-bold uppercase border-b border-cyan-900/20 pb-1.5 mb-2.5">
          ACTIVE PROCESS CORES (TASKLIST)
        </div>
        <div className="flex-1 overflow-y-auto space-y-1.5 max-h-[160px] pr-1 scrollbar-thin">
          {processes.map((proc) => (
            <div key={proc.pid} className="flex items-center justify-between p-1.5 rounded bg-slate-900/30 border border-cyan-950/40 text-xs font-mono">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-slate-600">[{proc.pid}]</span>
                <span className="text-slate-300 font-bold">{proc.name}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px]">
                <span className="text-cyan-500/70">C:{proc.cpu}%</span>
                <span className="text-cyan-500/70">M:{proc.memory}MB</span>
                <span className={`text-[8px] font-bold px-1 py-0.25 rounded ${
                  proc.status === 'Running' ? 'bg-cyan-950 text-cyan-400' : 'bg-slate-900 text-slate-500'
                }`}>{proc.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
