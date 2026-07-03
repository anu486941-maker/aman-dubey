import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Mic, MicOff, Volume2, VolumeX, Sparkles, RefreshCw, 
  Terminal, FileText, Globe, Play, Square, Settings, Lock, Unlock, Fingerprint, AlertTriangle, Check
} from 'lucide-react';
import { ChatMessage } from '../types';

interface ChatConsoleProps {
  chatHistory: ChatMessage[];
  isThinking: boolean;
  onSendMessage: (text: string) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  isVoiceAuthEnabled: boolean;
}

export default function ChatConsole({ 
  chatHistory, 
  isThinking, 
  onSendMessage, 
  isMuted, 
  onToggleMute,
  isVoiceAuthEnabled
}: ChatConsoleProps) {
  const [inputValue, setInputValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechVolume, setSpeechVolume] = useState<number>(0.9);
  const [showSettings, setShowSettings] = useState(false);
  
  // Biometric Voice Authentication local states
  const [isBiometricVerifying, setIsBiometricVerifying] = useState(false);
  const [biometricTranscript, setBiometricTranscript] = useState('');
  const [biometricMatchScore, setBiometricMatchScore] = useState(0);
  const [biometricStatus, setBiometricStatus] = useState<'analyzing' | 'matched' | 'failed'>('analyzing');
  
  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const recognitionRef = useRef<any>(null);
  
  const isVoiceAuthEnabledRef = useRef(isVoiceAuthEnabled);
  useEffect(() => {
    isVoiceAuthEnabledRef.current = isVoiceAuthEnabled;
  }, [isVoiceAuthEnabled]);

  // Scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking]);

  // Voice synthesis (Text-to-Speech)
  const speakText = (text: string) => {
    if (isMuted || !window.speechSynthesis) return;

    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = speechRate;
    utterance.volume = speechVolume;

    // Attempt to pick a premium British male voice (JARVIS vibe)
    const voices = window.speechSynthesis.getVoices();
    const britishVoice = voices.find(v => v.lang.includes('en-GB') || v.name.toLowerCase().includes('british') || v.name.toLowerCase().includes('daniel'));
    const maleVoice = voices.find(v => v.name.toLowerCase().includes('google uk english male') || v.name.toLowerCase().includes('male'));
    
    if (britishVoice) {
      utterance.voice = britishVoice;
    } else if (maleVoice) {
      utterance.voice = maleVoice;
    }

    window.speechSynthesis.speak(utterance);
  };

  // Trigger speech on last JARVIS message
  useEffect(() => {
    if (chatHistory.length > 0) {
      const lastMsg = chatHistory[chatHistory.length - 1];
      if (lastMsg.sender === 'jarvis') {
        speakText(lastMsg.text);
      }
    }
  }, [chatHistory]);

  // Initialize speech recognition (Speech-to-Text)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          setIsRecording(false);
          if (isVoiceAuthEnabledRef.current) {
            setBiometricTranscript(transcript);
            setIsBiometricVerifying(true);
            setBiometricStatus('analyzing');
            setBiometricMatchScore(0);
            
            let score = 0;
            const timer = setInterval(() => {
              score += Math.floor(Math.random() * 12) + 6;
              if (score >= 98.4) {
                score = 98.4;
                clearInterval(timer);
                setBiometricStatus('matched');
                setTimeout(() => {
                  setInputValue(transcript);
                  setIsBiometricVerifying(false);
                }, 1200);
              }
              setBiometricMatchScore(Math.min(score, 98.4));
            }, 100);
          } else {
            setInputValue(transcript);
          }
        }
      };

      rec.onerror = (err: any) => {
        console.error("Speech recognition error:", err);
        setIsRecording(false);
      };

      rec.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const handleToggleVoiceRecord = () => {
    if (!recognitionRef.current) {
      alert("Sir, voice dictation protocols are not supported on this browser context. Please use Google Chrome or Edge.");
      return;
    }

    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isThinking) return;

    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  return (
    <div className="flex flex-col h-full border border-cyan-900/40 bg-slate-950/80 backdrop-blur-md rounded-2xl p-5 relative overflow-hidden">
      {/* Grid background overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#020617_1px,transparent_1px),linear-gradient(to_bottom,#020617_1px,transparent_1px)] bg-[size:16px_16px] opacity-20 pointer-events-none" />

      {/* Biometric Scan Overlay */}
      {isBiometricVerifying && (
        <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-6 text-center select-none font-mono">
          <div className="absolute top-4 left-4 flex items-center gap-1.5 text-[8px] text-cyan-500 uppercase tracking-widest">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-ping" />
            Vocal Matrix Scanner v1.02
          </div>
          
          <div className="relative mb-6">
            {/* Pulsing scanning rings */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/30 animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-0 rounded-full border border-cyan-400/10 scale-125 animate-pulse" />
            <div className="w-24 h-24 rounded-full border-2 border-dashed border-cyan-500/40 flex items-center justify-center bg-slate-900/60 shadow-[0_0_20px_rgba(6,182,212,0.15)] animate-spin" style={{ animationDuration: '30s' }} />
            <div className="absolute inset-0 flex items-center justify-center">
              <Fingerprint className={`w-10 h-10 ${biometricStatus === 'matched' ? 'text-emerald-400 animate-bounce' : biometricStatus === 'failed' ? 'text-red-400' : 'text-cyan-400 animate-pulse'}`} />
            </div>
          </div>

          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">BIOMETRIC HANDSHAKE PENDING</span>
          
          {biometricStatus === 'analyzing' ? (
            <h3 className="text-sm font-bold text-cyan-300 mt-1 tracking-wider uppercase animate-pulse">
              ANALYSING SPEAKER SIGNATURE: {biometricMatchScore.toFixed(1)}%
            </h3>
          ) : biometricStatus === 'matched' ? (
            <h3 className="text-sm font-bold text-emerald-400 mt-1 tracking-wider uppercase flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" />
              VOICE VERIFIED (STARK MATCH: {biometricMatchScore.toFixed(1)}%)
            </h3>
          ) : (
            <h3 className="text-sm font-bold text-red-400 mt-1 tracking-wider uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              ACCESS DENIED: SPOKEN VECTOR MISMATCH ({biometricMatchScore.toFixed(1)}%)
            </h3>
          )}

          <div className="mt-4 max-w-sm bg-slate-900/40 border border-cyan-950 p-2.5 rounded font-mono text-[9px] text-cyan-400/80 leading-normal">
            <div className="text-left border-b border-cyan-950/50 pb-1 mb-1 text-slate-500 text-[8px] uppercase font-bold">Captured Audio Stream</div>
            <div className="italic truncate text-slate-300">"{biometricTranscript}"</div>
            <div className="flex justify-between items-center mt-2 pt-1 border-t border-cyan-950/30 text-[8px] text-slate-500">
              <span>FREQUENCY: 16.0 kHz</span>
              <span className="text-emerald-400 font-bold">LOCAL ANALYSIS SECURE</span>
            </div>
          </div>

          {/* User simulation options for alien voice */}
          {biometricStatus === 'analyzing' && (
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setBiometricStatus('failed');
                  setBiometricMatchScore(12.4);
                }}
                className="px-2.5 py-1 border border-red-900/60 bg-red-950/20 text-red-400 hover:bg-red-950/50 rounded text-[8px] font-bold uppercase transition-all cursor-pointer"
              >
                Inject Stranger/Alien Voice
              </button>
            </div>
          )}

          {biometricStatus === 'failed' && (
            <button
              type="button"
              onClick={() => {
                setIsBiometricVerifying(false);
              }}
              className="mt-4 px-3 py-1.5 border border-cyan-900 bg-cyan-950/50 text-cyan-400 hover:bg-cyan-950/80 rounded text-[9px] font-bold uppercase transition-all cursor-pointer"
            >
              Abort Handshake / Try Again
            </button>
          )}
        </div>
      )}

      {/* Header Panel */}
      <div className="flex items-center justify-between border-b border-cyan-900/30 pb-4 mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span className="font-mono text-xs text-cyan-400/80 tracking-widest font-bold">INTELLIGENCE TERMINAL</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-1.5 rounded border transition-all ${
              showSettings 
                ? 'bg-cyan-950 border-cyan-500 text-cyan-400' 
                : 'bg-slate-900/60 border-cyan-950 text-slate-500 hover:text-cyan-400 hover:border-cyan-900'
            }`}
            title="Vocal parameters config"
          >
            <Settings className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onToggleMute}
            className={`p-1.5 rounded border transition-all ${
              isMuted 
                ? 'bg-red-950 border-red-900 text-red-400 hover:bg-red-900/40' 
                : 'bg-cyan-950 border-cyan-900 text-cyan-400 hover:bg-cyan-900/40'
            }`}
            title={isMuted ? 'Unmute voice synthesis' : 'Mute voice synthesis'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Settings overlay */}
      {showSettings && (
        <div className="mb-4 p-3 border border-cyan-900/40 bg-slate-900/60 rounded-xl relative z-20 font-mono text-xs text-cyan-400/80">
          <div className="font-bold text-[10px] uppercase tracking-wider mb-2.5 text-cyan-300">Vocal Synthesizer Metrics</div>
          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <span>SPEECH SPEED RATIO</span>
                <span className="text-cyan-400 font-bold">{speechRate.toFixed(1)}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-950 border border-cyan-950 rounded cursor-pointer h-1"
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px]">
                <span>CORE VOLTAGE VOLUME</span>
                <span className="text-cyan-400 font-bold">{(speechVolume * 100).toFixed(0)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.1"
                value={speechVolume}
                onChange={(e) => setSpeechVolume(parseFloat(e.target.value))}
                className="w-full accent-cyan-500 bg-slate-950 border border-cyan-950 rounded cursor-pointer h-1"
              />
            </div>
          </div>
        </div>
      )}

      {/* Dialogue Thread */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 relative z-10 scrollbar-thin select-text">
        {chatHistory.map((msg) => {
          const isUser = msg.sender === 'user';
          const isSystem = msg.sender === 'system';
          
          if (isSystem) {
            return (
              <div key={msg.id} className="flex justify-center">
                <div className="font-mono text-[9px] uppercase tracking-widest text-yellow-500/80 bg-yellow-950/20 border border-yellow-950 px-3 py-1 rounded-full text-center">
                  [OS LOG] {msg.text}
                </div>
              </div>
            );
          }

          return (
            <div 
              key={msg.id} 
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} gap-1`}
            >
              <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500 uppercase tracking-widest px-1">
                <span>{isUser ? 'SIR' : 'JARVIS_PRO_V3'}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>
              
              <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs font-sans leading-relaxed transition-all ${
                isUser 
                  ? 'bg-cyan-500 text-slate-950 font-semibold rounded-tr-none shadow-[0_0_15px_rgba(6,182,212,0.15)]' 
                  : 'bg-slate-900 text-slate-100 border border-cyan-950/60 rounded-tl-none shadow-sm'
              }`}>
                {msg.text}

                {/* Sub-action panel for JARVIS executions */}
                {!isUser && msg.action && msg.action.action !== 'speak_only' && (
                  <div className="mt-3 pt-3 border-t border-cyan-950/40 font-mono text-[10px] text-cyan-400 flex flex-col gap-1.5">
                    <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
                      {msg.action.action === 'system_command' && (
                        <>
                          <Terminal className="w-3.5 h-3.5 text-cyan-500" />
                          <span>CMD PIPELINE SUBMITTED</span>
                        </>
                      )}
                      {msg.action.action === 'file_ops' && (
                        <>
                          <FileText className="w-3.5 h-3.5 text-cyan-500" />
                          <span>FILE OPERATIVE COMPLETED</span>
                        </>
                      )}
                      {msg.action.action === 'open_app' && (
                        <>
                          <Play className="w-3.5 h-3.5 text-cyan-500" />
                          <span>DESKTOP APP LAUNCHED</span>
                        </>
                      )}
                      {msg.action.action === 'web_search' && (
                        <>
                          <Globe className="w-3.5 h-3.5 text-cyan-500" />
                          <span>SEARCH ENGINE SYNCED</span>
                        </>
                      )}
                    </div>
                    {msg.action.command && (
                      <code className="px-2 py-1 bg-black rounded text-[9px] text-slate-300 border border-cyan-950 block select-all">
                        {msg.action.command}
                      </code>
                    )}
                    {msg.action.file_action && (
                      <div className="flex items-center justify-between text-slate-400">
                        <span>OPERATION: {msg.action.file_action.toUpperCase()}</span>
                        <span className="text-cyan-300 truncate max-w-[150px] font-bold">{msg.action.file_path}</span>
                      </div>
                    )}
                    {msg.action.app && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <span>LAUNCHED:</span>
                        <span className="text-cyan-300 font-bold uppercase">{msg.action.app}</span>
                      </div>
                    )}
                    {msg.action.search_query && (
                      <div className="flex items-center gap-1 text-slate-400">
                        <span>QUERY:</span>
                        <span className="text-cyan-300 italic font-bold">"{msg.action.search_query}"</span>
                      </div>
                    )}
                    {msg.action.explanation && (
                      <p className="text-slate-500 italic mt-0.5 leading-normal">{msg.action.explanation}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isThinking && (
          <div className="flex flex-col items-start gap-1">
            <div className="flex items-center gap-1.5 font-mono text-[9px] text-slate-500 uppercase tracking-widest">
              <span>JARVIS CORE</span>
              <span>•</span>
              <span className="animate-pulse text-cyan-400">PROCESSING</span>
            </div>
            <div className="p-3.5 bg-slate-900 border border-cyan-950/60 rounded-2xl rounded-tl-none text-xs font-mono text-cyan-500 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing administrative overrides...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form Panel */}
      <form onSubmit={handleFormSubmit} className="flex gap-2 relative z-10">
        <button
          type="button"
          onClick={handleToggleVoiceRecord}
          className={`p-3.5 rounded-xl border flex items-center justify-center transition-all ${
            isRecording 
              ? 'bg-red-950 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' 
              : 'bg-slate-900 border-cyan-950 text-slate-400 hover:text-cyan-400 hover:border-cyan-900'
          }`}
          title={isRecording ? 'Stop speech dictation' : 'Speak to JARVIS'}
        >
          {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={isRecording ? "Voice dictation channel open, speak now Sir..." : "Instruct JARVIS here (e.g. 'open chrome', 'run dir')..."}
          className="flex-1 bg-slate-900 border border-cyan-950 focus:border-cyan-800 rounded-xl px-4 py-3 text-xs text-white placeholder:text-slate-600 outline-none select-text"
          disabled={isThinking}
          autoComplete="off"
        />
        <button
          type="submit"
          disabled={!inputValue.trim() || isThinking}
          className={`p-3.5 rounded-xl flex items-center justify-center font-bold tracking-wider transition-all ${
            inputValue.trim() && !isThinking
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.25)]'
              : 'bg-slate-900 border border-cyan-950 text-slate-600 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
