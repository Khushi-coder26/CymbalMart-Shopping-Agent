import React, { useState } from 'react';
import { PartyPlan } from '../types';
import { generateExportText } from '../utils';
import {
  X,
  Copy,
  Check,
  Printer,
  Share2,
  FileText,
  Sparkles,
} from 'lucide-react';

interface PrintAndExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PartyPlan;
}

export const PrintAndExportModal: React.FC<PrintAndExportModalProps> = ({
  isOpen,
  onClose,
  plan,
}) => {
  const [onlyUnchecked, setOnlyUnchecked] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const exportText = generateExportText(plan, onlyUnchecked);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(exportText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy to clipboard', err);
    }
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${plan.title} - Shopping List</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; padding: 24px; color: #111; line-height: 1.5; }
            h1 { font-size: 22px; margin-bottom: 4px; }
            .meta { color: #555; font-size: 13px; margin-bottom: 20px; border-bottom: 2px solid #eee; padding-bottom: 12px; }
            .category { font-size: 15px; font-weight: bold; margin-top: 18px; margin-bottom: 8px; border-bottom: 1px solid #ddd; padding-bottom: 4px; color: #b91c1c; }
            .item { font-size: 13px; margin-bottom: 6px; display: flex; align-items: baseline; }
            .box { width: 14px; height: 14px; border: 1.5px solid #333; margin-right: 8px; display: inline-block; }
            .notes { color: #666; font-size: 12px; margin-left: 6px; font-style: italic; }
            .footer { margin-top: 30px; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>${plan.title}</h1>
          <div class="meta">
            Occasion: <strong>${plan.eventType}</strong> | Theme: ${plan.theme}<br/>
            Guests: <strong>${plan.guestCount.adults + plan.guestCount.kids} Total</strong> (${plan.guestCount.adults} Adults, ${plan.guestCount.drinkers} Drinkers, ${plan.guestCount.kids} Kids)<br/>
            Est. Budget: <strong>$${plan.estimatedTotalCost}</strong> (Target: $${plan.targetBudget})
          </div>
          <pre style="font-family: inherit; white-space: pre-wrap;">${exportText}</pre>
          <div class="footer">Party Planner Shopping Agent</div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div
        id="export-modal-dialog"
        className="relative bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-xl shadow-2xl overflow-hidden text-slate-100 max-h-[85vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Export & Share Shopping List</h3>
              <p className="text-xs text-slate-400">
                Ready to paste into Apple Notes, Google Keep, WhatsApp, or print.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-200 p-2 rounded-lg hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Options & Preview */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1 text-xs">
          {/* Toggles */}
          <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
            <span className="text-slate-300 font-medium">Export Filter:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setOnlyUnchecked(false)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  !onlyUnchecked
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All Items ({plan.shoppingList.length})
              </button>
              <button
                type="button"
                onClick={() => setOnlyUnchecked(true)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  onlyUnchecked
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Unchecked Only ({plan.shoppingList.filter((i) => !i.checked).length})
              </button>
            </div>
          </div>

          {/* Textarea Preview */}
          <div className="relative">
            <textarea
              readOnly
              value={exportText}
              rows={12}
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 font-mono text-xs text-slate-300 focus:outline-none scrollbar-none leading-relaxed select-all"
            />
          </div>
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Print Sheet</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-xl"
            >
              Close
            </button>
            <button
              id="copy-shopping-list-btn"
              onClick={handleCopy}
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-xl text-xs font-bold shadow-md transition-all active:scale-95"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Formatted List</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
