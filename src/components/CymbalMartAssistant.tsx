import React, { useState, useRef, useEffect } from 'react';
import { PartyPlan, ChatMessage, ShoppingItem } from '../types';
import Markdown from 'react-markdown';
import {
  X,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  Trash2,
  Plus,
  Store,
  DollarSign,
  GlassWater,
  Leaf,
  Truck,
  Volume2,
  VolumeX,
  ShoppingBag,
  Maximize2,
  Minimize2,
  Check,
  HelpCircle,
  MapPin,
  BadgePercent,
  RefreshCw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface CymbalMartAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan | null;
  onAddCustomItem: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
  onNavigateTab?: (tab: 'define' | 'review' | 'refine_checkout' | 'menu' | 'timeline' | 'overview') => void;
}

const CATEGORY_SHORTCUTS = [
  { id: 'aisle', label: 'Aisle Finder', icon: MapPin, prompt: 'Which aisles have charcoal, ice, and party cups at CymbalMart?' },
  { id: 'budget', label: 'Budget Swaps', icon: BadgePercent, prompt: 'What are the best CymbalMart Great Value brand swaps to save 25%?' },
  { id: 'bar', label: 'Bar & Ice Math', icon: GlassWater, prompt: 'Calculate exact alcohol bottles, mixers, and ice bags for our guest count.' },
  { id: 'dietary', label: 'Dietary Subs', icon: Leaf, prompt: 'Suggest 3 easy gluten-free and vegan appetizer substitutions.' },
  { id: 'pickup', label: 'Curbside & Delivery', icon: Truck, prompt: 'How does free Curbside Pickup and 1-Hour Delivery work at CymbalMart?' },
];

export const CymbalMartAssistant: React.FC<CymbalMartAssistantProps> = ({
  isOpen,
  onClose,
  plan,
  onAddCustomItem,
  onNavigateTab,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: plan
        ? `👋 Hello! I'm your **CymbalMart Assistant**! 🛒✨\n\nI'm ready to help you coordinate **${plan.title}**. I can:\n- 📍 Locate any ingredient across **CymbalMart store aisles 1–12**\n- 💰 Recommend **CymbalMart Great Value** private label swaps to cut your grocery bill\n- 🍹 Calculate exact **bar math, punch batches, and ice bags**\n- 🥑 Provide **vegan, gluten-free, or dairy-free** alternatives\n- 🚗 Assist with **Curbside Express Pickup** and **1-Hour Delivery**\n\nHow can I help you today?`
        : `👋 Hello! I'm your **CymbalMart Assistant**! 🛒✨\n\nI can help you plan your grocery shopping, find store aisles, calculate party drink rations, suggest budget-saving private label brands, and arrange pickup or delivery.\n\nWhat can I assist you with today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedPrompts: [
        'Where can I find ice and coolers?',
        'How can I save money with Cymbal Brand?',
        'Calculate drinks and ice for 15 guests',
        'How does Curbside Pickup work?',
      ],
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [addedItemIds, setAddedItemIds] = useState<Set<string>>(new Set());

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isLoading]);

  // Stop speaking when closed
  useEffect(() => {
    if (!isOpen && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSpeak = (text: string) => {
    if (!('speechSynthesis' in window)) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Clean markdown symbols for cleaner speech
    const cleanText = text.replace(/[*#_`~[\]]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          planContext: plan,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      if (data.success) {
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: data.reply || "Here's the info from CymbalMart:",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestedItems: data.suggestedItems || [],
          suggestedPrompts: data.suggestedPrompts || [],
          topicCategory: data.topicCategory || 'general',
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        throw new Error(data.error || 'Failed to get answer from CymbalMart Assistant');
      }
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: `I ran into a temporary hiccup connecting to the CymbalMart service: ${err.message || 'Please check connection'}. Let me know if you want to retry!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: ['Where are the grocery aisles?', 'Check Curbside Pickup', 'Calculate party ice'],
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSuggestedItem = (item: any, msgIndex: number, itemIndex: number) => {
    const itemKey = `${msgIndex}-${itemIndex}-${item.name}`;
    if (addedItemIds.has(itemKey)) return;

    onAddCustomItem({
      name: item.name,
      category: item.category || 'Pantry & Dry Goods',
      aisleNumber: item.aisleNumber || 6,
      aisleName: item.aisleName || `Aisle ${item.aisleNumber || 6}`,
      quantity: item.quantity || '1 pack',
      estimatedCost: Number(item.estimatedCost) || 5,
      isMustHave: item.isMustHave !== false,
      isCymbalBrand: Boolean(item.isCymbalBrand),
      cymbalBrandSavings: item.cymbalBrandSavings || 0,
      recommendedStore: (item.recommendedStore as any) || 'CymbalMart Supercenter',
      notes: item.notes ? `${item.notes} (via CymbalMart Assistant)` : 'Added from CymbalMart Assistant chat recommendation',
    });

    setAddedItemIds((prev) => new Set(prev).add(itemKey));

    confetti({
      particleCount: 35,
      spread: 40,
      origin: { y: 0.8 },
    });
  };

  const clearChat = () => {
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: `Chat history refreshed! How can I assist you with your CymbalMart shopping or event plans?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedPrompts: [
          'Recommend Great Value brand swaps',
          'Calculate drink rations',
          'Locate store aisles',
        ],
      },
    ]);
    setAddedItemIds(new Set());
  };

  return (
    <div
      id="cymbalmart-assistant-drawer"
      className={`fixed inset-y-0 right-0 z-50 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col transition-all duration-300 ${
        isExpanded ? 'w-full max-w-2xl' : 'w-full max-w-md'
      }`}
    >
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Bot className="w-5 h-5" />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" title="CymbalMart Assistant Online" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm text-slate-100 tracking-tight">
                CymbalMart Assistant
              </h3>
              <span className="text-[9px] uppercase font-black px-2 py-0.5 bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-full">
                AI Store Concierge
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              {plan ? `Assisting: ${plan.title}` : 'CymbalMart Shopping & Customer Support'}
            </p>
          </div>
        </div>

        {/* Header Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse view' : 'Expand view'}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors hidden sm:flex items-center justify-center"
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={clearChat}
            title="Reset Chat History"
            className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            id="close-cymbalmart-assistant-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Quick Category Action Pills */}
      <div className="px-3.5 py-2.5 bg-slate-950/70 border-b border-slate-800/80 overflow-x-auto scrollbar-none flex items-center gap-2 text-xs">
        {CATEGORY_SHORTCUTS.map((cat) => {
          const Icon = cat.icon;
          return (
            <button
              key={cat.id}
              onClick={() => handleSendMessage(cat.prompt)}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/90 hover:bg-blue-600/30 text-slate-300 hover:text-blue-200 border border-slate-700/80 hover:border-blue-500/40 text-[11px] font-semibold whitespace-nowrap transition-all flex-shrink-0 active:scale-95"
            >
              <Icon className="w-3.5 h-3.5 text-blue-400" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages Scroll View */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
        {messages.map((msg, msgIdx) => {
          const isAssistant = msg.role === 'assistant';

          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2.5 ${isAssistant ? 'flex-row' : 'flex-row-reverse'}`}
            >
              {/* Avatar */}
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 text-xs shadow-sm ${
                  isAssistant
                    ? 'bg-gradient-to-tr from-blue-600 to-indigo-600 text-white'
                    : 'bg-gradient-to-tr from-amber-500 to-rose-500 text-white font-bold'
                }`}
              >
                {isAssistant ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`max-w-[85%] rounded-2xl p-4 leading-relaxed shadow-md space-y-3 ${
                  isAssistant
                    ? 'bg-slate-800/95 border border-slate-700/80 text-slate-200 rounded-tl-none'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                }`}
              >
                {/* Markdown Content */}
                <div className="prose prose-invert prose-xs max-w-none space-y-2 leading-relaxed">
                  <Markdown>{msg.content}</Markdown>
                </div>

                {/* Suggested Grocery Items with 1-Click Add */}
                {isAssistant && msg.suggestedItems && msg.suggestedItems.length > 0 && (
                  <div className="pt-2 border-t border-slate-700/60 space-y-2">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-blue-300 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3" />
                      <span>CymbalMart Recommended Additions:</span>
                    </div>

                    <div className="space-y-1.5">
                      {msg.suggestedItems.map((item, itemIdx) => {
                        const itemKey = `${msgIdx}-${itemIdx}-${item.name}`;
                        const isAdded = addedItemIds.has(itemKey);

                        return (
                          <div
                            key={itemIdx}
                            className="bg-slate-900/80 border border-slate-700/80 rounded-xl p-2.5 flex items-center justify-between gap-2"
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-bold text-slate-100 text-[11px] truncate">
                                  {item.name}
                                </span>
                                {item.isCymbalBrand && (
                                  <span className="text-[9px] font-bold px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-md">
                                    Cymbal Brand
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                <span>{item.quantity}</span>
                                <span>•</span>
                                <span>{item.aisleName || `Aisle ${item.aisleNumber || 6}`}</span>
                                <span>•</span>
                                <span className="text-slate-200 font-semibold">${item.estimatedCost}</span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleAddSuggestedItem(item, msgIdx, itemIdx)}
                              disabled={isAdded}
                              className={`px-3 py-1.5 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-all active:scale-95 ${
                                isAdded
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm'
                              }`}
                            >
                              {isAdded ? (
                                <>
                                  <Check className="w-3.5 h-3.5" />
                                  <span>Added</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Add</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Footer bar with Timestamp & Speech synthesis */}
                <div className="flex items-center justify-between text-[9px] pt-1 text-slate-400">
                  <span>{msg.timestamp}</span>

                  {isAssistant && (
                    <button
                      type="button"
                      onClick={() => handleSpeak(msg.content)}
                      title="Read answer aloud"
                      className="p-1 hover:text-slate-200 hover:bg-slate-700/50 rounded transition-colors"
                    >
                      {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-blue-300" /> : <Volume2 className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Follow-up Prompts */}
                {isAssistant && msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {msg.suggestedPrompts.map((prompt, pIdx) => (
                      <button
                        key={pIdx}
                        onClick={() => handleSendMessage(prompt)}
                        disabled={isLoading}
                        className="text-[10px] px-2.5 py-1 rounded-full bg-slate-900/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors text-left"
                      >
                        💡 {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 bg-slate-800/60 p-3.5 rounded-2xl w-fit border border-slate-700/60 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
            <span className="text-xs">CymbalMart Assistant is reviewing store catalog & calculating rations...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3.5 border-t border-slate-800 bg-slate-900/95">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <div className="relative flex-1">
            <input
              id="cymbalmart-assistant-input"
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask CymbalMart Assistant (e.g., 'Find vegan dips', 'How much ice for 20 guests?')..."
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            id="send-cymbalmart-assistant-btn"
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:to-indigo-500 text-white font-bold shadow-md shadow-blue-500/20 transition-all disabled:opacity-40 active:scale-95 flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <p className="text-[10px] text-slate-500 text-center mt-1.5">
          CymbalMart Assistant provides real-time aisle locations, Great Value savings, portion calculations, and curbside fulfillment.
        </p>
      </div>
    </div>
  );
};
