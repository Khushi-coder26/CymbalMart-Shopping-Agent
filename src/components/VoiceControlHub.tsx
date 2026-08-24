import React, { useState } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  RotateCcw,
  HelpCircle,
  Maximize2,
  Keyboard,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronUp,
  ChevronDown,
  Play,
} from 'lucide-react';

interface VoiceControlHubProps {
  isListening: boolean;
  isContinuousMode: boolean;
  isProcessing: boolean;
  isSpeaking: boolean;
  isMuted: boolean;
  transcript: string;
  interimTranscript: string;
  lastCommand: string | null;
  lastSpokenReply: string | null;
  lastDetectedIntent: string | null;
  suggestedFollowUps?: string[];
  error: string | null;
  onToggleListening: () => void;
  onToggleContinuous: () => void;
  onToggleMute: () => void;
  onOpenHelp: () => void;
  onOpenKitchenMode: () => void;
  onSimulateCommand: (command: string) => void;
}

export const VoiceControlHub: React.FC<VoiceControlHubProps> = ({
  isListening,
  isContinuousMode,
  isProcessing,
  isSpeaking,
  isMuted,
  transcript,
  interimTranscript,
  lastCommand,
  lastSpokenReply,
  lastDetectedIntent,
  suggestedFollowUps = [],
  error,
  onToggleListening,
  onToggleContinuous,
  onToggleMute,
  onOpenHelp,
  onOpenKitchenMode,
  onSimulateCommand,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [simulatorInput, setSimulatorInput] = useState('');
  const [showSimulator, setShowSimulator] = useState(false);

  const handleSimulatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulatorInput.trim()) return;
    onSimulateCommand(simulatorInput.trim());
    setSimulatorInput('');
  };

  const displayText = interimTranscript || transcript;

  return (
    <div
      id="cymbal-voice-control-hub"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl transition-all duration-300 animate-in slide-in-from-bottom-6"
    >
      {/* Expanded Simulator / Details Drawer */}
      {(isExpanded || showSimulator) && (
        <div className="mb-2 bg-slate-900/95 border border-slate-700/80 rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-4 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center">
                <Keyboard className="w-4 h-4" />
              </div>
              <span className="font-bold text-xs text-slate-100">
                Voice Control Simulator & Tester
              </span>
            </div>
            <button
              onClick={() => {
                setIsExpanded(false);
                setShowSimulator(false);
              }}
              className="p-1.5 text-slate-400 hover:text-slate-200 rounded-lg hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Text Input Simulation */}
          <form onSubmit={handleSimulatorSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={simulatorInput}
              onChange={(e) => setSimulatorInput(e.target.value)}
              placeholder="Type any voice command (e.g., 'Add 2 packs of buns to aisle 2', 'Go to checkout')..."
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!simulatorInput.trim() || isProcessing}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-40"
            >
              Simulate
            </button>
          </form>

          {/* Quick preset chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Popular Voice Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {[
                'Add 2 packs of buns',
                'Switch all to Cymbal brand',
                'Trim 10 percent budget',
                'How much ice do I need?',
                'Switch to Curbside Pickup',
                'Go to checkout',
                'Check all items',
              ].map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => onSimulateCommand(preset)}
                  className="px-2.5 py-1 bg-slate-800/80 hover:bg-blue-600/30 text-slate-300 hover:text-blue-200 border border-slate-700/80 hover:border-blue-500/40 rounded-lg text-[11px] font-medium transition-all"
                >
                  "{preset}"
                </button>
              ))}
            </div>
          </div>

          {/* Last Response readout */}
          {lastSpokenReply && (
            <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-3 text-xs text-slate-300">
              <div className="text-[10px] font-bold text-blue-400 flex items-center gap-1 mb-1">
                <Sparkles className="w-3 h-3" />
                <span>Last Assistant Spoken Reply ({lastDetectedIntent}):</span>
              </div>
              <p className="leading-relaxed">{lastSpokenReply}</p>
            </div>
          )}
        </div>
      )}

      {/* Main Floating Voice Control Bar */}
      <div className="bg-slate-900/90 hover:bg-slate-900/95 border border-slate-700/80 rounded-full px-3.5 py-2 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 text-white">
        {/* Left: Animated Microphone Orb */}
        <div className="flex items-center gap-3">
          <button
            id="voice-control-mic-toggle-btn"
            type="button"
            onClick={onToggleListening}
            title={isListening ? 'Stop listening' : 'Start voice control'}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg active:scale-90 flex-shrink-0 ${
              isListening
                ? 'bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 ring-4 ring-rose-500/30 shadow-rose-500/40 scale-105'
                : isProcessing
                ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 ring-4 ring-blue-500/30 animate-pulse'
                : isSpeaking
                ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-4 ring-emerald-500/30'
                : 'bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300'
            }`}
          >
            {isListening ? (
              <Mic className="w-5 h-5 text-white animate-pulse" />
            ) : isProcessing ? (
              <Sparkles className="w-5 h-5 text-white animate-spin" />
            ) : isSpeaking ? (
              <Volume2 className="w-5 h-5 text-white animate-bounce" />
            ) : (
              <Mic className="w-5 h-5 text-slate-300" />
            )}
          </button>

          {/* Middle Status & Live Transcript Ticker */}
          <div className="min-w-0 flex-1 pr-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.2 rounded-full border ${
                  isListening
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse'
                    : isProcessing
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                    : isSpeaking
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : isContinuousMode
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                }`}
              >
                {isListening
                  ? 'Listening...'
                  : isProcessing
                  ? 'Processing AI...'
                  : isSpeaking
                  ? 'Speaking...'
                  : isContinuousMode
                  ? 'Hands-Free On'
                  : 'Voice Control'}
              </span>

              {lastDetectedIntent && !displayText && (
                <span className="text-[11px] text-slate-300 font-semibold truncate hidden sm:inline">
                  {lastDetectedIntent}
                </span>
              )}
            </div>

            <div className="text-xs truncate text-slate-300 font-medium mt-0.5 max-w-[200px] sm:max-w-[280px]">
              {displayText ? (
                <span className="text-blue-300 font-semibold animate-pulse">"{displayText}"</span>
              ) : isListening ? (
                <span className="text-slate-400">Say a command (e.g. "Add buns", "Checkout")...</span>
              ) : (
                <span className="text-slate-400 hidden sm:inline">Tap mic to speak hands-free</span>
              )}
            </div>
          </div>
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Continuous Hands-Free Switch */}
          <button
            id="voice-continuous-mode-btn"
            type="button"
            onClick={onToggleContinuous}
            title={isContinuousMode ? 'Continuous Hands-Free ON' : 'Turn on Continuous Hands-Free'}
            className={`p-2 rounded-full text-xs font-bold transition-all ${
              isContinuousMode
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            <RotateCcw className={`w-4 h-4 ${isContinuousMode ? 'animate-spin' : ''}`} />
          </button>

          {/* Mute/Unmute Audio */}
          <button
            id="voice-mute-toggle-btn"
            type="button"
            onClick={onToggleMute}
            title={isMuted ? 'Unmute voice feedback' : 'Mute voice feedback'}
            className={`p-2 rounded-full text-xs transition-colors ${
              isMuted ? 'text-rose-400 hover:bg-rose-950/40' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Simulator / Text tester */}
          <button
            id="voice-simulator-btn"
            type="button"
            onClick={() => setShowSimulator(!showSimulator)}
            title="Open Voice Command Simulator"
            className="p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition-colors hidden sm:flex"
          >
            <Keyboard className="w-4 h-4" />
          </button>

          {/* Cheat Sheet */}
          <button
            id="voice-help-guide-btn"
            type="button"
            onClick={onOpenHelp}
            title="Voice Commands Guide"
            className="p-2 text-slate-400 hover:text-slate-200 rounded-full hover:bg-slate-800 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Kitchen / Full-screen Kiosk Mode */}
          <button
            id="voice-kitchen-mode-btn"
            type="button"
            onClick={onOpenKitchenMode}
            title="Full-Screen Kitchen / Kiosk Mode"
            className="p-2 text-blue-400 hover:text-blue-300 rounded-full hover:bg-slate-800 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
