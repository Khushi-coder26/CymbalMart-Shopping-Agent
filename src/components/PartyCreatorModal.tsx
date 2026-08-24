import React, { useState } from 'react';
import { EventType, BudgetTier } from '../types';
import {
  X,
  Sparkles,
  Users,
  Clock,
  DollarSign,
  Utensils,
  Wine,
  Flame,
  Check,
  Loader2,
} from 'lucide-react';

interface PartyCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: any) => Promise<void>;
  isLoading: boolean;
}

const EVENT_PRESETS: { type: EventType; icon: string; defaultBudget: number; defaultGuests: number }[] = [
  { type: 'Backyard BBQ & Cookout', icon: '🥩', defaultBudget: 300, defaultGuests: 15 },
  { type: 'Taco & Margarita Fiesta', icon: '🌮', defaultBudget: 220, defaultGuests: 12 },
  { type: 'Dinner Soirée & Tapas', icon: '🍷', defaultBudget: 350, defaultGuests: 8 },
  { type: 'Cocktail & Lounge Night', icon: '🍸', defaultBudget: 260, defaultGuests: 12 },
  { type: 'Kids Birthday Bash', icon: '🎈', defaultBudget: 200, defaultGuests: 14 },
  { type: 'Game Night & Snacks', icon: '🎲', defaultBudget: 150, defaultGuests: 10 },
  { type: 'Brunch & Bubbly', icon: '🥂', defaultBudget: 200, defaultGuests: 10 },
  { type: 'Birthday Party', icon: '🎂', defaultBudget: 280, defaultGuests: 16 },
  { type: 'Housewarming', icon: '🏡', defaultBudget: 240, defaultGuests: 15 },
  { type: 'Custom', icon: '✨', defaultBudget: 200, defaultGuests: 10 },
];

const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Nut Allergy',
  'Halal',
  'Kosher',
  'Low Carb / Keto',
];

export const PartyCreatorModal: React.FC<PartyCreatorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [eventType, setEventType] = useState<EventType>('Backyard BBQ & Cookout');
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [adults, setAdults] = useState(12);
  const [kids, setKids] = useState(0);
  const [drinkerCount, setDrinkerCount] = useState(10);
  const [durationHours, setDurationHours] = useState(4);
  const [budgetTier, setBudgetTier] = useState<BudgetTier>('balanced');
  const [targetBudget, setTargetBudget] = useState(280);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(['Gluten-Free']);
  const [customDietary, setCustomDietary] = useState('');
  const [venueNotes, setVenueNotes] = useState('Standard home kitchen & outdoor patio');
  const [customPreferences, setCustomPreferences] = useState('');

  if (!isOpen) return null;

  const handleSelectPreset = (preset: typeof EVENT_PRESETS[0]) => {
    setEventType(preset.type);
    if (!title || title.trim() === '') {
      setTitle(`${preset.type}`);
    }
    setTargetBudget(preset.defaultBudget);
    setAdults(preset.defaultGuests);
    setDrinkerCount(Math.max(0, preset.defaultGuests - 2));
  };

  const toggleDietary = (item: string) => {
    if (selectedDietary.includes(item)) {
      setSelectedDietary(selectedDietary.filter((d) => d !== item));
    } else {
      setSelectedDietary([...selectedDietary, item]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalDietary = [...selectedDietary];
    if (customDietary.trim()) {
      finalDietary.push(customDietary.trim());
    }

    await onSubmit({
      title: title.trim() || `${eventType}`,
      eventType,
      theme: theme.trim() || 'Celebratory and welcoming vibe',
      guestAdults: Number(adults),
      guestKids: Number(kids),
      drinkerCount: Number(drinkerCount),
      durationHours: Number(durationHours),
      dietary: finalDietary,
      budgetTier,
      targetBudget: Number(targetBudget),
      venueNotes: venueNotes.trim(),
      customPreferences: customPreferences.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        id="party-creator-modal-dialog"
        className="relative bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-3xl shadow-2xl overflow-hidden text-slate-100 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-rose-500 to-amber-500 text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Party Planner AI Agent</h2>
              <p className="text-xs text-slate-400">
                Configure your event to calculate portions, drink rations & shopping cart.
              </p>
            </div>
          </div>
          <button
            id="close-party-creator-btn"
            onClick={onClose}
            disabled={isLoading}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {/* Quick Presets Carousel */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2.5">
              1. Choose Event Style
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {EVENT_PRESETS.map((preset) => {
                const isSelected = eventType === preset.type;
                return (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                      isSelected
                        ? 'bg-rose-500/15 border-rose-500 text-rose-300 font-semibold shadow-sm'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-xl mb-1">{preset.icon}</span>
                    <span className="text-xs leading-tight line-clamp-1">{preset.type}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Event Title & Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Party Title / Occasion
              </label>
              <input
                id="input-party-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Leo's 30th Birthday Bash"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Theme / Atmosphere Vibe
              </label>
              <input
                id="input-party-theme"
                type="text"
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="e.g. Neon Tropical Sunset, Rustic Farmhouse, Casual Cozy"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:outline-none text-sm"
              />
            </div>
          </div>

          {/* Guest Count Math & Drinker Ratios */}
          <div className="bg-slate-800/50 border border-slate-700/70 rounded-xl p-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-rose-400" />
                <span className="font-semibold text-slate-200 text-xs uppercase tracking-wider">
                  2. Guest Math & Bar Formula
                </span>
              </div>
              <span className="text-xs text-rose-300 font-medium bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                Total: {adults + kids} People
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Adults */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Adults (18+)
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      const val = Math.max(1, adults - 1);
                      setAdults(val);
                      if (drinkerCount > val) setDrinkerCount(val);
                    }}
                    className="w-8 h-9 rounded-l-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-slate-200"
                  >
                    -
                  </button>
                  <input
                    id="input-guest-adults"
                    type="number"
                    min="1"
                    max="200"
                    value={adults}
                    onChange={(e) => {
                      const val = Math.max(1, parseInt(e.target.value) || 1);
                      setAdults(val);
                      if (drinkerCount > val) setDrinkerCount(val);
                    }}
                    className="w-full text-center bg-slate-800 border-y border-slate-700 py-1.5 text-slate-100 font-semibold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setAdults(adults + 1);
                      setDrinkerCount(drinkerCount + 1);
                    }}
                    className="w-8 h-9 rounded-r-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Drinkers Ratio */}
              <div>
                <label className="block text-xs text-slate-400 mb-1 flex items-center justify-between">
                  <span>Alcohol Drinkers</span>
                  <span className="text-amber-400 font-medium">({drinkerCount}/{adults})</span>
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setDrinkerCount(Math.max(0, drinkerCount - 1))}
                    className="w-8 h-9 rounded-l-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-slate-200"
                  >
                    -
                  </button>
                  <input
                    id="input-guest-drinkers"
                    type="number"
                    min="0"
                    max={adults}
                    value={drinkerCount}
                    onChange={(e) => {
                      const val = Math.min(adults, Math.max(0, parseInt(e.target.value) || 0));
                      setDrinkerCount(val);
                    }}
                    className="w-full text-center bg-slate-800 border-y border-slate-700 py-1.5 text-slate-100 font-semibold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setDrinkerCount(Math.min(adults, drinkerCount + 1))}
                    className="w-8 h-9 rounded-r-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Kids */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Kids & Teens
                </label>
                <div className="flex items-center">
                  <button
                    type="button"
                    onClick={() => setKids(Math.max(0, kids - 1))}
                    className="w-8 h-9 rounded-l-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-slate-200"
                  >
                    -
                  </button>
                  <input
                    id="input-guest-kids"
                    type="number"
                    min="0"
                    max="100"
                    value={kids}
                    onChange={(e) => setKids(Math.max(0, parseInt(e.target.value) || 0))}
                    className="w-full text-center bg-slate-800 border-y border-slate-700 py-1.5 text-slate-100 font-semibold focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setKids(kids + 1)}
                    className="w-8 h-9 rounded-r-lg bg-slate-700 hover:bg-slate-600 flex items-center justify-center font-bold text-slate-200"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Duration Slider */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  Estimated Duration:
                </span>
                <span className="font-bold text-indigo-300">{durationHours} Hours</span>
              </div>
              <input
                id="input-party-duration"
                type="range"
                min="1"
                max="8"
                step="0.5"
                value={durationHours}
                onChange={(e) => setDurationHours(parseFloat(e.target.value))}
                className="w-full accent-rose-500 bg-slate-700 h-2 rounded-lg cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                <span>1h (Cocktail quickie)</span>
                <span>3-4h (Standard party)</span>
                <span>6-8h (All-day bash)</span>
              </div>
            </div>
          </div>

          {/* Budget & Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Target Budget Limit ($)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-2.5 text-slate-400 font-medium">$</span>
                <input
                  id="input-target-budget"
                  type="number"
                  min="20"
                  max="10000"
                  step="10"
                  value={targetBudget}
                  onChange={(e) => setTargetBudget(Math.max(10, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-8 pr-3.5 py-2.5 text-slate-100 font-bold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Budget Tier Philosophy
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { tier: 'frugal' as BudgetTier, label: 'Frugal', desc: 'Bulk & DIY' },
                  { tier: 'balanced' as BudgetTier, label: 'Balanced', desc: 'Crowd pleaser' },
                  { tier: 'deluxe' as BudgetTier, label: 'Deluxe', desc: 'Artisan & Premium' },
                ].map((item) => (
                  <button
                    key={item.tier}
                    type="button"
                    onClick={() => setBudgetTier(item.tier)}
                    className={`py-2 px-2 rounded-lg border text-center text-xs transition-all ${
                      budgetTier === item.tier
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold'
                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-semibold">{item.label}</div>
                    <div className="text-[10px] text-slate-400">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Dietary Constraints */}
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-2 flex items-center gap-1.5">
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              Dietary Requirements (We'll adjust the menu & shopping list)
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {DIETARY_OPTIONS.map((item) => {
                const isSelected = selectedDietary.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => toggleDietary(item)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/60 text-amber-300 font-medium'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-amber-400" />}
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
            <input
              type="text"
              value={customDietary}
              onChange={(e) => setCustomDietary(e.target.value)}
              placeholder="Other dietary needs (e.g. 1 guest with shellfish allergy, pregnant host)"
              className="w-full bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          {/* Venue & Custom Special Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Kitchen & Equipment Available
              </label>
              <input
                type="text"
                value={venueNotes}
                onChange={(e) => setVenueNotes(e.target.value)}
                placeholder="e.g. Weber charcoal grill, 1 oven, slow cooker, cooler"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Special Requests / Dish Ideas
              </label>
              <input
                type="text"
                value={customPreferences}
                onChange={(e) => setCustomPreferences(e.target.value)}
                placeholder="e.g. Include smoked ribs, prefer tequila drinks, need paper plates"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              id="generate-party-plan-submit-btn"
              type="submit"
              disabled={isLoading}
              className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-rose-500 via-pink-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-semibold text-sm shadow-md shadow-rose-500/25 flex items-center gap-2 transition-all disabled:opacity-50 active:scale-98"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Agent Calculating Math & Menu...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Full Party & Shopping Plan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
