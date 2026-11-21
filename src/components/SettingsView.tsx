import { Download, Moon, ShieldCheck, Sun, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { ActiveView, HistoryItem } from '../types/scamshield';
import { exportHistoryToCsv } from '../utils/analytics';
import type { ThemeMode } from '../utils/theme';

interface SettingsViewProps {
  saveToHistory: boolean;
  onToggleSaveToHistory: (enabled: boolean) => void;
  historyItems: HistoryItem[];
  onClearAllHistory: () => void;
  onNavigate: (view: ActiveView) => void;
  theme: ThemeMode;
  onSetTheme: (theme: ThemeMode) => void;
}

export function SettingsView({
  saveToHistory,
  onToggleSaveToHistory,
  historyItems,
  onClearAllHistory,
  onNavigate,
  theme,
  onSetTheme,
}: SettingsViewProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  return (
    <section className="py-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
          Settings &amp; Privacy
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B4C7]">
          Manage appearance, history storage, data exports, and inspection safeguards for your session.
        </p>
      </div>

      <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs divide-y divide-slate-200 dark:divide-[#273449]">
        {/* Appearance / Theme */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Appearance &amp; Theme
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B4C7]">
              Switch between Light Mode and Dark Mode. Your preference is saved locally in this browser.
            </p>
          </div>
          <div
            role="group"
            aria-label="Theme preference"
            className="inline-flex items-center gap-1 p-1 rounded-lg bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] shrink-0"
          >
            <button
              type="button"
              onClick={() => onSetTheme('light')}
              aria-pressed={theme === 'light'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Sun className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Light Mode</span>
            </button>
            <button
              type="button"
              onClick={() => onSetTheme('dark')}
              aria-pressed={theme === 'dark'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-[#172033] text-[#F8FAFC] border border-[#273449] shadow-xs'
                  : 'text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Dark Mode</span>
            </button>
          </div>
        </div>

        {/* Privacy / History Recording */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Scan History Recording
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B4C7]">
              Store analysed message previews and URL reports in your private session SQLite database.
              Long numeric sequences and explicit OTP/PIN digits are masked automatically.
            </p>
          </div>
          <label className="inline-flex items-center gap-2.5 text-sm font-medium text-slate-900 dark:text-[#F8FAFC] shrink-0 cursor-pointer">
            <input
              type="checkbox"
              checked={saveToHistory}
              onChange={(e) => onToggleSaveToHistory(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 dark:border-[#273449] dark:bg-[#0B1220] text-blue-600 focus:ring-blue-600"
            />
            <span>{saveToHistory ? 'Enabled' : 'Disabled'}</span>
          </label>
        </div>

        {/* Export Report */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Export Scan Report (CSV)
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B4C7]">
              Download your stored scan history ({historyItems.length} record
              {historyItems.length === 1 ? '' : 's'}) for offline review or reporting.
            </p>
          </div>
          <button
            type="button"
            disabled={historyItems.length === 0}
            onClick={() => exportHistoryToCsv(historyItems)}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-slate-800 dark:text-[#F8FAFC] bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#0B1220] disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 dark:border-[#273449] rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
        </div>

        {/* Clear History */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Clear Session Scan History
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B4C7]">
              Permanently remove all saved scan records associated with your current browser session.
            </p>
          </div>
          {!confirmClear ? (
            <button
              type="button"
              disabled={historyItems.length === 0}
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-red-700 dark:text-red-300 bg-white dark:bg-[#111827] hover:bg-red-50 dark:hover:bg-red-950/40 disabled:opacity-50 disabled:cursor-not-allowed border border-red-200 dark:border-red-900/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              <span>Clear All History</span>
            </button>
          ) : (
            <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg px-3 py-2 shrink-0">
              <span className="text-xs font-medium text-red-800 dark:text-red-200">
                Confirm deletion?
              </span>
              <button
                type="button"
                onClick={() => {
                  onClearAllHistory();
                  setConfirmClear(false);
                }}
                className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
              >
                Delete
              </button>
              <button
                type="button"
                onClick={() => setConfirmClear(false)}
                className="text-xs font-medium text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC] px-2 py-1"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        {/* Engine & Documentation Links */}
        <div className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/60 dark:bg-[#111827]/70 rounded-b-xl">
          <div className="flex items-start gap-3">
            <ShieldCheck
              className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
              aria-hidden="true"
            />
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                Detection Engine: Active
              </h2>
              <p className="text-xs text-slate-600 dark:text-[#A7B4C7] mt-0.5">
                Static URL inspection never visits submitted links. Learn more about scoring rules and safeguards.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('how-it-works')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-[#F8FAFC] bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-[#0B1220] border border-slate-300 dark:border-[#273449] rounded-lg transition-colors whitespace-nowrap"
            >
              How It Works
            </button>
            <button
              type="button"
              onClick={() => onNavigate('about')}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-[#F8FAFC] bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-[#0B1220] border border-slate-300 dark:border-[#273449] rounded-lg transition-colors whitespace-nowrap"
            >
              About ScamShield
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

