import React, { useState } from 'react';
import { PartyPlan, ShoppingItem } from '../types';
import { formatCurrency, getBudgetAlignment } from '../utils';
import {
  CheckCircle2,
  Truck,
  Store,
  Calendar,
  Clock,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Tag,
  ArrowRight,
  RefreshCw,
  Award,
  AlertCircle,
  FileText,
  Printer,
  Share2,
  ChevronRight,
  DollarSign,
  Plus,
  Minus,
  Sliders,
} from 'lucide-react';

interface RefineAndCheckoutTabProps {
  plan: PartyPlan;
  onUpdatePlan: (plan: PartyPlan) => void;
  onOpenExportModal: () => void;
  onOpenBudgetOptimizer: () => void;
}

export const RefineAndCheckoutTab: React.FC<RefineAndCheckoutTabProps> = ({
  plan,
  onUpdatePlan,
  onOpenExportModal,
  onOpenBudgetOptimizer,
}) => {
  const [fulfillmentMethod, setFulfillmentMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [selectedStore, setSelectedStore] = useState('CymbalMart Supercenter #1420 (Metro Blvd)');
  const [deliveryAddress, setDeliveryAddress] = useState('1448 Evergreen Terrace, Springfield');
  const [timeSlot, setTimeSlot] = useState('Saturday, 11:00 AM - 12:00 PM (Before Party)');
  const [partyPackAddon, setPartyPackAddon] = useState(true);
  const [iceBundleAddon, setIceBundleAddon] = useState(true);
  const [promoCode, setPromoCode] = useState('CYMBALHOST10');
  const [promoApplied, setPromoApplied] = useState(true);
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [orderConfirmation, setOrderConfirmation] = useState<any>(null);

  // Constraint Adjustment State
  const [activeDietaryFilter, setActiveDietaryFilter] = useState<string | null>(null);
  const [portionScale, setPortionScale] = useState<number>(1.0);

  const budgetStats = getBudgetAlignment(plan);
  const uncheckedItems = plan.shoppingList.filter((i) => !i.checked);

  // Cart calculations
  const itemsSubtotal = uncheckedItems.reduce((sum, item) => sum + (item.estimatedCost * portionScale), 0);
  const partyPackCost = partyPackAddon ? 12.50 : 0;
  const iceBundleCost = iceBundleAddon ? 8.99 : 0;
  const promoDiscount = promoApplied ? 10.00 : 0;
  const estimatedTax = (itemsSubtotal + partyPackCost + iceBundleCost - promoDiscount) * 0.075;
  const fulfillmentFee = fulfillmentMethod === 'delivery' ? 4.99 : 0;
  const finalTotal = Math.max(0, itemsSubtotal + partyPackCost + iceBundleCost - promoDiscount + estimatedTax + fulfillmentFee);
  const rewardsPointsEarned = Math.round(finalTotal * 2);

  // Constraint adjuster: Scale portions
  const handleApplyPortionScale = (multiplier: number) => {
    setPortionScale(multiplier);
  };

  // Constraint adjuster: Auto-substitute for dietary
  const handleSubstituteDietary = (restriction: string) => {
    const updatedList = plan.shoppingList.map((item) => {
      if (restriction === 'Gluten-Free') {
        if (item.name.toLowerCase().includes('bun') || item.name.toLowerCase().includes('bread')) {
          return {
            ...item,
            name: `Gluten-Free Certified ${item.name}`,
            notes: 'Substituted for Gluten-Free guests',
            dietaryTags: [...(item.dietaryTags || []), 'Gluten-Free'],
          };
        }
      }
      if (restriction === 'Vegetarian') {
        if (item.category === 'Meat & Seafood' && !item.name.toLowerCase().includes('portobello') && !item.name.toLowerCase().includes('plant')) {
          return {
            ...item,
            name: `Plant-Based Cymbal Butcher Alternative for ${item.name}`,
            notes: 'Substituted for Vegetarian guests',
            dietaryTags: [...(item.dietaryTags || []), 'Vegetarian'],
          };
        }
      }
      if (restriction === 'Dairy-Free') {
        if (item.category === 'Dairy & Refrigerated' && !item.name.toLowerCase().includes('oat') && !item.name.toLowerCase().includes('plant')) {
          return {
            ...item,
            name: `Dairy-Free Plant Cheese / Spread (${item.name})`,
            notes: 'Substituted for Dairy-Free guests',
            dietaryTags: [...(item.dietaryTags || []), 'Dairy-Free'],
          };
        }
      }
      return item;
    });

    onUpdatePlan({
      ...plan,
      shoppingList: updatedList,
      dietaryRequirements: Array.from(new Set([...plan.dietaryRequirements, restriction])),
    });
  };

  // 1-Click Place Order
  const handlePlaceOrder = () => {
    const orderNum = `CYM-${Math.floor(100000 + Math.random() * 900000)}`;
    const confirmation = {
      orderNumber: orderNum,
      placedAt: new Date().toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' }),
      itemCount: uncheckedItems.length + (partyPackAddon ? 1 : 0) + (iceBundleAddon ? 1 : 0),
      totalPaid: finalTotal,
      savingsTotal: budgetStats.potentialCymbalSavings + promoDiscount,
      rewardPoints: rewardsPointsEarned,
      method: fulfillmentMethod,
      store: selectedStore,
      timeSlot,
      address: fulfillmentMethod === 'delivery' ? deliveryAddress : undefined,
    };

    setOrderConfirmation(confirmation);
    setIsOrderPlaced(true);

    onUpdatePlan({
      ...plan,
      fulfillment: {
        method: fulfillmentMethod,
        storeName: selectedStore,
        timeSlot,
        address: fulfillmentMethod === 'delivery' ? deliveryAddress : undefined,
        orderNumber: orderNum,
        rewardPointsEarned: rewardsPointsEarned,
        isCompleted: true,
      },
    });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* CUJ Step 3 Banner */}
      <div className="bg-gradient-to-r from-emerald-950/60 via-slate-900 to-blue-950/40 border border-emerald-500/30 rounded-3xl p-6 sm:p-7 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold uppercase tracking-wider">
                Task 3: Refine Constraints & Checkout
              </span>
              <span className="text-xs text-slate-400">CymbalMart Fulfillment Express</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-100 tracking-tight">
              Fine-tune constraints & finalize your CymbalMart cart
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Adjust dietary substitutes, tune appetite portion scalers, select Curbside Store Pickup or Home Delivery, and finalize your order with Cymbal Rewards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenExportModal}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print Aisle Checklist</span>
            </button>
          </div>
        </div>
      </div>

      {/* Order Confirmation Screen if completed */}
      {isOrderPlaced && orderConfirmation && (
        <div className="bg-emerald-950/40 border-2 border-emerald-500 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                  Order Successfully Dispatched to CymbalMart
                </span>
                <h3 className="text-2xl font-black text-white">
                  Order #{orderConfirmation.orderNumber}
                </h3>
                <p className="text-xs text-slate-300">
                  Ready for {orderConfirmation.method === 'pickup' ? 'Curbside Pickup' : 'Express Delivery'} at {orderConfirmation.timeSlot}
                </p>
              </div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-right">
              <div className="text-xs text-slate-400">Total Charged</div>
              <div className="text-2xl font-black text-emerald-400">
                {formatCurrency(orderConfirmation.totalPaid)}
              </div>
              <div className="text-[11px] text-amber-400 font-semibold flex items-center justify-end gap-1 mt-1">
                <Award className="w-3.5 h-3.5" />
                <span>+ {orderConfirmation.rewardPoints} Cymbal Points</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-blue-400" />
                <span>Fulfillment Location</span>
              </div>
              <div className="font-bold text-xs text-slate-200">
                {orderConfirmation.method === 'pickup' ? orderConfirmation.store : orderConfirmation.address}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Scheduled Time Window</span>
              </div>
              <div className="font-bold text-xs text-slate-200">
                {orderConfirmation.timeSlot}
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4">
              <div className="text-xs text-slate-400 mb-1 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Items Prepared</span>
              </div>
              <div className="font-bold text-xs text-slate-200">
                {orderConfirmation.itemCount} Groceries & Party Supplies
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => window.print()}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              <span>Print Order Receipt</span>
            </button>
            <button
              onClick={onOpenExportModal}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              <span>Share Host Run-of-Show</span>
            </button>
          </div>
        </div>
      )}

      {/* 1. Constraint Adjuster Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg space-y-6">
        <div className="border-b border-slate-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-400" />
              <span>Host Constraint Adjustments</span>
            </h3>
            <p className="text-xs text-slate-400">
              Dynamically calibrate dietary substitutes, appetite scalers, and budget swaps without starting over.
            </p>
          </div>
          <button
            onClick={onOpenBudgetOptimizer}
            className="px-3 py-1.5 bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 hover:bg-emerald-900/60 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>AI Budget Buster Swaps</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quick Dietary Substitutions */}
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-4 space-y-3 text-xs">
            <label className="block text-slate-200 font-bold">
              Instant Dietary Auto-Substitutions
            </label>
            <p className="text-[11px] text-slate-400 leading-tight">
              One-click ingredient swaps for guests with sudden restriction requirements:
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {[
                { label: 'Add Gluten-Free Buns/Flour', restriction: 'Gluten-Free' },
                { label: 'Add Plant-Based Meat Cuts', restriction: 'Vegetarian' },
                { label: 'Add Dairy-Free Cheeses/Dips', restriction: 'Dairy-Free' },
              ].map((sub, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSubstituteDietary(sub.restriction)}
                  className="px-3 py-2 bg-slate-800 hover:bg-blue-600/20 text-slate-200 hover:text-blue-300 border border-slate-700 hover:border-blue-500 rounded-xl font-medium transition-all text-left flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3 h-3 text-blue-400" />
                  <span>{sub.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Appetite & Portion Multiplier */}
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-4 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <label className="block text-slate-200 font-bold">
                Guest Appetite & Portion Scale
              </label>
              <span className="text-blue-400 font-bold bg-blue-950/80 px-2 py-0.5 rounded-md border border-blue-800">
                {portionScale === 1.0 ? '1.0x (Standard Rations)' : `${portionScale}x Multiplier`}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-tight">
              Scale all grocery quantities up or down based on crowd eating habits:
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[
                { label: '0.85x Light Bites', mult: 0.85, desc: 'Cocktail & Grazing' },
                { label: '1.0x Balanced', mult: 1.0, desc: 'Standard Portions' },
                { label: '1.25x Big Eaters', mult: 1.25, desc: 'BBQ / Heavy Crowd' },
              ].map((scaleOption, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleApplyPortionScale(scaleOption.mult)}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    portionScale === scaleOption.mult
                      ? 'bg-blue-600/20 border-blue-500 text-blue-200 font-bold'
                      : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  <div className="text-xs text-slate-100">{scaleOption.label}</div>
                  <div className="text-[10px] text-slate-400 truncate">{scaleOption.desc}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 2. CymbalMart Checkout & Fulfillment Center */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Store, Fulfillment & Addons */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg space-y-6">
            <div className="border-b border-slate-800 pb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Store className="w-4 h-4 text-blue-400" />
                <span>CymbalMart Fulfillment Options</span>
              </h3>
              <p className="text-xs text-slate-400">
                Choose how you would like to receive your party supplies and groceries.
              </p>
            </div>

            {/* Pickup vs Delivery Toggle */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setFulfillmentMethod('pickup')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  fulfillmentMethod === 'pickup'
                    ? 'bg-blue-600/15 border-blue-500 text-blue-200 shadow-md shadow-blue-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${fulfillmentMethod === 'pickup' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  <Store className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-100">Curbside Store Pickup</div>
                  <div className="text-xs text-emerald-400 font-semibold">FREE on all party orders</div>
                  <div className="text-[11px] text-slate-400 mt-1">Ready in dedicated party parking bay</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFulfillmentMethod('delivery')}
                className={`p-4 rounded-2xl border text-left transition-all flex items-start gap-3.5 ${
                  fulfillmentMethod === 'delivery'
                    ? 'bg-blue-600/15 border-blue-500 text-blue-200 shadow-md shadow-blue-500/10'
                    : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:border-slate-600'
                }`}
              >
                <div className={`p-2.5 rounded-xl ${fulfillmentMethod === 'delivery' ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-100">1-Hour Express Delivery</div>
                  <div className="text-xs text-blue-400 font-semibold">$4.99 or Free with Cymbal+</div>
                  <div className="text-[11px] text-slate-400 mt-1">Delivered direct to party venue</div>
                </div>
              </button>
            </div>

            {/* Store or Address selection */}
            <div className="space-y-4 text-xs">
              {fulfillmentMethod === 'pickup' ? (
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Select CymbalMart Pickup Location
                  </label>
                  <select
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="CymbalMart Supercenter #1420 (Metro Blvd)">CymbalMart Supercenter #1420 (Metro Blvd - Full Spirits & Fresh Bakery)</option>
                    <option value="CymbalMart Supercenter #1804 (West Valley)">CymbalMart Supercenter #1804 (West Valley - Party Pavilion)</option>
                    <option value="CymbalMart Express #302 (Downtown)">CymbalMart Express #302 (Downtown Plaza)</option>
                  </select>
                </div>
              ) : (
                <div>
                  <label className="block text-slate-300 font-medium mb-1.5">
                    Party Venue Delivery Address
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    placeholder="Enter street address, city, zip code"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-medium mb-1.5">
                  Requested Time Slot (Coordinate with Host Prep Timeline)
                </label>
                <select
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2.5 text-slate-100 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="Friday, 4:00 PM - 5:00 PM (1 Day Before Prep)">Friday, 4:00 PM - 5:00 PM (1 Day Before Prep)</option>
                  <option value="Saturday, 9:00 AM - 10:00 AM (Early Morning)">Saturday, 9:00 AM - 10:00 AM (Early Morning)</option>
                  <option value="Saturday, 11:00 AM - 12:00 PM (Before Party)">Saturday, 11:00 AM - 12:00 PM (2 Hours Before Party)</option>
                  <option value="Saturday, 2:00 PM - 3:00 PM (Afternoon)">Saturday, 2:00 PM - 3:00 PM (Afternoon)</option>
                  <option value="Sunday, 10:00 AM - 11:00 AM (Brunch Slot)">Sunday, 10:00 AM - 11:00 AM (Brunch Slot)</option>
                </select>
              </div>
            </div>

            {/* Host Party Essentials Bundles */}
            <div className="border-t border-slate-800 pt-5 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Recommended Host Essentials Bundles:</span>
              </h4>

              <div className="space-y-2 text-xs">
                <label className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700 rounded-2xl cursor-pointer hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={partyPackAddon}
                      onChange={(e) => setPartyPackAddon(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-slate-100">Cymbal Eco Party Tableware Bundle (50ct)</div>
                      <div className="text-[11px] text-slate-400">Sugarcane plates, birchwood forks, heavy napkins & cups</div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-200">+$12.50</span>
                </label>

                <label className="flex items-center justify-between p-3 bg-slate-800/60 border border-slate-700 rounded-2xl cursor-pointer hover:border-slate-600 transition-colors">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={iceBundleAddon}
                      onChange={(e) => setIceBundleAddon(e.target.checked)}
                      className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500"
                    />
                    <div>
                      <div className="font-bold text-slate-100">3x 10lb Cold Party Ice Bags with Insulated Cooler Bag</div>
                      <div className="text-[11px] text-slate-400">Kept frozen until trunk drop-off or doorstep delivery</div>
                    </div>
                  </div>
                  <span className="font-bold text-slate-200">+$8.99</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Order Summary & Checkout Action */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-5 sticky top-24">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-slate-100 flex items-center justify-between">
                <span>Final Order Summary</span>
                <span className="text-xs font-normal text-slate-400">{uncheckedItems.length} items</span>
              </h3>
            </div>

            {/* Cost Lines */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Groceries Subtotal ({portionScale}x scale)</span>
                <span className="font-semibold text-slate-100">{formatCurrency(itemsSubtotal)}</span>
              </div>

              {partyPackAddon && (
                <div className="flex justify-between text-slate-300">
                  <span>Eco Tableware Bundle</span>
                  <span className="font-semibold text-slate-100">{formatCurrency(partyPackCost)}</span>
                </div>
              )}

              {iceBundleAddon && (
                <div className="flex justify-between text-slate-300">
                  <span>Party Ice & Cooler Pack</span>
                  <span className="font-semibold text-slate-100">{formatCurrency(iceBundleCost)}</span>
                </div>
              )}

              {promoApplied && (
                <div className="flex justify-between text-emerald-400 font-semibold">
                  <span>Host Coupon (CYMBALHOST10)</span>
                  <span>-{formatCurrency(promoDiscount)}</span>
                </div>
              )}

              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Fulfillment ({fulfillmentMethod === 'pickup' ? 'Curbside' : 'Delivery'})</span>
                <span className="text-emerald-400 font-semibold">
                  {fulfillmentFee === 0 ? 'FREE' : formatCurrency(fulfillmentFee)}
                </span>
              </div>

              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>Estimated Sales Tax (7.5%)</span>
                <span>{formatCurrency(estimatedTax)}</span>
              </div>

              {/* Total Divider */}
              <div className="border-t border-slate-800 pt-3 flex justify-between items-baseline">
                <div>
                  <div className="text-sm font-bold text-slate-100">Final Total</div>
                  <div className="text-[11px] text-slate-400">
                    Target Budget: {formatCurrency(plan.targetBudget)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-emerald-400">
                    {formatCurrency(finalTotal)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    ~{formatCurrency(finalTotal / (plan.guestCount.adults + plan.guestCount.kids || 1))} / guest
                  </div>
                </div>
              </div>
            </div>

            {/* Promo Code box */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-3 flex items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-400" />
                <span className="font-bold text-slate-200">CYMBALHOST10</span>
              </div>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md font-semibold">
                $10 Savings Active
              </span>
            </div>

            {/* Cymbal Rewards Card */}
            <div className="bg-gradient-to-r from-blue-950/60 to-indigo-950/60 border border-blue-800/40 rounded-2xl p-3.5 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2.5">
                <Award className="w-5 h-5 text-amber-400" />
                <div>
                  <div className="font-bold text-slate-100">Cymbal Rewards</div>
                  <div className="text-[10px] text-slate-400">2x points on party catering</div>
                </div>
              </div>
              <span className="font-black text-amber-400 text-sm">+{rewardsPointsEarned} pts</span>
            </div>

            {/* Place Order Button */}
            <button
              id="place-cymbal-order-btn"
              type="button"
              onClick={handlePlaceOrder}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 text-sm transition-all active:scale-95"
            >
              <ShoppingBag className="w-5 h-5" />
              <span>Finalize & Place CymbalMart Order</span>
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              🔒 Backed by CymbalMart 100% Freshness & Portion Guarantee
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
