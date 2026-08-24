import React, { useState } from 'react';
import { PartyPlan, MenuItem, DrinkBreakdown } from '../types';
import {
  GlassWater,
  UtensilsCrossed,
  Sparkles,
  Wine,
  Beer,
  CheckCircle2,
  Plus,
  Loader2,
  Flame,
  Coffee,
  Citrus,
} from 'lucide-react';
import { formatCurrency } from '../utils';

interface MenuAndBeveragesTabProps {
  plan: PartyPlan;
  onAddIngredientToShopping: (ingredient: {
    name: string;
    quantity: string;
    estimatedCost: number;
    category: any;
  }) => void;
}

export const MenuAndBeveragesTab: React.FC<MenuAndBeveragesTabProps> = ({
  plan,
  onAddIngredientToShopping,
}) => {
  const [cocktailSpirit, setCocktailSpirit] = useState('Tequila');
  const [isMocktail, setIsMocktail] = useState(false);
  const [isGeneratingDrink, setIsGeneratingDrink] = useState(false);
  const [customCocktail, setCustomCocktail] = useState<any | null>(null);

  // Group menu by course
  const courses: { [key: string]: MenuItem[] } = {
    Appetizer: plan.menu.filter((m) => m.course === 'Appetizer'),
    Main: plan.menu.filter((m) => m.course === 'Main'),
    Side: plan.menu.filter((m) => m.course === 'Side'),
    Dessert: plan.menu.filter((m) => m.course === 'Dessert'),
  };

  const handleGenerateCocktail = async () => {
    try {
      setIsGeneratingDrink(true);
      const res = await fetch('/api/suggest-cocktail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: plan.theme,
          spirit: cocktailSpirit,
          isMocktail,
          guestCount: plan.guestCount.adults,
        }),
      });
      const data = await res.json();
      if (data.success && data.cocktail) {
        setCustomCocktail(data.cocktail);
      }
    } catch (err) {
      console.error('Failed to generate cocktail:', err);
    } finally {
      setIsGeneratingDrink(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Bar Math & Beverage Rations */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <GlassWater className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                Drink & Bar Math Calculator
              </h3>
              <p className="text-xs text-slate-400">
                Industry formula rations calculated for {plan.guestCount.drinkers} alcohol drinkers &{' '}
                {plan.guestCount.adults - plan.guestCount.drinkers + plan.guestCount.kids} non-drinkers across{' '}
                {plan.durationHours} hours.
              </p>
            </div>
          </div>
          <div className="text-xs bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 text-slate-300">
            Standard: <strong>~1.5 - 2 drinks/hr/guest</strong>
          </div>
        </div>

        {/* Drink Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {plan.drinkCalculations?.map((drink, idx) => (
            <div
              key={idx}
              className="bg-slate-800/50 border border-slate-700/70 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-600 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-bold text-sm text-slate-100">{drink.category}</span>
                </div>
                <div className="text-base font-extrabold text-amber-400 mb-1">
                  {drink.recommendedAmount}
                </div>
                <div className="text-xs font-medium text-slate-300 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800 mb-2">
                  📦 {drink.bottlesOrCansEstimate}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">{drink.notes}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Signature Cocktail / Mocktail Batch Recipe Generator */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Wine className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-100">
                Signature Batch Drink Generator
              </h3>
              <p className="text-xs text-slate-400">
                Generate a custom batch cocktail or zero-proof mocktail punch with exact grocery store measurements.
              </p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60 mb-5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Spirit / Base
            </label>
            <select
              value={cocktailSpirit}
              disabled={isMocktail}
              onChange={(e) => setCocktailSpirit(e.target.value)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-rose-500 disabled:opacity-40"
            >
              <option value="Tequila / Mezcal">Tequila / Mezcal</option>
              <option value="Bourbon / Whiskey">Bourbon / Whiskey</option>
              <option value="Gin & Botanicals">Gin & Botanicals</option>
              <option value="Vodka">Vodka</option>
              <option value="Dark or Spiced Rum">Spiced / Coconut Rum</option>
              <option value="Prosecco / Champagne">Prosecco / Sparkling Wine</option>
            </select>
          </div>

          <div className="flex items-center gap-2 pt-4 sm:pt-0">
            <button
              type="button"
              onClick={() => setIsMocktail(!isMocktail)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                isMocktail
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/50'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              {isMocktail ? '🍹 Zero-Proof Mocktail (Active)' : 'Make Non-Alcoholic Mocktail'}
            </button>
          </div>

          <div className="ml-auto pt-2 sm:pt-0">
            <button
              id="generate-custom-drink-btn"
              onClick={handleGenerateCocktail}
              disabled={isGeneratingDrink}
              className="px-4 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 transition-all disabled:opacity-50"
            >
              {isGeneratingDrink ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Mixing Recipe...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate Batch Punch Recipe</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Generated Drink Result */}
        {customCocktail && (
          <div className="bg-slate-900/90 border border-slate-700 rounded-2xl p-5 space-y-4 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                  {customCocktail.flavorProfile} Flavor
                </span>
                <h4 className="text-xl font-black text-slate-100 mt-1">
                  {customCocktail.drinkName}
                </h4>
              </div>
              <span className="text-xs font-semibold text-slate-400 bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                Batched for ~{plan.guestCount.adults} Guests
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Batch Ingredients */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Batch Ingredients & Grocery Items:
                </h5>
                <div className="space-y-1.5">
                  {customCocktail.ingredients?.map((ing: any, i: number) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-xs bg-slate-800/60 p-2 rounded-lg border border-slate-800"
                    >
                      <div>
                        <strong className="text-slate-200">{ing.name}</strong>
                        <span className="text-slate-400 ml-2">({ing.batchAmount})</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">~${ing.estCost}</span>
                        <button
                          onClick={() =>
                            onAddIngredientToShopping({
                              name: ing.name,
                              quantity: ing.batchAmount,
                              estimatedCost: ing.estCost,
                              category: ing.category || 'Beverages & Mixers',
                            })
                          }
                          title="Add ingredient to master shopping list"
                          className="p-1 rounded bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 text-[10px] font-semibold flex items-center gap-1 px-1.5"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions & Garnish */}
              <div className="space-y-3">
                <div>
                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Batching Steps:
                  </h5>
                  <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300">
                    {customCocktail.instructions?.map((step: string, sIdx: number) => (
                      <li key={sIdx} className="leading-relaxed">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
                {customCocktail.garnishTip && (
                  <div className="text-xs text-amber-300 bg-amber-500/10 p-2.5 rounded-xl border border-amber-500/20">
                    <strong>Garnish & Setup:</strong> {customCocktail.garnishTip}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Catering & Food Menu Courses */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-lg">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100">Party Menu & Course Breakdown</h3>
            <p className="text-xs text-slate-400">
              Portion-balanced dishes curated for your event theme and dietary preferences.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(courses).map(([courseName, items]) => {
            if (items.length === 0) return null;
            return (
              <div key={courseName} className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                  <span>{courseName}s</span>
                  <span className="text-[10px] text-slate-500 font-normal">
                    ({items.length} items)
                  </span>
                </h4>

                <div className="space-y-3">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-4 space-y-2 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-sm text-slate-100 flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.isSignature && (
                            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.2 rounded font-semibold">
                              Signature
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {item.description}
                      </p>

                      {/* Dietary Badges */}
                      {item.dietary && item.dietary.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {item.dietary.map((d) => (
                            <span
                              key={d}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-medium"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
