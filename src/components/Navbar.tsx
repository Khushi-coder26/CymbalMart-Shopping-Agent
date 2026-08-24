import React from 'react';
import { PartyPlan } from '../types';
import {
  Sparkles,
  PlusCircle,
  Share2,
  TrendingDown,
  Bot,
  GlassWater,
  ListTodo,
  CalendarCheck,
  UtensilsCrossed,
  SlidersHorizontal,
  ShoppingBag,
  CheckCircle2,
  Calendar,
  Mic,
} from 'lucide-react';
import { formatCurrency, getBudgetAlignment } from '../utils';

interface NavbarProps {
  plans: PartyPlan[];
  activePlan: PartyPlan | null;
  onSelectPlan: (plan: PartyPlan) => void;
  onOpenCreateModal: () => void;
  onOpenBudgetOptimizer: () => void;
  onOpenExportModal: () => void;
  onToggleChat: () => void;
  isChatOpen: boolean;
  activeTab: 'define' | 'review' | 'refine_checkout' | 'menu' | 'timeline' | 'overview';
  setActiveTab: (tab: 'define' | 'review' | 'refine_checkout' | 'menu' | 'timeline' | 'overview') => void;
  onToggleVoice?: () => void;
  isVoiceListening?: boolean;
  isVoiceContinuous?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  plans,
  activePlan,
  onSelectPlan,
  onOpenCreateModal,
  onOpenBudgetOptimizer,
  onOpenExportModal,
  onToggleChat,
  isChatOpen,
  activeTab,
  setActiveTab,
  onToggleVoice,
  isVoiceListening = false,
  isVoiceContinuous = false,
}) => {
  const budgetStats = activePlan ? getBudgetAlignment(activePlan) : null;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      {/* Top Main Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-lg text-slate-100 tracking-tight leading-none">
                  CymbalMart
                </h1>
                <span className="text-[10px] uppercase font-extrabold tracking-wider px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                  Party Planner AI
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Event Intent • Aisle-Curated Shopping • Bar Math & Fulfillment
              </p>
            </div>
          </div>

          {/* Party Selector & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Active Plan Selector */}
            {plans.length > 0 && (
              <div className="relative">
                <select
                  id="party-plan-selector"
                  value={activePlan?.id || ''}
                  onChange={(e) => {
                    const found = plans.find((p) => p.id === e.target.value);
                    if (found) onSelectPlan(found);
                  }}
                  className="bg-slate-800 border border-slate-700 text-slate-200 text-xs sm:text-sm rounded-xl px-3 py-2 pr-8 focus:ring-1 focus:ring-blue-500 focus:outline-none max-w-[130px] sm:max-w-[210px] truncate font-medium"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Create New Party Button */}
            <button
              id="new-party-btn"
              onClick={onOpenCreateModal}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-blue-500/20 transition-all duration-150 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden md:inline">Plan Event</span>
              <span className="md:hidden">New</span>
            </button>

            {/* Budget Optimizer Button */}
            {activePlan && (
              <button
                id="optimize-budget-btn"
                onClick={onOpenBudgetOptimizer}
                title="AI Budget Optimizer & Swaps"
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-700/50 text-xs font-semibold rounded-xl transition-colors"
              >
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <span>Save Money</span>
              </button>
            )}

            {/* Share / Export */}
            {activePlan && (
              <button
                id="export-list-btn"
                onClick={onOpenExportModal}
                title="Export or Print Shopping List"
                className="p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}

            {/* Hands-Free Voice Control Trigger */}
            {onToggleVoice && (
              <button
                id="navbar-voice-control-btn"
                onClick={onToggleVoice}
                title={isVoiceListening ? 'Stop listening' : 'Start Hands-Free Voice Control'}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-all active:scale-95 ${
                  isVoiceListening
                    ? 'bg-rose-600 text-white border-rose-400 ring-2 ring-rose-400/40 shadow-lg shadow-rose-500/30 animate-pulse'
                    : isVoiceContinuous
                    ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/80'
                    : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Mic className={`w-4 h-4 ${isVoiceListening ? 'text-white animate-bounce' : 'text-rose-400'}`} />
                <span className="hidden xl:inline">Voice Control</span>
              </button>
            )}

            {/* CymbalMart Assistant Chat Toggle */}
            <button
              id="toggle-cymbalmart-assistant-btn"
              onClick={onToggleChat}
              title="Chat with CymbalMart Assistant"
              className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl border transition-all active:scale-95 ${
                isChatOpen
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400 shadow-lg shadow-blue-500/30 ring-2 ring-blue-400/40'
                  : 'bg-slate-800/90 text-blue-300 border-blue-500/40 hover:bg-slate-700 hover:text-white shadow-sm'
              }`}
            >
              <div className="relative">
                <Bot className="w-4 h-4 text-blue-300" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              </div>
              <span className="hidden sm:inline">CymbalMart Assistant</span>
              <span className="sm:hidden">Assistant</span>
            </button>
          </div>
        </div>
      </div>

      {/* CUJ Stepper & Sub-Navigation Tabs */}
      {activePlan && (
        <div className="bg-slate-900 border-t border-slate-800 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto scrollbar-none py-1.5">
            <nav className="flex space-x-1 sm:space-x-2 min-w-max" aria-label="CUJ Tabs">
              {/* Task 1: Define Event */}
              <button
                id="tab-define-event"
                onClick={() => setActiveTab('define')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  activeTab === 'define'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-[10px] font-black">
                  1
                </span>
                <span>Define Event</span>
              </button>

              {/* Task 2: Review List */}
              <button
                id="tab-shopping-list"
                onClick={() => setActiveTab('review')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  activeTab === 'review'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-[10px] font-black">
                  2
                </span>
                <span>Review List & Budget</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {activePlan.shoppingList.length}
                </span>
              </button>

              {/* Task 3: Refine & Checkout */}
              <button
                id="tab-refine-checkout"
                onClick={() => setActiveTab('refine_checkout')}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                  activeTab === 'refine_checkout'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <span className="w-5 h-5 rounded-full bg-slate-800/80 border border-slate-700 flex items-center justify-center text-[10px] font-black">
                  3
                </span>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Refine & Checkout</span>
              </button>

              <div className="h-5 w-px bg-slate-800 my-auto mx-1" />

              {/* Extra Host Helpers */}
              <button
                id="tab-menu-beverages"
                onClick={() => setActiveTab('menu')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                  activeTab === 'menu'
                    ? 'bg-slate-800 text-amber-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <GlassWater className="w-3.5 h-3.5 text-amber-400" />
                <span>Menu & Bar Math</span>
              </button>

              <button
                id="tab-prep-timeline"
                onClick={() => setActiveTab('timeline')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                  activeTab === 'timeline'
                    ? 'bg-slate-800 text-indigo-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Prep Schedule</span>
              </button>

              <button
                id="tab-overview"
                onClick={() => setActiveTab('overview')}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                  activeTab === 'overview'
                    ? 'bg-slate-800 text-rose-400 border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-rose-400" />
                <span>Vibes & Tips</span>
              </button>
            </nav>

            {/* Header Mini Budget Badge */}
            {budgetStats && (
              <div className="hidden md:flex items-center gap-2 text-xs">
                <span className="text-slate-400">Cart Total:</span>
                <span className="font-extrabold text-slate-100">
                  {formatCurrency(budgetStats.currentTotal)}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    budgetStats.status === 'under'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : budgetStats.status === 'over'
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                      : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  }`}
                >
                  {budgetStats.status === 'under' ? 'Under Target' : budgetStats.status === 'over' ? 'Over Target' : 'On Target'}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
