import React, { useState, useMemo } from 'react';
import { PartyPlan, ShoppingItem, StoreCategory } from '../types';
import { formatCurrency, calculateShoppingStats, getBudgetAlignment, CYMBAL_AISLES } from '../utils';
import {
  CheckCircle2,
  Circle,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit2,
  Store,
  DollarSign,
  AlertCircle,
  Info,
  Check,
  X,
  Sparkles,
  ShoppingBag,
  TrendingDown,
  ArrowRight,
  BadgePercent,
  Layers,
  Sliders,
  Minus,
  ArrowUpDown,
  Calculator,
  RotateCcw,
  CheckCheck,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface ShoppingListTabProps {
  plan: PartyPlan;
  onUpdatePlan: (updatedPlan: PartyPlan) => void;
  onOpenAddCustomItem: () => void;
  onProceedToCheckout?: () => void;
  onOpenBudgetOptimizer?: () => void;
}

// Helper to parse numerical quantity from string
function parseQuantityCount(qty: string): { count: number; unit: string } {
  if (!qty) return { count: 1, unit: 'pack' };
  const match = qty.match(/^(\d+(?:\.\d+)?)\s*(.*)$/);
  if (match) {
    const count = parseFloat(match[1]) || 1;
    const unit = match[2].trim() || 'pack';
    return { count, unit };
  }
  return { count: 1, unit: qty };
}

export const ShoppingListTab: React.FC<ShoppingListTabProps> = ({
  plan,
  onUpdatePlan,
  onOpenAddCustomItem,
  onProceedToCheckout,
  onOpenBudgetOptimizer,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showOnlyUnchecked, setShowOnlyUnchecked] = useState<boolean>(false);
  const [showOnlyMustHave, setShowOnlyMustHave] = useState<boolean>(false);
  const [showOnlyCymbalBrand, setShowOnlyCymbalBrand] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<'aisle' | 'price_desc' | 'price_asc' | 'name'>('aisle');

  // Editing state
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<Partial<ShoppingItem>>({});

  // Quick target budget editor state
  const [isEditingTargetBudget, setIsEditingTargetBudget] = useState(false);
  const [customTargetBudget, setCustomTargetBudget] = useState<string>(String(plan.targetBudget));

  // Quick Add Item inside a specific Aisle state
  const [quickAddAisleCategory, setQuickAddAisleCategory] = useState<StoreCategory | null>(null);
  const [quickAddItemName, setQuickAddItemName] = useState('');
  const [quickAddItemCost, setQuickAddItemCost] = useState('');
  const [quickAddItemQuantity, setQuickAddItemQuantity] = useState('1 pack');

  // Statistics recalculations
  const stats = useMemo(() => calculateShoppingStats(plan.shoppingList), [plan.shoppingList]);
  const budgetStats = useMemo(() => getBudgetAlignment(plan), [plan]);

  // Update budget totals helper
  const recalculateAndSaveList = (newList: ShoppingItem[], newTargetBudget?: number) => {
    const newTotal = newList.reduce((sum, item) => sum + (Number(item.estimatedCost) || 0), 0);
    onUpdatePlan({
      ...plan,
      shoppingList: newList,
      estimatedTotalCost: Math.round(newTotal * 100) / 100,
      targetBudget: newTargetBudget !== undefined ? newTargetBudget : plan.targetBudget,
    });
  };

  // Toggle item checked
  const toggleItem = (itemId: string) => {
    const updatedList = plan.shoppingList.map((item) => {
      if (item.id === itemId) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });

    const newCheckedCount = updatedList.filter((i) => i.checked).length;
    if (newCheckedCount === updatedList.length && updatedList.length > 0) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    }

    recalculateAndSaveList(updatedList);
  };

  // Quantity Stepper (+ / -) with automatic cost & budget recalculation
  const handleStepQuantity = (itemId: string, direction: 'inc' | 'dec') => {
    const updatedList = plan.shoppingList.map((item) => {
      if (item.id === itemId) {
        const { count, unit } = parseQuantityCount(item.quantity);
        const currentCount = Math.max(1, count);
        const newCount = direction === 'inc' ? currentCount + 1 : Math.max(1, currentCount - 1);
        
        if (newCount === currentCount) return item;

        // Calculate unit cost and scale total cost proportionately
        const unitCost = item.estimatedCost / currentCount;
        const newEstimatedCost = Math.max(1, Math.round(unitCost * newCount * 100) / 100);
        const newQuantityStr = `${newCount} ${unit}`;

        return {
          ...item,
          quantity: newQuantityStr,
          estimatedCost: newEstimatedCost,
          cymbalBrandSavings: item.cymbalBrandSavings
            ? Math.round((item.cymbalBrandSavings / currentCount) * newCount)
            : Math.round(newEstimatedCost * 0.22),
        };
      }
      return item;
    });

    recalculateAndSaveList(updatedList);
  };

  // Switch all items to CymbalMart Great Value Brand for maximum savings
  const handleSwitchAllToCymbalBrand = () => {
    let savedTotal = 0;
    const updatedList = plan.shoppingList.map((item) => {
      if (!item.isCymbalBrand) {
        const savings = item.cymbalBrandSavings || Math.round(item.estimatedCost * 0.22);
        savedTotal += savings;
        return {
          ...item,
          isCymbalBrand: true,
          estimatedCost: Math.max(1, item.estimatedCost - savings),
          notes: item.notes ? `${item.notes} (Cymbal Brand)` : 'Switched to CymbalMart Great Value brand',
        };
      }
      return item;
    });

    confetti({
      particleCount: 50,
      spread: 45,
      origin: { y: 0.7 },
    });

    recalculateAndSaveList(updatedList);
  };

  // Toggle single item brand
  const toggleItemBrand = (itemId: string) => {
    const updatedList = plan.shoppingList.map((item) => {
      if (item.id === itemId) {
        const isNowCymbal = !item.isCymbalBrand;
        const diff = item.cymbalBrandSavings || Math.round(item.estimatedCost * 0.22);
        const newCost = isNowCymbal
          ? Math.max(1, item.estimatedCost - diff)
          : item.estimatedCost + diff;

        return {
          ...item,
          isCymbalBrand: isNowCymbal,
          estimatedCost: newCost,
        };
      }
      return item;
    });

    recalculateAndSaveList(updatedList);
  };

  // Scale all items by percentage (e.g., +15% generous host buffer or -10% budget trim)
  const handleScaleAllItems = (multiplier: number) => {
    const updatedList = plan.shoppingList.map((item) => {
      const newCost = Math.max(1, Math.round(item.estimatedCost * multiplier * 10) / 10);
      return {
        ...item,
        estimatedCost: newCost,
      };
    });

    recalculateAndSaveList(updatedList);
  };

  // Delete item
  const deleteItem = (itemId: string) => {
    const updatedList = plan.shoppingList.filter((i) => i.id !== itemId);
    recalculateAndSaveList(updatedList);
  };

  // Start Edit
  const startEdit = (item: ShoppingItem) => {
    setEditingItemId(item.id);
    setEditFormData({ ...item });
  };

  // Save Edit
  const saveEdit = () => {
    if (!editingItemId) return;
    const updatedList = plan.shoppingList.map((item) => {
      if (item.id === editingItemId) {
        return {
          ...item,
          ...editFormData,
          estimatedCost: Number(editFormData.estimatedCost) || item.estimatedCost,
        } as ShoppingItem;
      }
      return item;
    });

    recalculateAndSaveList(updatedList);
    setEditingItemId(null);
  };

  // Save Target Budget adjustment
  const handleSaveTargetBudget = () => {
    const newTarget = parseFloat(customTargetBudget);
    if (!isNaN(newTarget) && newTarget > 0) {
      recalculateAndSaveList(plan.shoppingList, Math.round(newTarget));
    }
    setIsEditingTargetBudget(false);
  };

  // Add Item Directly inside an Aisle
  const handleQuickAddInsideAisle = (category: StoreCategory) => {
    if (!quickAddItemName.trim()) return;

    const aisleInfo = CYMBAL_AISLES[category] || { number: 6, name: 'Aisle 6: Pantry' };
    const cost = parseFloat(quickAddItemCost) || 5.0;

    const newItem: ShoppingItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      name: quickAddItemName.trim(),
      category,
      aisleNumber: aisleInfo.number,
      aisleName: aisleInfo.name,
      quantity: quickAddItemQuantity.trim() || '1 pack',
      estimatedCost: cost,
      isMustHave: true,
      isCymbalBrand: true,
      cymbalBrandSavings: Math.round(cost * 0.22),
      recommendedStore: 'CymbalMart Supercenter',
      notes: 'Added directly from shopping list',
      checked: false,
    };

    const updatedList = [...plan.shoppingList, newItem];
    recalculateAndSaveList(updatedList);

    // Reset quick add state
    setQuickAddItemName('');
    setQuickAddItemCost('');
    setQuickAddItemQuantity('1 pack');
    setQuickAddAisleCategory(null);

    confetti({
      particleCount: 30,
      spread: 40,
      origin: { y: 0.7 },
    });
  };

  // Filter & sort items
  const filteredAndSortedItems = useMemo(() => {
    let result = plan.shoppingList.filter((item) => {
      if (selectedCategory !== 'ALL' && item.category !== selectedCategory) return false;
      if (showOnlyUnchecked && item.checked) return false;
      if (showOnlyMustHave && !item.isMustHave) return false;
      if (showOnlyCymbalBrand && !item.isCymbalBrand) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesCategory = item.category.toLowerCase().includes(q);
        const matchesNotes = item.notes?.toLowerCase().includes(q);
        const matchesAisle = item.aisleName?.toLowerCase().includes(q);
        if (!matchesName && !matchesCategory && !matchesNotes && !matchesAisle) return false;
      }
      return true;
    });

    // Sorting
    if (sortBy === 'price_desc') {
      result = [...result].sort((a, b) => b.estimatedCost - a.estimatedCost);
    } else if (sortBy === 'price_asc') {
      result = [...result].sort((a, b) => a.estimatedCost - b.estimatedCost);
    } else if (sortBy === 'name') {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [plan.shoppingList, selectedCategory, showOnlyUnchecked, showOnlyMustHave, showOnlyCymbalBrand, searchQuery, sortBy]);

  // Group filtered items by category & sort by aisle
  const groupedByCategory = useMemo(() => {
    const groups: Record<string, ShoppingItem[]> = {};
    filteredAndSortedItems.forEach((item) => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category].push(item);
    });
    return groups;
  }, [filteredAndSortedItems]);

  const categoryEntries = useMemo(() => {
    return (Object.entries(groupedByCategory) as [StoreCategory, ShoppingItem[]][]).sort(
      ([catA], [catB]) => {
        const aisleA = CYMBAL_AISLES[catA]?.number || 99;
        const aisleB = CYMBAL_AISLES[catB]?.number || 99;
        return aisleA - aisleB;
      }
    );
  }, [groupedByCategory]);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* CUJ Step 2 Banner */}
      <div className="bg-gradient-to-r from-blue-950/60 via-slate-900 to-indigo-950/40 border border-blue-500/30 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Task 2: Review List & Align Budget
              </span>
              <span className="text-xs text-slate-400">Live Budget Recalculator Active</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Aisle-by-Aisle Shopping List & Budget Alignment
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Every grocery cut, beverage bottle, and tableware pack mapped to CymbalMart store aisles. Modify quantities, prices, or private label swaps to recalculate budget totals in real-time.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button
              id="open-add-custom-item-top-btn"
              onClick={onOpenAddCustomItem}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-2 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Custom Item</span>
            </button>

            {onProceedToCheckout && (
              <button
                id="proceed-to-checkout-top-btn"
                onClick={onProceedToCheckout}
                className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 flex items-center gap-2 transition-all active:scale-95"
              >
                <span>Proceed to Fulfillment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Live Budget Alignment Meter & Brand Savings Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Alignment Gauge Card */}
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-lg space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  CymbalMart Budget Alignment Meter
                </span>
                <span className="text-[10px] px-2 py-0.5 bg-blue-500/20 text-blue-300 font-bold rounded-full">
                  Auto-Recalculating
                </span>
              </div>
              <div className="flex items-baseline gap-3 mt-1 flex-wrap">
                <span className="text-2xl sm:text-3xl font-black text-slate-100">
                  {formatCurrency(budgetStats.currentTotal)}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                  of
                  {isEditingTargetBudget ? (
                    <div className="inline-flex items-center gap-1">
                      <span className="text-slate-300">$</span>
                      <input
                        type="number"
                        value={customTargetBudget}
                        onChange={(e) => setCustomTargetBudget(e.target.value)}
                        className="w-20 bg-slate-800 border border-blue-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none"
                        autoFocus
                      />
                      <button
                        onClick={handleSaveTargetBudget}
                        className="px-2 py-0.5 bg-blue-600 text-white rounded text-[11px] font-bold"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setCustomTargetBudget(String(plan.targetBudget));
                        setIsEditingTargetBudget(true);
                      }}
                      className="group inline-flex items-center gap-1 text-slate-200 hover:text-blue-300 underline font-bold"
                      title="Click to edit target budget"
                    >
                      <span>{formatCurrency(budgetStats.target)}</span>
                      <Edit2 className="w-3 h-3 text-slate-500 group-hover:text-blue-300" />
                    </button>
                  )}
                  target
                </span>
              </div>
            </div>

            {/* Status Pill */}
            <div className="self-start sm:self-auto">
              {budgetStats.status === 'under' && (
                <span className="px-3.5 py-1.5 bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <Check className="w-4 h-4" />
                  <span>Under Budget ({formatCurrency(Math.abs(budgetStats.difference))} under!)</span>
                </span>
              )}
              {budgetStats.status === 'on_target' && (
                <span className="px-3.5 py-1.5 bg-blue-500/15 text-blue-400 border border-blue-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <Check className="w-4 h-4" />
                  <span>On Target Budget</span>
                </span>
              )}
              {budgetStats.status === 'over' && (
                <span className="px-3.5 py-1.5 bg-rose-500/15 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm">
                  <AlertCircle className="w-4 h-4" />
                  <span>{formatCurrency(budgetStats.difference)} Over Target</span>
                </span>
              )}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex">
              <div
                className={`h-full transition-all duration-300 ${
                  budgetStats.percentUsed > 105
                    ? 'bg-rose-500'
                    : budgetStats.percentUsed < 95
                    ? 'bg-emerald-500'
                    : 'bg-blue-500'
                }`}
                style={{ width: `${Math.min(100, budgetStats.percentUsed)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 flex-wrap gap-2">
              <span>{budgetStats.percentUsed}% of budget allocated ({stats.totalItems} items)</span>
              <span>
                <strong>{formatCurrency(budgetStats.costPerGuest)}</strong> / guest ({budgetStats.totalGuests} guests)
              </span>
              <span>
                Remaining to buy: <strong>{formatCurrency(stats.remainingCost)}</strong> ({stats.remainingItems} items)
              </span>
            </div>
          </div>

          {/* Quick Target Budget Presets */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2 flex-wrap text-xs">
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <span>Quick Budget Adjust:</span>
              <button
                onClick={() => recalculateAndSaveList(plan.shoppingList, Math.max(50, plan.targetBudget - 25))}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                -$25
              </button>
              <button
                onClick={() => recalculateAndSaveList(plan.shoppingList, plan.targetBudget + 25)}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
              >
                +$25
              </button>
              <button
                onClick={() => recalculateAndSaveList(plan.shoppingList, Math.round(budgetStats.currentTotal))}
                className="px-2 py-0.5 rounded bg-blue-900/40 hover:bg-blue-800/60 text-blue-300 font-semibold border border-blue-700/50"
              >
                Match Current Total ({formatCurrency(budgetStats.currentTotal)})
              </button>
            </div>

            {onOpenBudgetOptimizer && (
              <button
                onClick={onOpenBudgetOptimizer}
                className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>AI Budget Optimizer</span>
              </button>
            )}
          </div>
        </div>

        {/* Brand Savings Switcher Card */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-5 sm:p-6 shadow-lg flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                <BadgePercent className="w-4 h-4" />
                <span>Cymbal Brand Savings</span>
              </span>
              <span className="text-[11px] text-slate-400">{stats.cymbalBrandCount} / {stats.totalItems} items</span>
            </div>
            <div className="text-xl font-black text-slate-100">
              Save up to ~{formatCurrency(budgetStats.potentialCymbalSavings)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Switching items to CymbalMart Great Value private label guarantees 100% taste at 20-30% lower cost and recalculates your total immediately.
            </p>
          </div>

          <button
            id="switch-cymbal-brand-btn"
            type="button"
            onClick={handleSwitchAllToCymbalBrand}
            className="w-full py-2.5 px-3 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-700/60 text-emerald-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-colors active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Switch All to Cymbal Brand</span>
          </button>
        </div>
      </div>

      {/* Global Quick Scaling & Multiplier Toolbar */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 flex items-center justify-between gap-3 flex-wrap text-xs">
        <div className="flex items-center gap-2 text-slate-300 font-semibold">
          <Sliders className="w-4 h-4 text-blue-400" />
          <span>Batch Quantity Multipliers:</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => handleScaleAllItems(0.9)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-700 transition-colors"
            title="Trim 10% from all items"
          >
            -10% Budget Trim
          </button>
          <button
            onClick={() => handleScaleAllItems(1.15)}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-700 transition-colors"
            title="Add 15% hearty guest buffer"
          >
            +15% Hearty Appetite Buffer
          </button>
          <button
            onClick={() => {
              const allChecked = plan.shoppingList.every((i) => i.checked);
              const updatedList = plan.shoppingList.map((i) => ({ ...i, checked: !allChecked }));
              recalculateAndSaveList(updatedList);
            }}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-semibold border border-slate-700 transition-colors flex items-center gap-1"
          >
            <CheckCheck className="w-3.5 h-3.5 text-blue-400" />
            <span>Toggle All Collected</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-lg space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search items, ingredients, aisles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-800/80 border border-slate-700/80 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Sort Menu */}
            <div className="flex items-center gap-1 bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e: any) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-200 text-xs focus:outline-none cursor-pointer"
              >
                <option value="aisle" className="bg-slate-900 text-slate-200">Aisle Order (1–12)</option>
                <option value="price_desc" className="bg-slate-900 text-slate-200">Price (High to Low)</option>
                <option value="price_asc" className="bg-slate-900 text-slate-200">Price (Low to High)</option>
                <option value="name" className="bg-slate-900 text-slate-200">Alphabetical (A-Z)</option>
              </select>
            </div>

            <button
              onClick={() => setShowOnlyUnchecked(!showOnlyUnchecked)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showOnlyUnchecked
                  ? 'bg-blue-600/20 text-blue-300 border-blue-500/50'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              Remaining ({stats.remainingItems})
            </button>

            <button
              onClick={() => setShowOnlyMustHave(!showOnlyMustHave)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showOnlyMustHave
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              Must-Haves Only
            </button>

            <button
              onClick={() => setShowOnlyCymbalBrand(!showOnlyCymbalBrand)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                showOnlyCymbalBrand
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              Cymbal Brand
            </button>
          </div>
        </div>

        {/* Category / Aisle Pill Filter */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 text-xs">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl font-semibold border whitespace-nowrap transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            All Aisles ({plan.shoppingList.length})
          </button>
          {(Object.keys(CYMBAL_AISLES) as StoreCategory[]).map((cat) => {
            const aisle = CYMBAL_AISLES[cat];
            const count = plan.shoppingList.filter((i) => i.category === cat).length;
            if (count === 0) return null;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-semibold border whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white border-blue-500 shadow-sm'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{aisle.icon}</span>
                <span>{cat}</span>
                <span className="text-[10px] opacity-75">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Shopping List Grouped by CymbalMart Store Aisles */}
      {categoryEntries.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-200">No items match your active filters</h3>
          <p className="text-xs text-slate-400">Try adjusting your search query or reset aisle filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {categoryEntries.map(([category, items]) => {
            const aisleInfo = CYMBAL_AISLES[category] || { number: 0, name: `Aisle: ${category}`, icon: '🛒' };
            const categoryCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
            const categoryChecked = items.filter((i) => i.checked).length;
            const isQuickAddOpen = quickAddAisleCategory === category;

            return (
              <div
                key={category}
                className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-lg"
              >
                {/* Aisle Section Header */}
                <div className="bg-slate-800/80 px-5 py-3.5 border-b border-slate-700/60 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-lg">{aisleInfo.icon}</span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-100 tracking-tight">
                        {aisleInfo.name}
                      </h3>
                      <span className="text-[10px] text-slate-400">
                        {categoryChecked}/{items.length} collected • Subtotal: <strong className="text-slate-200">{formatCurrency(categoryCost)}</strong>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setQuickAddAisleCategory(isQuickAddOpen ? null : category)}
                      className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 text-[11px] font-semibold flex items-center gap-1 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{isQuickAddOpen ? 'Close Add' : '+ Add Item to Aisle'}</span>
                    </button>
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-900 text-slate-300 rounded-lg border border-slate-700">
                      Aisle #{aisleInfo.number}
                    </span>
                  </div>
                </div>

                {/* Quick Add Form directly inside Aisle */}
                {isQuickAddOpen && (
                  <div className="p-4 bg-slate-800/40 border-b border-slate-700/50 space-y-3">
                    <div className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                      <Plus className="w-4 h-4" />
                      <span>Add new grocery item to {aisleInfo.name}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                      <div className="sm:col-span-2">
                        <input
                          type="text"
                          placeholder="Item name (e.g. Extra Brioche Buns)"
                          value={quickAddItemName}
                          onChange={(e) => setQuickAddItemName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          step="0.5"
                          placeholder="Est. Cost ($)"
                          value={quickAddItemCost}
                          onChange={(e) => setQuickAddItemCost(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <input
                          type="text"
                          placeholder="Quantity (e.g. 2 packs)"
                          value={quickAddItemQuantity}
                          onChange={(e) => setQuickAddItemQuantity(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickAddAisleCategory(null)}
                        className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200 text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleQuickAddInsideAisle(category)}
                        disabled={!quickAddItemName.trim()}
                        className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold shadow-sm"
                      >
                        Add to List & Recalculate Total
                      </button>
                    </div>
                  </div>
                )}

                {/* Items in Aisle */}
                <div className="divide-y divide-slate-800/60">
                  {items.map((item) => {
                    const isEditing = editingItemId === item.id;

                    if (isEditing) {
                      return (
                        <div key={item.id} className="p-4 bg-slate-800/40 space-y-3 text-xs">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                              <label className="block text-slate-400 text-[11px] mb-1">Item Name</label>
                              <input
                                type="text"
                                value={editFormData.name || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 text-[11px] mb-1">Estimated Cost ($)</label>
                              <input
                                type="number"
                                step="0.5"
                                value={editFormData.estimatedCost || 0}
                                onChange={(e) => setEditFormData({ ...editFormData, estimatedCost: parseFloat(e.target.value) || 0 })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div>
                              <label className="block text-slate-400 text-[11px] mb-1">Quantity / Unit Size</label>
                              <input
                                type="text"
                                value={editFormData.quantity || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                            <div>
                              <label className="block text-slate-400 text-[11px] mb-1">Notes / Brand instructions</label>
                              <input
                                type="text"
                                value={editFormData.notes || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-slate-100 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => setEditingItemId(null)}
                              className="px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-slate-200"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={saveEdit}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-semibold"
                            >
                              Save Changes & Recalculate
                            </button>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={item.id}
                        className={`p-4 transition-colors flex items-start justify-between gap-3 text-xs ${
                          item.checked ? 'bg-slate-950/40 opacity-60' : 'hover:bg-slate-800/30'
                        }`}
                      >
                        {/* Checkbox & Details */}
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <button
                            type="button"
                            onClick={() => toggleItem(item.id)}
                            className="mt-0.5 text-slate-400 hover:text-blue-400 focus:outline-none transition-colors"
                            title={item.checked ? 'Mark as needed' : 'Mark as collected'}
                          >
                            {item.checked ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Circle className="w-5 h-5 text-slate-500" />
                            )}
                          </button>

                          <div className="space-y-1 min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span
                                className={`font-bold text-xs ${
                                  item.checked ? 'line-through text-slate-400' : 'text-slate-100'
                                }`}
                              >
                                {item.name}
                              </span>

                              {/* Interactive Quick Quantity Stepper */}
                              <div className="inline-flex items-center bg-slate-800/90 border border-slate-700/80 rounded-lg p-0.5 shadow-sm">
                                <button
                                  type="button"
                                  onClick={() => handleStepQuantity(item.id, 'dec')}
                                  className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors active:scale-95"
                                  title="Decrease quantity (recalculates budget)"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="px-2 text-[11px] font-bold text-slate-200 whitespace-nowrap">
                                  {item.quantity}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleStepQuantity(item.id, 'inc')}
                                  className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded transition-colors active:scale-95"
                                  title="Increase quantity (recalculates budget)"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>

                              {/* Cymbal Brand Badge & Toggle */}
                              {item.isCymbalBrand ? (
                                <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-full">
                                  Cymbal Brand
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => toggleItemBrand(item.id)}
                                  className="text-[10px] font-medium text-slate-400 hover:text-emerald-300 underline"
                                  title="Switch to Cymbal Brand to save and recalculate budget"
                                >
                                  Switch to Cymbal Brand (-$
                                  {item.cymbalBrandSavings || Math.round(item.estimatedCost * 0.22)})
                                </button>
                              )}

                              {/* Must Have vs Optional */}
                              {item.isMustHave ? (
                                <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                                  Must-Have
                                </span>
                              ) : (
                                <span className="text-[10px] font-medium text-slate-500">
                                  Optional
                                </span>
                              )}
                            </div>

                            {/* Portions explanation or note */}
                            {(item.unitPortionExplanation || item.notes) && (
                              <div className="text-[11px] text-slate-400 leading-tight">
                                {item.unitPortionExplanation && (
                                  <span className="text-slate-400">
                                    💡 {item.unitPortionExplanation}
                                  </span>
                                )}
                                {item.notes && (
                                  <span className="text-slate-400 ml-2 italic">
                                    ({item.notes})
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Dietary Tags */}
                            {item.dietaryTags && item.dietaryTags.length > 0 && (
                              <div className="flex gap-1.5 flex-wrap pt-0.5">
                                {item.dietaryTags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[9px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Price & Actions */}
                        <div className="flex items-center gap-3 self-center">
                          <button
                            type="button"
                            onClick={() => startEdit(item)}
                            className="group flex items-center gap-1 font-bold text-xs text-slate-100 hover:text-blue-300 whitespace-nowrap"
                            title="Click to edit item price or details"
                          >
                            <span>~{formatCurrency(item.estimatedCost)}</span>
                            <Edit2 className="w-3 h-3 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>

                          <div className="flex items-center gap-1 text-slate-400">
                            <button
                              type="button"
                              onClick={() => startEdit(item)}
                              title="Edit item details"
                              className="p-1 hover:text-slate-100 hover:bg-slate-800 rounded transition-colors"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteItem(item.id)}
                              title="Remove item (recalculates budget)"
                              className="p-1 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
