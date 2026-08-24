import { PartyPlan, ShoppingItem, StoreCategory } from './types';

export const CYMBAL_AISLES: Record<StoreCategory, { number: number; name: string; icon: string }> = {
  'Produce': { number: 1, name: 'Aisle 1: Farm-Fresh Produce & Organic Herbs', icon: '🥑' },
  'Bakery & Bread': { number: 2, name: 'Aisle 2: Bakery Fresh Breads & Rolls', icon: '🥖' },
  'Meat & Seafood': { number: 4, name: 'Aisle 4: Cymbal Butcher, Seafood & Grill Cuts', icon: '🥩' },
  'Dairy & Refrigerated': { number: 5, name: 'Aisle 5: Dairy, Farm Eggs & Specialty Cheeses', icon: '🧀' },
  'Pantry & Dry Goods': { number: 6, name: 'Aisle 6: Pantry Staples, Marinades & Sauces', icon: '🥫' },
  'Snacks & Sweets': { number: 7, name: 'Aisle 7: Party Snacks, Chips, Dips & Sweets', icon: '🥨' },
  'Beverages & Mixers': { number: 8, name: 'Aisle 8: Cold Beverages, Sodas & Mocktail Mixers', icon: '🥤' },
  'Alcohol & Wine': { number: 9, name: 'Aisle 9: Cymbal Cellar Wine, Craft Beers & Spirits', icon: '🍷' },
  'Ice & Frozen': { number: 10, name: 'Aisle 10: Party Ice Bags & Frozen Appetizers', icon: '🧊' },
  'Tableware & Disposables': { number: 11, name: 'Aisle 11: Eco Tableware, Cups, Plates & Napkins', icon: '🍽️' },
  'Decorations & Ambience': { number: 12, name: 'Aisle 12: Party Ambience, Candles & Décor', icon: '✨' },
};

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getBudgetAlignment(plan: PartyPlan) {
  const currentTotal = plan.shoppingList.reduce((sum, i) => sum + i.estimatedCost, 0);
  const target = plan.targetBudget;
  const difference = currentTotal - target;
  const totalGuests = (plan.guestCount.adults || 0) + (plan.guestCount.kids || 0) || 1;
  const costPerGuest = currentTotal / totalGuests;
  const budgetPerGuest = target / totalGuests;

  let status: 'under' | 'on_target' | 'over' = 'on_target';
  if (currentTotal <= target * 0.95) {
    status = 'under';
  } else if (currentTotal > target * 1.05) {
    status = 'over';
  }

  const potentialCymbalSavings = plan.shoppingList.reduce((sum, item) => {
    return sum + (item.cymbalBrandSavings || Math.round(item.estimatedCost * 0.22));
  }, 0);

  return {
    currentTotal,
    target,
    difference,
    percentUsed: target > 0 ? Math.round((currentTotal / target) * 100) : 100,
    status,
    costPerGuest,
    budgetPerGuest,
    totalGuests,
    potentialCymbalSavings,
  };
}

export function calculateShoppingStats(items: ShoppingItem[]) {
  const totalItems = items.length;
  const checkedItems = items.filter((i) => i.checked).length;
  const totalEstimatedCost = items.reduce((sum, item) => sum + item.estimatedCost, 0);
  const checkedCost = items.filter((i) => i.checked).reduce((sum, item) => sum + item.estimatedCost, 0);
  const remainingCost = totalEstimatedCost - checkedCost;
  const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;
  const cymbalBrandCount = items.filter((i) => i.isCymbalBrand).length;

  return {
    totalItems,
    checkedItems,
    remainingItems: totalItems - checkedItems,
    totalEstimatedCost,
    checkedCost,
    remainingCost,
    progressPercent,
    cymbalBrandCount,
  };
}

export function generateExportText(plan: PartyPlan, onlyUnchecked = false): string {
  const items = onlyUnchecked ? plan.shoppingList.filter((i) => !i.checked) : plan.shoppingList;

  // Group by category
  const categories: Record<string, ShoppingItem[]> = {};
  items.forEach((item) => {
    if (!categories[item.category]) {
      categories[item.category] = [];
    }
    categories[item.category].push(item);
  });

  const lines: string[] = [];
  lines.push(`🛒 CYMBALMART PARTY SHOPPING CHECKLIST`);
  lines.push(`🎉 Event: ${plan.title.toUpperCase()}`);
  lines.push(`🏷️ Occasion: ${plan.eventType} | Theme: ${plan.theme}`);
  lines.push(`👥 Guests: ${plan.guestCount.adults} Adults (${plan.guestCount.drinkers} Drinkers) & ${plan.guestCount.kids} Kids`);
  lines.push(`💰 Estimated Total: ${formatCurrency(plan.estimatedTotalCost)} (Target Budget: ${formatCurrency(plan.targetBudget)})`);
  lines.push(`📍 Store: CymbalMart Supercenter & Express`);
  lines.push(`----------------------------------------\n`);

  Object.keys(categories).forEach((cat) => {
    const aisleInfo = CYMBAL_AISLES[cat as StoreCategory];
    const aisleHeader = aisleInfo ? `${aisleInfo.icon} ${aisleInfo.name}` : `🛒 ${cat.toUpperCase()}`;
    lines.push(aisleHeader);
    categories[cat].forEach((item) => {
      const checkMark = item.checked ? '✓' : '☐';
      const brandTag = item.isCymbalBrand ? ' [Cymbal Brand]' : '';
      const notes = item.notes ? ` (Note: ${item.notes})` : '';
      lines.push(`${checkMark} ${item.name} (${item.quantity}) - ~$${item.estimatedCost}${brandTag}${notes}`);
    });
    lines.push('');
  });

  lines.push(`----------------------------------------`);
  lines.push(`💡 CymbalMart Host Pro-Tip: ${plan.vibesAndHighlights.hostTip}`);
  lines.push(`🍹 Signature Welcome: ${plan.vibesAndHighlights.signatureWelcome}`);
  lines.push(`\nGenerated with CymbalMart Party Planner Shopping Agent`);

  return lines.join('\n');
}

