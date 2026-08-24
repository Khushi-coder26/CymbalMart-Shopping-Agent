import React, { useState } from 'react';
import { ShoppingItem, StoreCategory, RecommendedStore } from '../types';
import { X, Plus, Sparkles } from 'lucide-react';

interface AddCustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<ShoppingItem, 'id' | 'checked'>) => void;
}

const CATEGORIES: StoreCategory[] = [
  'Produce',
  'Meat & Seafood',
  'Dairy & Refrigerated',
  'Bakery & Bread',
  'Pantry & Dry Goods',
  'Beverages & Mixers',
  'Alcohol & Wine',
  'Ice & Frozen',
  'Tableware & Disposables',
  'Decorations & Ambience',
  'Snacks & Sweets',
];

const STORES: RecommendedStore[] = [
  'CymbalMart Supercenter',
  'CymbalMart Express',
  'CymbalMart Spirits & Beverage',
  'CymbalMart Party Supply',
  'Supermarket',
  "Warehouse Club (Costco/Sam's)",
  'Liquor Store',
  'Party Supply / Dollar Store',
  'Specialty / Bakery',
];

export const AddCustomItemModal: React.FC<AddCustomItemModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<StoreCategory>('Produce');
  const [quantity, setQuantity] = useState('1 pack');
  const [estimatedCost, setEstimatedCost] = useState(10);
  const [recommendedStore, setRecommendedStore] = useState<RecommendedStore>('Supermarket');
  const [isMustHave, setIsMustHave] = useState(true);
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      category,
      quantity: quantity.trim() || '1 item',
      estimatedCost: Number(estimatedCost) || 0,
      recommendedStore,
      isMustHave,
      notes: notes.trim() || undefined,
    });

    setName('');
    setQuantity('1 pack');
    setEstimatedCost(10);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        id="add-custom-item-modal"
        className="relative bg-slate-900 border border-slate-700/80 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden text-slate-100"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Plus className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-slate-100">Add Item to Shopping List</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Item / Ingredient Name *</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Extra Avocado, Sriracha Aioli, Citronella Bucket"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500 text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Aisle / Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as StoreCategory)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Quantity Needed</label>
              <input
                type="text"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 2 bags, 1 bottle, 3 lbs"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Est. Price ($ USD)</label>
              <input
                type="number"
                step="1"
                min="0"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Buy At Store</label>
              <select
                value={recommendedStore}
                onChange={(e) => setRecommendedStore(e.target.value as RecommendedStore)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
              >
                {STORES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Host Notes / Brand</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Buy extra spicy, check expiration date"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              id="is-must-have-check"
              type="checkbox"
              checked={isMustHave}
              onChange={(e) => setIsMustHave(e.target.checked)}
              className="rounded bg-slate-800 border-slate-700 text-rose-500 focus:ring-rose-500 w-4 h-4"
            />
            <label htmlFor="is-must-have-check" className="text-slate-300 cursor-pointer">
              Mark as <strong>Must-Have Essential</strong>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow-sm"
            >
              Add Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
