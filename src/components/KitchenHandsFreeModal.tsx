import React from 'react';
import { PartyPlan, ShoppingItem } from '../types';
import { formatCurrency, getBudgetAlignment } from '../utils';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  ShoppingBag,
  CheckCircle2,
  Circle,
  TrendingDown,
  Layers,
  Store,
  Clock,
  HelpCircle,
  Play,
  RotateCcw,
  Check,
} from 'lucide-react';

interface KitchenHandsFreeModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan | null;
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
  suggestedFollowUps: string[];
  onToggleListening: () => void;
  onToggleContinuous: () => void;
  onToggleMute: () => void;
  onSimulateCommand: (command: string) => void;
  onToggleItemCheck: (itemId: string) => void;
  onNavigateTab: (tab: 'define' | 'review' | 'refine_checkout' | 'menu' | 'timeline' | 'overview') => void;
}

const QUICK_KITCHEN_TRIGGERS = [
  'Add 2 bags of party ice to aisle 10',
  'Check off brioche burger buns',
  'Switch all items to Cymbal brand',
  'How much ice do I need for 14 guests?',
  'Apply 10 percent budget trim',
  'Switch to Curbside Pickup for Saturday 11 AM',
  'Go to prep schedule timeline',
  'Finalize and place order',
];

export const KitchenHandsFreeModal: React.FC<KitchenHandsFreeModalProps> = ({
  isOpen,
  onClose,
  plan,
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
  suggestedFollowUps,
  onToggleListening,
  onToggleContinuous,
  onToggleMute,
  onSimulateCommand,
  onToggleItemCheck,
  onNavigateTab,
}) => {
  if (!isOpen) return null;

  const budgetStats = plan ? getBudgetAlignment(plan) : null;
  const items = plan?.shoppingList || [];
  const checkedCount = items.filter((i) => i.checked).length;
  const progressPercent = items.length > 0 ? Math.round((checkedCount / items.length) * 100) : 0;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 text-slate-100 flex flex-col backdrop-blur-md animate-in fade-in duration-200">
      {/* Top Bar */}
      <div className="p-4 sm:p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
            <Mic className={`w-5 h-5 ${isListening ? 'animate-pulse text-rose-400' : 'text-white'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                Hands-Free Host Mode
              </h2>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                  isContinuousMode
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 animate-pulse'
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                }`}
              >
                {isContinuousMode ? 'Continuous Listening Active' : 'Tap To Talk Mode'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {plan ? `Party: ${plan.title}` : 'CymbalMart Shopping Assistant'}
            </p>
          </div>
        </div>

        {/* Top Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onToggleContinuous}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isContinuousMode
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isContinuousMode ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Keep Listening</span>
            <span className="sm:hidden">Auto-Mic</span>
          </button>

          <button
            onClick={onToggleMute}
            className={`p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 ${
              isMuted
                ? 'bg-rose-950/60 text-rose-300 border-rose-800'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title={isMuted ? 'Unmute voice' : 'Mute voice'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            <span className="hidden sm:inline">{isMuted ? 'Muted' : 'Voice Audio'}</span>
          </button>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Kiosk Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-start">
        {/* Left 2 Cols: Massive Voice Display & Live Status */}
        <div className="lg:col-span-2 space-y-6">
          {/* Big Voice State Hero Card */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
            {/* Background Glow */}
            <div
              className={`absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
                isListening
                  ? 'bg-rose-500/20'
                  : isProcessing
                  ? 'bg-blue-500/20'
                  : isSpeaking
                  ? 'bg-emerald-500/20'
                  : 'bg-indigo-500/10'
              }`}
            />

            {/* Central Animated Mic Orb */}
            <div className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                onClick={onToggleListening}
                className={`w-28 h-28 sm:w-36 sm:h-36 rounded-full flex items-center justify-center transition-all duration-300 shadow-2xl active:scale-95 ${
                  isListening
                    ? 'bg-gradient-to-tr from-rose-600 via-pink-600 to-amber-500 ring-8 ring-rose-500/30 scale-105 shadow-rose-500/40'
                    : isProcessing
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 ring-8 ring-blue-500/30 animate-pulse'
                    : isSpeaking
                    ? 'bg-gradient-to-tr from-emerald-600 to-teal-500 ring-8 ring-emerald-500/30'
                    : 'bg-slate-800 hover:bg-slate-700 border-2 border-slate-700'
                }`}
              >
                {isListening ? (
                  <Mic className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-bounce" />
                ) : isProcessing ? (
                  <Sparkles className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-spin" />
                ) : isSpeaking ? (
                  <Volume2 className="w-12 h-12 sm:w-16 sm:h-16 text-white animate-pulse" />
                ) : (
                  <MicOff className="w-10 h-10 sm:w-14 sm:h-14 text-slate-400" />
                )}
              </button>

              {/* Sound Wave Bars */}
              {isListening && (
                <div className="flex items-center gap-1.5 mt-4 h-6">
                  {[40, 75, 100, 60, 90, 45, 80, 100, 70, 30].map((h, i) => (
                    <div
                      key={i}
                      className="w-1 bg-rose-400 rounded-full animate-pulse"
                      style={{
                        height: `${h}%`,
                        animationDelay: `${i * 0.1}s`,
                        animationDuration: '0.6s',
                      }}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Dynamic Status Text */}
            <div className="relative z-10 space-y-2">
              <div className="text-xl sm:text-2xl font-black text-white">
                {isListening
                  ? 'Listening to you... Speak anytime'
                  : isProcessing
                  ? 'Processing your request with Gemini AI...'
                  : isSpeaking
                  ? 'Speaking assistant response...'
                  : 'Microphone Standby — Tap orb or speak'}
              </div>

              {/* Interim Real-time Speech Ticker */}
              {(interimTranscript || transcript) && (
                <div className="max-w-xl mx-auto px-4 py-2 rounded-2xl bg-slate-800/80 border border-slate-700 text-sm font-semibold text-blue-300 animate-in fade-in">
                  "{interimTranscript || transcript}"
                </div>
              )}

              {/* Spoken Response Readout */}
              {lastSpokenReply && (
                <div className="max-w-xl mx-auto px-4 py-3 rounded-2xl bg-blue-950/60 border border-blue-800/60 text-xs sm:text-sm text-slate-200 leading-relaxed shadow-lg">
                  <div className="flex items-center gap-1.5 text-blue-400 font-bold mb-1 text-[11px]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>CymbalMart Assistant:</span>
                    {lastDetectedIntent && (
                      <span className="ml-auto px-2 py-0.5 bg-blue-600/30 text-blue-300 rounded-full text-[10px]">
                        {lastDetectedIntent}
                      </span>
                    )}
                  </div>
                  <p>{lastSpokenReply}</p>
                </div>
              )}
            </div>
          </div>

          {/* Hands-Free One-Tap Quick Triggers */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Instant Voice Simulator Commands:</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_KITCHEN_TRIGGERS.map((cmd, idx) => (
                <button
                  key={idx}
                  onClick={() => onSimulateCommand(cmd)}
                  className="p-3 bg-slate-800/80 hover:bg-blue-600/20 hover:border-blue-500/50 border border-slate-700 rounded-2xl text-left text-xs text-slate-200 transition-all flex items-center justify-between group active:scale-95"
                >
                  <span className="font-medium">"{cmd}"</span>
                  <Play className="w-3.5 h-3.5 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity fill-current flex-shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Live Aisle Progress & Budget Overview */}
        <div className="space-y-6">
          {/* Plan Summary Card */}
          {plan && (
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-white">{plan.title}</h3>
                  <p className="text-xs text-slate-400">
                    {plan.guestCount.adults} Adults, {plan.guestCount.kids} Kids
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-emerald-400">
                    {budgetStats ? formatCurrency(budgetStats.currentTotal) : `$${plan.estimatedTotalCost}`}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Target: ${plan.targetBudget}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>Aisle Items Collected</span>
                  <span>
                    {checkedCount} / {items.length} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Quick Checklist View */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {items.slice(0, 15).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => onToggleItemCheck(item.id)}
                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 cursor-pointer transition-all ${
                      item.checked
                        ? 'bg-slate-900/60 border-slate-800 text-slate-500 line-through'
                        : 'bg-slate-800/80 border-slate-700 text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.checked ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      )}
                      <span className="text-xs font-medium truncate">{item.name}</span>
                    </div>
                    <span className="text-xs font-bold text-slate-300 flex-shrink-0">
                      ${item.estimatedCost}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
