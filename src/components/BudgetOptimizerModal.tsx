import React, { useState, useEffect } from 'react';
import { PartyPlan, ShoppingItem } from '../types';
import { formatCurrency } from '../utils';
import {
  X,
  TrendingDown,
  Sparkles,
  ArrowRight,
  Check,
  Loader2,
  DollarSign,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

interface BudgetOptimizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
  onUpdatePlan: (updatedPlan: PartyPlan) => void;
}

export const BudgetOptimizerModal: React.FC<BudgetOptimizerModalProps> = ({
  isOpen,
  onClose,
  plan,
  onUpdatePlan,
}) => {
  const [loading, setLoading] = useState(false);
  const [optimization, setOptimization] = useState<any | null>(null);
  const [appliedSwaps, setAppliedSwaps] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (isOpen && !optimization && !loading) {
      runOptimization();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const runOptimization = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/optimize-budget', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          shoppingList: plan.shoppingList,
          currentTotal: plan.estimatedTotalCost,
          targetBudget: plan.targetBudget,
        }),
      });
      const data = await res.json();
      if (data.success && data.optimization) {
        setOptimization(data.optimization);
      }
    } catch (err) {
      console.error('Failed to optimize budget:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplySwap = (buster: any, idx: number) => {
    // Find matching item in shopping list
    const updatedList = plan.shoppingList.map((item) => {
      if (
        item.name.toLowerCase().includes(buster.originalItem.toLowerCase()) ||
        buster.originalItem.toLowerCase().includes(item.name.toLowerCase())
      ) {
        return {
          ...item,
          name: `${buster.proposedSwap} (AI Cost Saver)`,
          estimatedCost: Math.max(2, item.estimatedCost - buster.estimatedSavings),
          notes: `Swapped from "${buster.originalItem}" to save $${buster.estimatedSavings}`,
        };
      }
      return item;
    });

    const newTotal = updatedList.reduce((sum, i) => sum + i.estimatedCost, 0);
    onUpdatePlan({
      ...plan,
      shoppingList: updatedList,
      estimatedTotalCost: newTotal,
    });

    setAppliedSwaps((prev) => ({ ...prev, [idx]: true }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        id="budget-optimizer-modal"
        className="relative bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden text-slate-100 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">
                AI Budget Optimizer & Cost Swaps
              </h3>
              <p className="text-xs text-slate-400">
                Current Spend: {formatCurrency(plan.estimatedTotalCost)} | Target:{' '}
                {formatCurrency(plan.targetBudget)}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 mx-auto text-emerald-400 animate-spin" />
              <p className="text-sm font-semibold text-slate-200">
                Scanning shopping cart for budget busters...
              </p>
              <p className="text-xs text-slate-400">
                Comparing bulk store ratios and seasonal ingredient swaps
              </p>
            </div>
          ) : optimization ? (
            <>
              {/* Savings Potential Banner */}
              <div className="bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <div className="text-emerald-400 font-bold text-xs uppercase tracking-wider">
                    Total Estimated Potential Savings
                  </div>
                  <div className="text-2xl font-black text-emerald-300">
                    ~{formatCurrency(optimization.potentialSavings || 45)}
                  </div>
                </div>
                <button
                  onClick={runOptimization}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Re-analyze
                </button>
              </div>

              {/* Identified Budget Busters */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                  <span>High Impact Item Swaps:</span>
                </h4>

                <div className="space-y-3">
                  {optimization.budgetBusters?.map((buster: any, idx: number) => {
                    const isApplied = !!appliedSwaps[idx];

                    return (
                      <div
                        key={idx}
                        className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-slate-400 line-through text-xs font-medium">
                                {buster.originalItem}
                              </span>
                              <ArrowRight className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-slate-100 font-bold text-xs">
                                {buster.proposedSwap}
                              </span>
                            </div>
                            <p className="text-slate-400 text-[11px] leading-relaxed">
                              {buster.rationale}
                            </p>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                            <span className="text-emerald-400 font-extrabold text-sm">
                              Save ~${buster.estimatedSavings}
                            </span>
                            <button
                              onClick={() => handleApplySwap(buster, idx)}
                              disabled={isApplied}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                                isApplied
                                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                  : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                              }`}
                            >
                              {isApplied ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Applied!</span>
                                </>
                              ) : (
                                <span>Apply Swap</span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Smart Shopping Tips */}
              <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-2.5">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                  <span>Strategic Shopping Guidelines:</span>
                </h4>
                <div className="space-y-2 text-slate-400">
                  {optimization.smartShoppingTips?.map((tip: string, tIdx: number) => (
                    <div key={tIdx} className="flex items-start gap-2">
                      <span className="text-emerald-400 font-bold">•</span>
                      <span className="leading-relaxed">{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <p>No optimization data available.</p>
              <button
                onClick={runOptimization}
                className="mt-2 text-rose-400 underline font-semibold"
              >
                Click to analyze
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-colors"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};
