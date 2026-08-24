import React from 'react';
import { PartyPlan } from '../types';
import { formatCurrency } from '../utils';
import {
  Sparkles,
  Music,
  Wine,
  Lightbulb,
  Users,
  Clock,
  DollarSign,
  TrendingDown,
  ChevronRight,
  Palette,
} from 'lucide-react';

interface PartyOverviewCardProps {
  plan: PartyPlan;
  onNavigateTab: (tab: 'define' | 'review' | 'refine_checkout' | 'menu' | 'timeline' | 'overview') => void;
  onOpenBudgetOptimizer: () => void;
}

export const PartyOverviewCard: React.FC<PartyOverviewCardProps> = ({
  plan,
  onNavigateTab,
  onOpenBudgetOptimizer,
}) => {
  return (
    <div className="space-y-6">
      {/* Hero Welcome Card */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                {plan.eventType}
              </span>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 border border-slate-700 rounded-full text-xs font-semibold">
                Tier: {plan.budgetTier.toUpperCase()}
              </span>
            </div>
            <div className="text-xs text-slate-400">
              Created {new Date(plan.createdAt).toLocaleDateString()}
            </div>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-100 tracking-tight mb-2">
              {plan.title}
            </h2>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              {plan.theme}
            </p>
          </div>

          {/* Quick Metrics Bento */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            {/* Total Guests */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Users className="w-3.5 h-3.5 text-rose-400" />
                <span>Guest Count</span>
              </div>
              <div className="text-xl font-bold text-slate-100">
                {plan.guestCount.adults + plan.guestCount.kids} Total
              </div>
              <div className="text-[11px] text-slate-400">
                {plan.guestCount.adults} Adults ({plan.guestCount.drinkers} Drinkers), {plan.guestCount.kids} Kids
              </div>
            </div>

            {/* Duration */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Party Duration</span>
              </div>
              <div className="text-xl font-bold text-slate-100">
                {plan.durationHours} Hours
              </div>
              <div className="text-[11px] text-slate-400">
                Portions sized for full window
              </div>
            </div>

            {/* Estimated Spend */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                <span>Est. Grocery Total</span>
              </div>
              <div className="text-xl font-bold text-emerald-400">
                {formatCurrency(plan.estimatedTotalCost)}
              </div>
              <div className="text-[11px] text-slate-400">
                Budget limit: {formatCurrency(plan.targetBudget)}
              </div>
            </div>

            {/* Shopping Items */}
            <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-3.5">
              <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Shopping Items</span>
              </div>
              <div className="text-xl font-bold text-slate-100">
                {plan.shoppingList.length} Items
              </div>
              <div className="text-[11px] text-slate-400">
                Across 5 store departments
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vibes, Palette & Signature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Color Palette & Music */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400">
            <Palette className="w-4 h-4" />
            <span>Theme Color Palette</span>
          </div>

          <div className="flex items-center gap-2">
            {plan.vibesAndHighlights.colorPalette?.map((color, idx) => (
              <div key={idx} className="flex-1 text-center">
                <div
                  className="h-10 rounded-xl shadow-inner border border-white/10"
                  style={{ backgroundColor: color }}
                />
                <span className="text-[10px] text-slate-400 font-mono mt-1 block">
                  {color}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300 mb-1">
              <Music className="w-3.5 h-3.5 text-indigo-400" />
              <span>Recommended Playlist Vibe</span>
            </div>
            <p className="text-xs text-slate-400">
              {plan.vibesAndHighlights.musicSuggestion}
            </p>
          </div>
        </div>

        {/* Signature Welcome Drink */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
            <Wine className="w-4 h-4" />
            <span>Signature Welcome Drink</span>
          </div>
          <h4 className="text-base font-bold text-slate-100">
            {plan.vibesAndHighlights.signatureWelcome}
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
            Batch ahead in glass beverage dispensers with garnish bowls so guests can serve themselves right upon walking in.
          </p>
          <button
            onClick={() => onNavigateTab('menu')}
            className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1 pt-1"
          >
            <span>View Full Bar & Drink Math</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Master Host Tip */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
            <Lightbulb className="w-4 h-4" />
            <span>Master Host Pro-Tip</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            "{plan.vibesAndHighlights.hostTip}"
          </p>
          <div className="pt-2">
            <button
              onClick={() => onNavigateTab('timeline')}
              className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>Check Prep Timeline Schedule</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Budget Savings Tips Banner */}
      {plan.budgetSavingsTips && plan.budgetSavingsTips.length > 0 && (
        <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-2xl p-5">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <h4 className="text-sm font-bold text-emerald-300 uppercase tracking-wider">
                AI Budget Intelligence & Cost Cutting Ideas
              </h4>
            </div>
            <button
              onClick={onOpenBudgetOptimizer}
              className="text-xs font-semibold px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg transition-colors"
            >
              Run Budget Buster Audit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-300">
            {plan.budgetSavingsTips.map((tip, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">•</span>
                <span>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
