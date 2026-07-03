import React, { useEffect, useState, useRef } from 'react';
import { Shield, Cpu, Activity, Zap, Mic, Laptop, Fingerprint, Lock } from 'lucide-react';

interface JarvisCoreProps {
  state: 'idle' | 'analyzing' | 'speaking' | 'offline';
  isMuted: boolean;
  onToggleMute: () => void;
}

export default function JarvisCore({ state, isMuted, onToggleMute }: JarvisCoreProps) {
  const [rotation, setRotation] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Rotation animation
  useEffect(() => {
    let animationId: number;
    const animate = () => {
      setRotation((prev) => {
        let speed = 0.5;
        if (state === 'analyzing') speed = 4;
        if (state === 'speaking') speed = 1.5;
        if (state === 'offline') speed = 0;
        return (prev + speed) % 360;
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();
    return () => cancelAnimationFrame(animationId);
  }, [state]);

  // Canvas wave animation for speaking state
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let waveId: number;
    let phase = 0;

    const drawWave = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 70;

      // Draw grid ring
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 20, 0, Math.PI * 2);
      ctx.stroke();

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.08)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius + 40, 0, Math.PI * 2);
      ctx.stroke();

      // Core wave drawing
      ctx.beginPath();
      ctx.strokeStyle = state === 'speaking' 
        ? 'rgba(34, 211, 238, 0.85)' 
        : state === 'analyzing' 
        ? 'rgba(236, 72, 153, 0.85)' 
        : 'rgba(6, 182, 212, 0.4)';
      
      ctx.shadowBlur = state !== 'idle' ? 15 : 5;
      ctx.shadowColor = state === 'speaking' ? '#06b6d4' : state === 'analyzing' ? '#ec4899' : '#0891b2';
      ctx.lineWidth = 2.5;

      const points = 80;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        let amp = 0;
        
        if (state === 'speaking') {
          // Speak wave harmonics
          amp = Math.sin(angle * 8 + phase) * 12 * Math.sin(phase * 0.5) + 
                Math.cos(angle * 4 - phase * 1.5) * 4;
        } else if (state === 'analyzing') {
          // Aggressive analyzing spikes
          amp = Math.sin(angle * 16 + phase * 2) * 6 + Math.cos(angle * 3) * 3;
        } else if (state === 'idle') {
          // Subtle idle breathing pulse
          amp = Math.sin(angle * 4 + phase) * 2;
        }

        const currentRadius = radius + amp;
        const x = centerX + Math.cos(angle) * currentRadius;
        const y = centerY + Math.sin(angle) * currentRadius;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.stroke();

      // Reset shadows
      ctx.shadowBlur = 0;

      // Draw particle nodes on the wave
      if (state === 'speaking' || state === 'analyzing') {
        const numParticles = 6;
        for (let k = 0; k < numParticles; k++) {
          const angle = ((phase * 0.1) + (k / numParticles) * Math.PI * 2) % (Math.PI * 2);
          let amp = state === 'speaking' ? Math.sin(angle * 8 + phase) * 8 : Math.sin(angle * 16 + phase * 2) * 5;
          const pRadius = radius + amp;
          const px = centerX + Math.cos(angle) * pRadius;
          const py = centerY + Math.sin(angle) * pRadius;

          ctx.fillStyle = state === 'speaking' ? '#22d3ee' : '#f472b6';
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      phase += 0.15;
      waveId = requestAnimationFrame(drawWave);
    };

    drawWave();
    return () => cancelAnimationFrame(waveId);
  }, [state]);

  const getStateColors = () => {
    switch (state) {
      case 'speaking':
        return {
          glow: 'shadow-[0_0_50px_rgba(34,211,238,0.4)]',
          border: 'border-cyan-400',
          text: 'text-cyan-400',
          bg: 'bg-cyan-950/40',
          label: 'MAINFRAME VOCAL'
        };
      case 'analyzing':
        return {
          glow: 'shadow-[0_0_50px_rgba(236,72,153,0.4)]',
          border: 'border-pink-500',
          text: 'text-pink-500',
          bg: 'bg-pink-950/40',
          label: 'ANALYZING PATTERNS'
        };
      case 'offline':
        return {
          glow: 'shadow-none',
          border: 'border-gray-700',
          text: 'text-gray-500',
          bg: 'bg-gray-950/50',
          label: 'OFFLINE'
        };
      case 'idle':
      default:
        return {
          glow: 'shadow-[0_0_40px_rgba(6,182,212,0.25)]',
          border: 'border-cyan-500/50',
          text: 'text-cyan-500',
          bg: 'bg-slate-950/40',
          label: 'STANDBY MODE'
        };
    }
  };

  const colors = getStateColors();

  return (
    <div id="jarvis_core_widget" className="flex flex-col items-center justify-center p-6 border border-cyan-900/40 bg-slate-950/80 backdrop-blur-md rounded-2xl relative overflow-hidden h-full">
      {/* Aesthetic grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />
      
      {/* Ambient glowing orb */}
      <div className={`absolute w-36 h-36 rounded-full blur-3xl transition-all duration-1000 opacity-20 ${
        state === 'speaking' ? 'bg-cyan-500' : state === 'analyzing' ? 'bg-pink-500' : 'bg-cyan-700'
      }`} />

      {/* Futuristic Header */}
      <div className="w-full flex items-center justify-between border-b border-cyan-900/30 pb-3 mb-6 relative z-10">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-500 animate-pulse" />
          <span className="font-mono text-xs text-cyan-500/80 tracking-widest font-bold">JARVIS COGNITIVE CORE</span>
        </div>
        <button 
          onClick={onToggleMute}
          className={`px-2.5 py-1 font-mono text-[10px] rounded border transition-all ${
            isMuted 
              ? 'bg-red-950/40 border-red-800 text-red-400 hover:bg-red-900/40' 
              : 'bg-cyan-950/40 border-cyan-800 text-cyan-400 hover:bg-cyan-900/40'
          }`}
          title={isMuted ? 'Unmute voice synthesis' : 'Mute voice synthesis'}
        >
          {isMuted ? 'SPEECH: MUTED' : 'SPEECH: ACTIVE'}
        </button>
      </div>

      {/* Hologram Circle */}
      <div className="relative flex items-center justify-center my-4 z-10">
        {/* Outer Tech Ring */}
        <div 
          style={{ transform: `rotate(${rotation}deg)` }}
          className={`absolute w-56 h-56 rounded-full border-2 border-dashed ${colors.border} opacity-40 transition-colors duration-500`}
        />

        {/* Medium Tech Segment Ring */}
        <div 
          style={{ transform: `rotate(${-rotation * 1.5}deg)` }}
          className={`absolute w-48 h-48 rounded-full border border-double ${colors.border} opacity-25 border-t-transparent border-b-transparent transition-colors duration-500`}
        />

        {/* Dynamic canvas visualizer */}
        <div className={`w-44 h-44 rounded-full flex items-center justify-center relative ${colors.bg} ${colors.glow} border border-cyan-500/20 transition-all duration-500 overflow-hidden`}>
          <canvas 
            ref={canvasRef} 
            width={180} 
            height={180} 
            className="absolute top-0 left-0 w-full h-full"
          />
          {/* Inner glass core orb */}
          <div className="w-24 h-24 rounded-full bg-slate-950/90 border border-cyan-500/30 flex flex-col items-center justify-center text-center relative z-10 backdrop-blur-sm">
            <Cpu className={`w-8 h-8 ${colors.text} mb-1 transition-all duration-500 ${state === 'analyzing' ? 'animate-spin' : state === 'speaking' ? 'animate-bounce' : 'animate-pulse'}`} />
            <span className="font-mono text-[8px] text-cyan-500/70 tracking-widest font-bold">MARK V3</span>
          </div>
        </div>
      </div>

      {/* State Badge */}
      <div className="mt-6 flex flex-col items-center gap-1.5 relative z-10">
        <div className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/30 border border-cyan-900/50 rounded-full">
          <div className={`w-2 h-2 rounded-full ${
            state === 'speaking' ? 'bg-cyan-400 animate-ping' : state === 'analyzing' ? 'bg-pink-400 animate-ping' : state === 'offline' ? 'bg-gray-600' : 'bg-cyan-500 animate-pulse'
          }`} />
          <span className={`font-mono text-[10px] font-extrabold tracking-widest ${colors.text}`}>{colors.label}</span>
        </div>
        <p className="font-mono text-[9px] text-slate-500 text-center tracking-wide max-w-[240px]">
          {state === 'speaking' ? 'Synthesizing voice response, Sir.' : 
           state === 'analyzing' ? 'Evaluating algorithms & search grounding...' : 
           'Mainframe connected. Awaiting vocal command.'}
        </p>
      </div>

      {/* Biometric & Device Link HUD */}
      <div className="w-full mt-5 space-y-2 relative z-10 font-mono text-[9px]">
        {/* Voice Recognition */}
        <div className="flex items-center justify-between p-2 rounded bg-slate-900/40 border border-cyan-950/60 shadow-[0_0_10px_rgba(6,182,212,0.05)]">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Mic className="w-3.5 h-3.5 text-cyan-400" />
              <div className="absolute -top-0.5 -right-0.5 w-1 h-1 bg-emerald-500 rounded-full animate-ping" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-500 text-[7px] uppercase font-bold leading-none">VOICE PRINT LOCK</span>
              <span className="text-cyan-400 font-bold tracking-wider text-[8px] mt-0.5">EXCLUSIVE TO SIR (TONY STARK)</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-emerald-950/40 border border-emerald-900/50 px-1.5 py-0.5 rounded text-[7px] text-emerald-400 font-bold">
            <Fingerprint className="w-2.5 h-2.5 animate-pulse text-emerald-400" />
            <span>VERIFIED</span>
          </div>
        </div>

        {/* Local Laptop Access */}
        <div className="flex items-center justify-between p-2 rounded bg-slate-900/40 border border-cyan-950/60 shadow-[0_0_10px_rgba(6,182,212,0.05)]">
          <div className="flex items-center gap-2">
            <Laptop className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <div className="flex flex-col">
              <span className="text-slate-500 text-[7px] uppercase font-bold leading-none">WORKSTATION LINK</span>
              <span className="text-cyan-300 font-bold tracking-wider text-[8px] mt-0.5">STARK-LAPTOP-X (LOCAL)</span>
            </div>
          </div>
          <div className="flex items-center gap-1 bg-cyan-950/50 border border-cyan-800/50 px-1.5 py-0.5 rounded text-[7px] text-cyan-300 font-bold">
            <Lock className="w-2 h-2 text-cyan-400" />
            <span>ACTIVE LINK</span>
          </div>
        </div>
      </div>

      {/* Core status indicators */}
      <div className="w-full grid grid-cols-3 gap-2 mt-6 border-t border-cyan-900/20 pt-4 relative z-10">
        <div className="flex flex-col items-center justify-center p-1.5 bg-slate-900/40 border border-cyan-950 rounded">
          <Shield className="w-3.5 h-3.5 text-cyan-500/70 mb-0.5" />
          <span className="font-mono text-[7px] text-slate-500 uppercase">FIREWALL</span>
          <span className="font-mono text-[9px] text-emerald-400 font-bold">SECURE</span>
        </div>
        <div className="flex flex-col items-center justify-center p-1.5 bg-slate-900/40 border border-cyan-950 rounded">
          <Zap className="w-3.5 h-3.5 text-cyan-500/70 mb-0.5" />
          <span className="font-mono text-[7px] text-slate-500 uppercase">LATENCY</span>
          <span className="font-mono text-[9px] text-cyan-400 font-bold">14ms</span>
        </div>
        <div className="flex flex-col items-center justify-center p-1.5 bg-slate-900/40 border border-cyan-950 rounded">
          <Cpu className="w-3.5 h-3.5 text-cyan-500/70 mb-0.5" />
          <span className="font-mono text-[7px] text-slate-500 uppercase">MAIN BUS</span>
          <span className="font-mono text-[9px] text-cyan-400 font-bold">128-BIT</span>
        </div>
      </div>
    </div>
  );
}
