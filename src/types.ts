export type EventType =
  | 'Birthday Party'
  | 'Backyard BBQ & Cookout'
  | 'Dinner Soirée & Tapas'
  | 'Cocktail & Lounge Night'
  | 'Kids Birthday Bash'
  | 'Game Night & Snacks'
  | 'Taco & Margarita Fiesta'
  | 'Brunch & Bubbly'
  | 'Holiday Gathering'
  | 'Housewarming'
  | 'Baby / Bridal Shower'
  | 'Custom';

export type BudgetTier = 'frugal' | 'balanced' | 'deluxe';

export type StoreCategory =
  | 'Produce'
  | 'Meat & Seafood'
  | 'Dairy & Refrigerated'
  | 'Bakery & Bread'
  | 'Pantry & Dry Goods'
  | 'Beverages & Mixers'
  | 'Alcohol & Wine'
  | 'Ice & Frozen'
  | 'Tableware & Disposables'
  | 'Decorations & Ambience'
  | 'Snacks & Sweets';

export type RecommendedStore =
  | 'CymbalMart Supercenter'
  | 'CymbalMart Express'
  | 'CymbalMart Spirits & Beverage'
  | 'CymbalMart Party Supply'
  | 'Supermarket'
  | 'Warehouse Club (Costco/Sam\'s)'
  | 'Liquor Store'
  | 'Party Supply / Dollar Store'
  | 'Specialty / Bakery';

export interface ShoppingItem {
  id: string;
  name: string;
  category: StoreCategory;
  aisleNumber?: number;
  aisleName?: string;
  quantity: string;
  estimatedCost: number;
  checked: boolean;
  notes?: string;
  isMustHave: boolean;
  recommendedStore: RecommendedStore;
  dietaryTags?: string[];
  unitPortionExplanation?: string;
  isCymbalBrand?: boolean;
  nationalBrandCost?: number;
  cymbalBrandSavings?: number;
}

export interface MenuItem {
  name: string;
  course: 'Appetizer' | 'Main' | 'Side' | 'Dessert' | 'Beverage';
  description: string;
  dietary: string[];
  isSignature?: boolean;
}

export interface DrinkBreakdown {
  category: string;
  recommendedAmount: string;
  notes: string;
  bottlesOrCansEstimate: string;
}

export interface TimelineStep {
  timeframe: string; // e.g. "3 Days Before", "1 Day Before", "2 Hours Before", "Party Time"
  tasks: string[];
}

export interface FulfillmentDetails {
  method: 'pickup' | 'delivery';
  storeName: string;
  timeSlot: string;
  address?: string;
  orderNumber?: string;
  rewardPointsEarned: number;
  isCompleted?: boolean;
}

export interface PartyPlan {
  id: string;
  title: string;
  theme: string;
  eventType: EventType;
  guestCount: {
    adults: number;
    kids: number;
    drinkers: number;
    nonDrinkers: number;
  };
  durationHours: number;
  dietaryRequirements: string[];
  budgetTier: BudgetTier;
  targetBudget: number;
  estimatedTotalCost: number;
  vibesAndHighlights: {
    colorPalette: string[];
    musicSuggestion: string;
    signatureWelcome: string;
    hostTip: string;
  };
  menu: MenuItem[];
  drinkCalculations: DrinkBreakdown[];
  timeline: TimelineStep[];
  shoppingList: ShoppingItem[];
  budgetSavingsTips: string[];
  createdAt: string;
  cujCurrentStep?: 'define' | 'review' | 'refine_checkout';
  fulfillment?: FulfillmentDetails;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  suggestedAction?: {
    type: 'add_item' | 'update_budget' | 'apply_swap' | 'navigate_tab' | 'switch_brand';
    payload?: any;
    label: string;
  };
  suggestedItems?: ShoppingItem[];
  suggestedPrompts?: string[];
  topicCategory?: 'aisle' | 'budget' | 'bar_math' | 'dietary' | 'general' | 'fulfillment' | 'recipe';
}
