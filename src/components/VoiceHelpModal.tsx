import React, { useState } from 'react';
import {
  X,
  Mic,
  Sparkles,
  ShoppingBag,
  Sliders,
  DollarSign,
  GlassWater,
  CalendarCheck,
  Truck,
  Play,
  Volume2,
  CheckCircle2,
  HelpCircle,
  Layers,
  Store,
} from 'lucide-react';

interface VoiceHelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateCommand: (command: string) => void;
}

interface CommandGroup {
  id: string;
  title: string;
  category: string;
  icon: any;
  color: string;
  description: string;
  examples: {
    command: string;
    explanation: string;
  }[];
}

const COMMAND_GROUPS: CommandGroup[] = [
  {
    id: 'define_event',
    title: 'Task 1: Define & Adjust Event Intent',
    category: 'Event Setup',
    icon: Sparkles,
    color: 'from-blue-600 to-indigo-600',
    description: 'Create parties from scratch, change guest counts, adjust duration, and set target budgets hands-free.',
    examples: [
      {
        command: 'Create a Mexican Fiesta for 12 adults and 4 kids with $200 budget',
        explanation: 'Generates a brand new party plan with curated CymbalMart aisles and bar math.',
      },
      {
        command: 'Set target budget to $300',
        explanation: 'Recalculates budget limits and triggers budget alignment balance.',
      },
      {
        command: 'Change guest count to 16 adults and 2 kids',
        explanation: 'Updates portion sizes and per-guest estimates.',
      },
      {
        command: 'Add gluten-free and vegan dietary restrictions',
        explanation: 'Tags and filters recipes and items for special diets.',
      },
    ],
  },
  {
    id: 'review_list',
    title: 'Task 2: Review List & Manage Aisle Items',
    category: 'Shopping & Recalculation',
    icon: Layers,
    color: 'from-blue-600 to-emerald-600',
    description: 'Add groceries to specific aisles, check off collected items, step quantities, and swap for savings.',
    examples: [
      {
        command: 'Add 2 packs of organic avocados to produce',
        explanation: 'Adds custom item to Aisle 1 (Produce) and recalculates total.',
      },
      {
        command: 'Check off brioche buns and craft beer',
        explanation: 'Marks items collected on your shopping list hands-free.',
      },
      {
        command: 'Increase quantity of Angus burger patties',
        explanation: 'Steps up quantity and recalculates budget totals.',
      },
      {
        command: 'Switch all items to Cymbal brand',
        explanation: 'Automates Great Value private label swaps and announces total dollar savings.',
      },
      {
        command: 'Apply 10 percent budget trim to all items',
        explanation: 'Scales all grocery items down by 10% to meet strict budget targets.',
      },
      {
        command: 'Check all items as completed',
        explanation: 'Marks whole cart ready for fulfillment with celebration confetti.',
      },
    ],
  },
  {
    id: 'bar_menu',
    title: 'Bar Math, Portioning & Recipes',
    category: 'Host Calculations',
    icon: GlassWater,
    color: 'from-amber-600 to-orange-600',
    description: 'Ask bar portion questions, cocktail ideas, and add recipe ingredients directly to your cart.',
    examples: [
      {
        command: 'How much ice do I need for 14 guests?',
        explanation: 'Assistant computes host bar math (~1.5 lbs/person) and suggests Aisle 10 party bags.',
      },
      {
        command: 'Suggest a signature cocktail recipe with tequila',
        explanation: 'Generates custom batch drink recipe and offers to add ingredients.',
      },
      {
        command: 'Add signature cocktail ingredients to my shopping list',
        explanation: 'Puts all required mixers and garnishes into your active cart.',
      },
    ],
  },
  {
    id: 'refine_checkout',
    title: 'Task 3: Refine Constraints & Checkout',
    category: 'Fulfillment & Ordering',
    icon: ShoppingBag,
    color: 'from-emerald-600 to-teal-600',
    description: 'Choose Curbside Pickup or Delivery, set time slots, adjust portions, and place orders.',
    examples: [
      {
        command: 'Switch to Curbside Pickup for Saturday 11 AM',
        explanation: 'Selects free store curbside pickup at your local CymbalMart.',
      },
      {
        command: 'Select 1-Hour Express Delivery to my address',
        explanation: 'Configures express doorstep delivery for party items.',
      },
      {
        command: 'Finalize and place my CymbalMart order',
        explanation: 'Completes checkout, generates order receipt #, and speaks confirmation instructions.',
      },
    ],
  },
  {
    id: 'navigation_helpers',
    title: 'Hands-Free Navigation & App Controls',
    category: 'Navigation',
    icon: CalendarCheck,
    color: 'from-purple-600 to-indigo-600',
    description: 'Jump between tabs, open modals, mute voice feedback, or ask general questions.',
    examples: [
      {
        command: 'Go to shopping list',
        explanation: 'Navigates to Task 2 (Review List & Budget).',
      },
      {
        command: 'Go to menu and bar math',
        explanation: 'Navigates to Menu, Food Courses & Drink calculations.',
      },
      {
        command: 'Go to prep schedule timeline',
        explanation: 'Shows run-of-show checklist (T-3 days, T-2 hours, party time).',
      },
      {
        command: 'Proceed to checkout',
        explanation: 'Navigates to Task 3 (Refine & Checkout).',
      },
      {
        command: 'Open budget optimizer',
        explanation: 'Launches AI budget buster analysis and savings swaps.',
      },
      {
        command: 'What is my current total budget?',
        explanation: 'Speaks current cart total, target budget, and per-guest breakdown.',
      },
    ],
  },
];

export const VoiceHelpModal: React.FC<VoiceHelpModalProps> = ({
  isOpen,
  onClose,
  onSimulateCommand,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  if (!isOpen) return null;

  const filteredGroups = COMMAND_GROUPS.filter((grp) => {
    if (activeCategory !== 'ALL' && grp.id !== activeCategory) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const inTitle = grp.title.toLowerCase().includes(term);
      const inDesc = grp.description.toLowerCase().includes(term);
      const inExamples = grp.examples.some(
        (e) => e.command.toLowerCase().includes(term) || e.explanation.toLowerCase().includes(term)
      );
      return inTitle || inDesc || inExamples;
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-950/50 via-slate-900 to-indigo-950/50">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Mic className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-100 tracking-tight">
                  Hands-Free Voice Control Guide
                </h3>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                  Complete CUJ Support
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Speak naturally or click any sample command below to simulate hands-free execution.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Pills & Search Bar */}
        <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none w-full sm:w-auto">
            <button
              onClick={() => setActiveCategory('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                activeCategory === 'ALL'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Commands
            </button>
            {COMMAND_GROUPS.map((grp) => (
              <button
                key={grp.id}
                onClick={() => setActiveCategory(grp.id)}
                className={`px-3 py-1.5 rounded-xl font-semibold whitespace-nowrap transition-all ${
                  activeCategory === grp.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {grp.category}
              </button>
            ))}
          </div>

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search commands (e.g., 'ice', 'buns', 'checkout')..."
            className="w-full sm:w-64 bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Command Groups List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {filteredGroups.map((group) => {
            const Icon = group.icon;

            return (
              <div
                key={group.id}
                className="bg-slate-800/40 border border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${group.color} flex items-center justify-center text-white flex-shrink-0 shadow-md`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-100">{group.title}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{group.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {group.examples.map((example, idx) => (
                    <div
                      key={idx}
                      className="bg-slate-900/90 border border-slate-700/70 hover:border-blue-500/60 rounded-xl p-3 flex flex-col justify-between gap-2.5 transition-all group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-xs font-bold text-blue-300 group-hover:text-blue-200 leading-snug">
                            "{example.command}"
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                          {example.explanation}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          onSimulateCommand(example.command);
                          onClose();
                        }}
                        className="self-end px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600 text-blue-300 hover:text-white rounded-lg text-[11px] font-bold border border-blue-500/30 flex items-center gap-1.5 transition-all active:scale-95"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        <span>Simulate Voice</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Volume2 className="w-4 h-4 text-emerald-400" />
            <span>Voice engine speaks status confirmations automatically (with Mute option).</span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Powered by Gemini AI Natural Language Parser + Web Speech API
          </span>
        </div>
      </div>
    </div>
  );
};
