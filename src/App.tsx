/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { PartyPlan, ShoppingItem, StoreCategory } from './types';
import { DEFAULT_PLANS } from './data/defaultPlans';
import { Navbar } from './components/Navbar';
import { DefineEventTab } from './components/DefineEventTab';
import { ShoppingListTab } from './components/ShoppingListTab';
import { RefineAndCheckoutTab } from './components/RefineAndCheckoutTab';
import { PartyOverviewCard } from './components/PartyOverviewCard';
import { MenuAndBeveragesTab } from './components/MenuAndBeveragesTab';
import { PrepTimelineTab } from './components/PrepTimelineTab';
import { PartyCreatorModal } from './components/PartyCreatorModal';
import { AddCustomItemModal } from './components/AddCustomItemModal';
import { BudgetOptimizerModal } from './components/BudgetOptimizerModal';
import { PrintAndExportModal } from './components/PrintAndExportModal';
import { CymbalMartAssistant } from './components/CymbalMartAssistant';
import { VoiceControlHub } from './components/VoiceControlHub';
import { VoiceHelpModal } from './components/VoiceHelpModal';
import { KitchenHandsFreeModal } from './components/KitchenHandsFreeModal';
import { useVoiceControl, VoiceCommandAction } from './hooks/useVoiceControl';
import {
  Sparkles,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  X,
  Store,
  Bot,
  MessageSquare,
  Mic,
} from 'lucide-react';
import confetti from 'canvas-confetti';

const STORAGE_KEY = 'cymbal_party_planner_plans_v2';
const ACTIVE_PLAN_KEY = 'cymbal_party_planner_active_id_v2';

export default function App() {
  const [plans, setPlans] = useState<PartyPlan[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Failed to load plans from storage:', e);
    }
    return DEFAULT_PLANS;
  });

  const [activePlanId, setActivePlanId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(ACTIVE_PLAN_KEY);
      if (saved) return saved;
    } catch (e) {}
    return DEFAULT_PLANS[0]?.id || '';
  });

  const [activeTab, setActiveTab] = useState<'define' | 'review' | 'refine_checkout' | 'menu' | 'timeline' | 'overview'>('review');

  // Modals & Drawers state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isVoiceHelpOpen, setIsVoiceHelpOpen] = useState(false);
  const [isKitchenModeOpen, setIsKitchenModeOpen] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
      if (activePlanId) {
        localStorage.setItem(ACTIVE_PLAN_KEY, activePlanId);
      }
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }, [plans, activePlanId]);

  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0] || null;

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  }, []);

  // Update existing active plan
  const handleUpdatePlan = useCallback((updatedPlan: PartyPlan) => {
    setPlans((prev) => prev.map((p) => (p.id === updatedPlan.id ? updatedPlan : p)));
  }, []);

  // Create or Regenerate party with AI backend
  const handleCreateOrUpdatePlan = async (formData: any) => {
    try {
      setIsCreatingPlan(true);
      const res = await fetch('/api/plan-party', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!data.success || !data.plan) {
        throw new Error(data.error || 'Failed to generate party plan');
      }

      const newPlan: PartyPlan = data.plan;
      setPlans((prev) => [newPlan, ...prev.filter((p) => p.id !== newPlan.id)]);
      setActivePlanId(newPlan.id);
      setIsCreateModalOpen(false);
      setActiveTab('review');
      showToast(`🎉 "${newPlan.title}" generated with CymbalMart aisles & budget alignment!`);
    } catch (err: any) {
      console.error('Create plan error:', err);
      showToast(err.message || 'Error generating plan with AI', 'error');
    } finally {
      setIsCreatingPlan(false);
    }
  };

  // Add custom shopping item
  const handleAddCustomItem = useCallback((itemData: Omit<ShoppingItem, 'id' | 'checked'>) => {
    if (!activePlan) return;
    const newItem: ShoppingItem = {
      ...itemData,
      id: `custom-item-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
      checked: false,
    };
    const updatedShoppingList = [newItem, ...activePlan.shoppingList];
    const newTotal = updatedShoppingList.reduce((sum, i) => sum + i.estimatedCost, 0);

    const updatedPlan: PartyPlan = {
      ...activePlan,
      shoppingList: updatedShoppingList,
      estimatedTotalCost: Math.round(newTotal * 100) / 100,
    };

    handleUpdatePlan(updatedPlan);
    showToast(`Added "${newItem.name}" to CymbalMart shopping list!`);
  }, [activePlan, handleUpdatePlan, showToast]);

  // Voice Command Action Dispatcher
  const handleVoiceAction = useCallback((action: VoiceCommandAction) => {
    if (!action || !action.type) return;

    switch (action.type) {
      case 'NAVIGATE_TAB': {
        const tab = action.payload?.tab;
        if (tab && ['define', 'review', 'refine_checkout', 'menu', 'timeline', 'overview'].includes(tab)) {
          setActiveTab(tab);
        }
        break;
      }

      case 'CREATE_OR_UPDATE_PLAN': {
        if (action.payload) {
          handleCreateOrUpdatePlan(action.payload);
        }
        break;
      }

      case 'SET_TARGET_BUDGET': {
        if (!activePlan) break;
        const newTarget = Number(action.payload?.targetBudget);
        if (newTarget && newTarget > 0) {
          handleUpdatePlan({
            ...activePlan,
            targetBudget: newTarget,
          });
        }
        break;
      }

      case 'SET_GUEST_COUNT': {
        if (!activePlan) break;
        const adults = Number(action.payload?.adults) || activePlan.guestCount.adults;
        const kids = Number(action.payload?.kids) ?? activePlan.guestCount.kids;
        const drinkers = Math.min(adults, activePlan.guestCount.drinkers || Math.round(adults * 0.8));
        handleUpdatePlan({
          ...activePlan,
          guestCount: {
            adults,
            kids,
            drinkers,
            nonDrinkers: adults - drinkers,
          },
        });
        break;
      }

      case 'ADD_SHOPPING_ITEM': {
        if (!activePlan || !action.payload?.name) break;
        const p = action.payload;
        handleAddCustomItem({
          name: p.name,
          quantity: p.quantity || '1 pack',
          category: (p.category as StoreCategory) || 'Produce',
          aisleNumber: Number(p.aisleNumber) || 1,
          aisleName: p.aisleName || `Aisle ${p.aisleNumber || 1}`,
          estimatedCost: Number(p.estimatedCost) || 5,
          isMustHave: p.isMustHave !== false,
          isCymbalBrand: Boolean(p.isCymbalBrand),
          recommendedStore: 'CymbalMart Supercenter',
          notes: p.notes ? `${p.notes} (via Voice Control)` : 'Added via Hands-Free Voice Control',
        });
        break;
      }

      case 'REMOVE_SHOPPING_ITEM': {
        if (!activePlan || !action.payload?.itemNameOrId) break;
        const target = String(action.payload.itemNameOrId).toLowerCase();
        const updatedList = activePlan.shoppingList.filter(
          (item) => item.id !== target && !item.name.toLowerCase().includes(target)
        );
        const newTotal = updatedList.reduce((sum, i) => sum + i.estimatedCost, 0);
        handleUpdatePlan({
          ...activePlan,
          shoppingList: updatedList,
          estimatedTotalCost: Math.round(newTotal * 100) / 100,
        });
        break;
      }

      case 'TOGGLE_ITEM_CHECK': {
        if (!activePlan || !action.payload?.itemNameOrId) break;
        const target = String(action.payload.itemNameOrId).toLowerCase();
        const forcedCheck = action.payload.checked;

        const updatedList = activePlan.shoppingList.map((item) => {
          if (item.id === target || item.name.toLowerCase().includes(target)) {
            return {
              ...item,
              checked: forcedCheck !== undefined ? forcedCheck : !item.checked,
            };
          }
          return item;
        });

        handleUpdatePlan({
          ...activePlan,
          shoppingList: updatedList,
        });
        break;
      }

      case 'STEP_ITEM_QUANTITY': {
        if (!activePlan || !action.payload?.itemNameOrId) break;
        const target = String(action.payload.itemNameOrId).toLowerCase();
        const direction = action.payload.direction === 'dec' ? 'dec' : 'inc';

        const updatedList = activePlan.shoppingList.map((item) => {
          if (item.id === target || item.name.toLowerCase().includes(target)) {
            const currentCost = item.estimatedCost || 5;
            const unitPrice = currentCost; // estimate unit base
            const newCost =
              direction === 'inc'
                ? Math.round((currentCost * 1.5) * 100) / 100
                : Math.max(1.5, Math.round((currentCost * 0.67) * 100) / 100);

            return {
              ...item,
              estimatedCost: newCost,
              quantity: direction === 'inc' ? `+More (${item.quantity})` : `Less (${item.quantity})`,
            };
          }
          return item;
        });

        const newTotal = updatedList.reduce((sum, i) => sum + i.estimatedCost, 0);
        handleUpdatePlan({
          ...activePlan,
          shoppingList: updatedList,
          estimatedTotalCost: Math.round(newTotal * 100) / 100,
        });
        break;
      }

      case 'SWITCH_ALL_CYMBAL_BRAND': {
        if (!activePlan) break;
        let totalSaved = 0;
        const updatedList = activePlan.shoppingList.map((item) => {
          if (!item.isCymbalBrand) {
            const savings = item.cymbalBrandSavings || Math.round(item.estimatedCost * 0.22 * 100) / 100;
            const newCost = Math.max(1, Math.round((item.estimatedCost - savings) * 100) / 100);
            totalSaved += savings;
            return {
              ...item,
              name: item.name.startsWith('Cymbal') ? item.name : `Cymbal Great Value ${item.name}`,
              isCymbalBrand: true,
              nationalBrandCost: item.estimatedCost,
              estimatedCost: newCost,
              cymbalBrandSavings: savings,
            };
          }
          return item;
        });

        const newTotal = updatedList.reduce((sum, i) => sum + i.estimatedCost, 0);
        handleUpdatePlan({
          ...activePlan,
          shoppingList: updatedList,
          estimatedTotalCost: Math.round(newTotal * 100) / 100,
        });

        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
        break;
      }

      case 'SCALE_ALL_ITEMS': {
        if (!activePlan) break;
        const mult = Number(action.payload?.multiplier) || 0.9;
        const updatedList = activePlan.shoppingList.map((item) => ({
          ...item,
          estimatedCost: Math.max(0.5, Math.round(item.estimatedCost * mult * 100) / 100),
        }));
        const newTotal = updatedList.reduce((sum, i) => sum + i.estimatedCost, 0);
        handleUpdatePlan({
          ...activePlan,
          shoppingList: updatedList,
          estimatedTotalCost: Math.round(newTotal * 100) / 100,
        });
        break;
      }

      case 'CHECK_ALL_ITEMS': {
        if (!activePlan) break;
        const checkedVal = action.payload?.checked !== false;
        const updatedList = activePlan.shoppingList.map((i) => ({ ...i, checked: checkedVal }));
        handleUpdatePlan({
          ...activePlan,
          shoppingList: updatedList,
        });
        if (checkedVal) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        }
        break;
      }

      case 'SELECT_FULFILLMENT': {
        if (!activePlan) break;
        const p = action.payload;
        handleUpdatePlan({
          ...activePlan,
          fulfillment: {
            method: p?.method === 'delivery' ? 'delivery' : 'pickup',
            storeName: p?.storeName || 'CymbalMart Supercenter #1420',
            timeSlot: p?.timeSlot || 'Saturday, 11:00 AM - 12:00 PM',
            address: p?.address || '1448 Evergreen Terrace',
            rewardPointsEarned: Math.round(activePlan.estimatedTotalCost * 2),
            isCompleted: false,
          },
        });
        setActiveTab('refine_checkout');
        break;
      }

      case 'COMPLETE_CHECKOUT': {
        if (!activePlan) break;
        const orderNum = `CYM-${Math.floor(100000 + Math.random() * 900000)}`;
        handleUpdatePlan({
          ...activePlan,
          fulfillment: {
            method: activePlan.fulfillment?.method || 'pickup',
            storeName: activePlan.fulfillment?.storeName || 'CymbalMart Supercenter #1420',
            timeSlot: activePlan.fulfillment?.timeSlot || 'Saturday, 11:00 AM - 12:00 PM',
            address: activePlan.fulfillment?.address,
            orderNumber: orderNum,
            rewardPointsEarned: Math.round(activePlan.estimatedTotalCost * 2),
            isCompleted: true,
          },
        });
        setActiveTab('refine_checkout');
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 },
        });
        break;
      }

      case 'OPEN_MODAL': {
        const modal = action.payload?.modal;
        if (modal === 'create_party') setIsCreateModalOpen(true);
        else if (modal === 'add_custom_item') setIsAddItemModalOpen(true);
        else if (modal === 'budget_optimizer') setIsBudgetModalOpen(true);
        else if (modal === 'print_export') setIsExportModalOpen(true);
        else if (modal === 'chat_assistant') setIsChatOpen(true);
        else if (modal === 'voice_help') setIsVoiceHelpOpen(true);
        else if (modal === 'kitchen_mode') setIsKitchenModeOpen(true);
        else if (modal === 'close_all') {
          setIsCreateModalOpen(false);
          setIsAddItemModalOpen(false);
          setIsBudgetModalOpen(false);
          setIsExportModalOpen(false);
          setIsChatOpen(false);
          setIsVoiceHelpOpen(false);
          setIsKitchenModeOpen(false);
        }
        break;
      }

      case 'APPLY_DIETARY_SUB': {
        if (!activePlan || !action.payload?.restriction) break;
        const restriction = action.payload.restriction;
        const updatedList = activePlan.shoppingList.map((item) => {
          if (restriction === 'Gluten-Free') {
            if (item.name.toLowerCase().includes('bun') || item.name.toLowerCase().includes('bread')) {
              return {
                ...item,
                name: `Gluten-Free ${item.name}`,
                dietaryTags: [...(item.dietaryTags || []), 'Gluten-Free'],
              };
            }
          }
          if (restriction === 'Vegetarian') {
            if (item.category === 'Meat & Seafood' && !item.name.toLowerCase().includes('plant')) {
              return {
                ...item,
                name: `Plant-Based Cymbal Alternative for ${item.name}`,
                dietaryTags: [...(item.dietaryTags || []), 'Vegetarian'],
              };
            }
          }
          return item;
        });

        handleUpdatePlan({
          ...activePlan,
          shoppingList: updatedList,
          dietaryRequirements: Array.from(new Set([...activePlan.dietaryRequirements, restriction])),
        });
        break;
      }

      case 'ADD_RECIPE_INGREDIENTS': {
        if (!activePlan || !Array.isArray(action.payload?.ingredients)) break;
        action.payload.ingredients.forEach((ing: any) => {
          handleAddCustomItem({
            name: ing.name,
            quantity: ing.quantity || '1 unit',
            estimatedCost: Number(ing.estimatedCost) || 4,
            category: (ing.category as StoreCategory) || 'Pantry & Dry Goods',
            recommendedStore: 'CymbalMart Supercenter',
            isMustHave: true,
            notes: 'Added from custom recipe via Voice Control',
          });
        });
        break;
      }

      default:
        break;
    }
  }, [activePlan, handleCreateOrUpdatePlan, handleAddCustomItem, handleUpdatePlan]);

  // Voice Control Hook
  const voiceControl = useVoiceControl({
    plan: activePlan,
    currentTab: activeTab,
    onExecuteAction: handleVoiceAction,
    onShowToast: showToast,
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white pb-24">
      {/* Navigation Header */}
      <Navbar
        plans={plans}
        activePlan={activePlan}
        onSelectPlan={(p) => setActivePlanId(p.id)}
        onOpenCreateModal={() => setIsCreateModalOpen(true)}
        onOpenBudgetOptimizer={() => setIsBudgetModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        onToggleChat={() => setIsChatOpen(!isChatOpen)}
        isChatOpen={isChatOpen}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onToggleVoice={voiceControl.toggleListening}
        isVoiceListening={voiceControl.isListening}
        isVoiceContinuous={voiceControl.isContinuousMode}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Toast Notification */}
        {toastMessage && (
          <div
            className={`fixed bottom-20 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-xs font-semibold animate-in slide-in-from-bottom-5 duration-200 ${
              toastMessage.type === 'error'
                ? 'bg-rose-950/90 text-rose-200 border-rose-500/50'
                : 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50'
            }`}
          >
            {toastMessage.type === 'error' ? (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            )}
            <span>{toastMessage.text}</span>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white ml-2"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Content based on Active Plan and Active Tab */}
        {!activePlan ? (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto my-12 space-y-4 shadow-xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Sparkles className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-black text-slate-100">Welcome to CymbalMart Party Planner</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Convert your party intent into a curated, budget-conscious CymbalMart shopping list with bar math, portion rations, and hands-free voice fulfillment.
            </p>
            <div className="flex flex-wrap gap-3 justify-center pt-2">
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 flex items-center gap-2 text-sm transition-all"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Define Your First Party Plan</span>
              </button>
              <button
                onClick={() => voiceControl.executeSimulatedVoice("Create a Backyard BBQ Cookout for 15 guests with $250 budget")}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-rose-300 font-bold rounded-xl border border-rose-500/30 flex items-center gap-2 text-sm transition-all"
              >
                <Mic className="w-4 h-4 text-rose-400 animate-pulse" />
                <span>Try Voice: "Plan a BBQ for 15"</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Task 1: Define Event */}
            {activeTab === 'define' && (
              <DefineEventTab
                plan={activePlan}
                onUpdatePlan={handleUpdatePlan}
                onProceedToReview={() => setActiveTab('review')}
                onRegeneratePlan={handleCreateOrUpdatePlan}
                isLoading={isCreatingPlan}
              />
            )}

            {/* Task 2: Review List */}
            {activeTab === 'review' && (
              <ShoppingListTab
                plan={activePlan}
                onUpdatePlan={handleUpdatePlan}
                onOpenAddCustomItem={() => setIsAddItemModalOpen(true)}
                onProceedToCheckout={() => setActiveTab('refine_checkout')}
                onOpenBudgetOptimizer={() => setIsBudgetModalOpen(true)}
              />
            )}

            {/* Task 3: Refine & Checkout */}
            {activeTab === 'refine_checkout' && (
              <RefineAndCheckoutTab
                plan={activePlan}
                onUpdatePlan={handleUpdatePlan}
                onOpenExportModal={() => setIsExportModalOpen(true)}
                onOpenBudgetOptimizer={() => setIsBudgetModalOpen(true)}
              />
            )}

            {/* Menu & Bar Math Tab */}
            {activeTab === 'menu' && (
              <MenuAndBeveragesTab
                plan={activePlan}
                onAddIngredientToShopping={(ing) => {
                  handleAddCustomItem({
                    name: ing.name,
                    quantity: ing.quantity,
                    estimatedCost: ing.estimatedCost,
                    category: ing.category,
                    recommendedStore: 'CymbalMart Supercenter',
                    isMustHave: true,
                    notes: 'Added from custom batch drink recipe',
                  });
                }}
              />
            )}

            {/* Prep Timeline Tab */}
            {activeTab === 'timeline' && <PrepTimelineTab plan={activePlan} />}

            {/* Overview Card Tab */}
            {activeTab === 'overview' && (
              <PartyOverviewCard
                plan={activePlan}
                onNavigateTab={setActiveTab}
                onOpenBudgetOptimizer={() => setIsBudgetModalOpen(true)}
              />
            )}
          </div>
        )}
      </main>

      {/* Floating Hands-Free Voice Control Hub Dock */}
      <VoiceControlHub
        isListening={voiceControl.isListening}
        isContinuousMode={voiceControl.isContinuousMode}
        isProcessing={voiceControl.isProcessing}
        isSpeaking={voiceControl.isSpeaking}
        isMuted={voiceControl.isMuted}
        transcript={voiceControl.transcript}
        interimTranscript={voiceControl.interimTranscript}
        lastCommand={voiceControl.lastCommand}
        lastSpokenReply={voiceControl.lastSpokenReply}
        lastDetectedIntent={voiceControl.lastDetectedIntent}
        suggestedFollowUps={voiceControl.suggestedFollowUps}
        error={voiceControl.error}
        onToggleListening={voiceControl.toggleListening}
        onToggleContinuous={voiceControl.toggleContinuousMode}
        onToggleMute={voiceControl.toggleMute}
        onOpenHelp={() => setIsVoiceHelpOpen(true)}
        onOpenKitchenMode={() => setIsKitchenModeOpen(true)}
        onSimulateCommand={voiceControl.executeSimulatedVoice}
      />

      {/* Modals & Slide-overs */}
      <PartyCreatorModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateOrUpdatePlan}
        isLoading={isCreatingPlan}
      />

      <AddCustomItemModal
        isOpen={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        onAdd={handleAddCustomItem}
      />

      {activePlan && (
        <>
          <BudgetOptimizerModal
            isOpen={isBudgetModalOpen}
            onClose={() => setIsBudgetModalOpen(false)}
            plan={activePlan}
            onUpdatePlan={handleUpdatePlan}
          />

          <PrintAndExportModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            plan={activePlan}
          />
        </>
      )}

      {/* Voice Help & Cheat Sheet Modal */}
      <VoiceHelpModal
        isOpen={isVoiceHelpOpen}
        onClose={() => setIsVoiceHelpOpen(false)}
        onSimulateCommand={voiceControl.executeSimulatedVoice}
      />

      {/* Kitchen & Kiosk Full-Screen Hands-Free Mode */}
      <KitchenHandsFreeModal
        isOpen={isKitchenModeOpen}
        onClose={() => setIsKitchenModeOpen(false)}
        plan={activePlan}
        isListening={voiceControl.isListening}
        isContinuousMode={voiceControl.isContinuousMode}
        isProcessing={voiceControl.isProcessing}
        isSpeaking={voiceControl.isSpeaking}
        isMuted={voiceControl.isMuted}
        transcript={voiceControl.transcript}
        interimTranscript={voiceControl.interimTranscript}
        lastCommand={voiceControl.lastCommand}
        lastSpokenReply={voiceControl.lastSpokenReply}
        lastDetectedIntent={voiceControl.lastDetectedIntent}
        suggestedFollowUps={voiceControl.suggestedFollowUps}
        onToggleListening={voiceControl.toggleListening}
        onToggleContinuous={voiceControl.toggleContinuousMode}
        onToggleMute={voiceControl.toggleMute}
        onSimulateCommand={voiceControl.executeSimulatedVoice}
        onToggleItemCheck={(itemId) => {
          handleVoiceAction({ type: 'TOGGLE_ITEM_CHECK', payload: { itemNameOrId: itemId } });
        }}
        onNavigateTab={setActiveTab}
      />

      {/* CymbalMart Assistant Chatbot */}
      <CymbalMartAssistant
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        plan={activePlan}
        onAddCustomItem={handleAddCustomItem}
        onNavigateTab={setActiveTab}
      />
    </div>
  );
}

