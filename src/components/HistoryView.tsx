import { Clock, Download, Eye, ShieldOff, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { AnalysisResult, HistoryItem, RiskLevel } from '../types/scamshield';
import { exportHistoryToCsv } from '../utils/analytics';

interface HistoryViewProps {
  items: HistoryItem[];
  isLoading: boolean;
  saveToHistory: boolean;
  onToggleSaveToHistory: (enabled: boolean) => void;
  onInspectResult: (result: AnalysisResult) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
  onBackToAnalyzer: () => void;
}

type RiskFilter = 'ALL' | RiskLevel;

export function HistoryView({
  items,
  isLoading,
  saveToHistory,
  onToggleSaveToHistory,
  onInspectResult,
  onDeleteItem,
  onClearAll,
  onBackToAnalyzer,
}: HistoryViewProps) {
  const [filter, setFilter] = useState<RiskFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmClear, setConfirmClear] = useState(false);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (filter !== 'ALL' && item.classification !== filter) return false;
      if (q && !item.redactedPreview.toLowerCase().includes(q) && !item.summary.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [items, filter, searchQuery]);

  const riskTextClass = (level: RiskLevel) => {
    if (level === 'CRITICAL') return 'text-rose-900 dark:text-rose-300 font-semibold';
    if (level === 'HIGH') return 'text-red-700 dark:text-red-400 font-semibold';
    if (level === 'MEDIUM') return 'text-amber-700 dark:text-amber-400 font-semibold';
    return 'text-emerald-700 dark:text-emerald-400 font-semibold';
  };

  return (
    <section className="py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
            Scan History
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B4C7]">
            Private to your browser session. Sensitive digit sequences are masked before storage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-[#F8FAFC] bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-lg px-3 py-2 cursor-pointer">
            <input
              type="checkbox"
              checked={saveToHistory}
              onChange={(e) => onToggleSaveToHistory(e.target.checked)}
              className="w-3.5 h-3.5 rounded border-slate-300 dark:border-[#273449] dark:bg-[#0B1220] text-blue-600 focus:ring-blue-600"
            />
            <span>Record future scans</span>
          </label>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => exportHistoryToCsv(items)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-[#F8FAFC] bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-[#111827] border border-slate-300 dark:border-[#273449] rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Export CSV</span>
            </button>
          )}

          {items.length > 0 && !confirmClear && (
            <button
              type="button"
              onClick={() => setConfirmClear(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-red-700 dark:text-red-300 bg-white dark:bg-[#172033] hover:bg-red-50 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Clear All History</span>
            </button>
          )}

          {confirmClear && (
            <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg px-3 py-1.5">
              <span className="text-xs font-medium text-red-800 dark:text-red-200">
                Delete all entries?
              </span>
              <button
                type="button"
                onClick={() => {
                  onClearAll();
                  setConfirmClear(false);
                }}
                className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-2.5 py-1 rounded"
              >
                Confirm
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
      </div>

      {!saveToHistory && (
        <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] text-xs text-slate-700 dark:text-[#A7B4C7]">
          <ShieldOff className="w-4 h-4 text-slate-500 dark:text-[#A7B4C7] shrink-0" aria-hidden="true" />
          <span>
            History recording is currently disabled. New message and URL checks will run ephemerally without saving to the database.
          </span>
        </div>
      )}

      {/* Filter & search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div
          role="group"
          aria-label="Filter history by risk classification"
          className="inline-flex items-center gap-1 p-1 bg-slate-200/70 dark:bg-[#111827] border border-transparent dark:border-[#273449] rounded-lg self-start overflow-x-auto"
        >
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RiskFilter[]).map((level) => {
            const active = filter === level;
            return (
              <button
                key={level}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(level)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? 'bg-white dark:bg-[#172033] text-slate-900 dark:text-[#F8FAFC] shadow-xs font-semibold'
                    : 'text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                }`}
              >
                {level === 'ALL' ? 'All Scans' : `${level} Risk`}
              </button>
            );
          })}
        </div>

        <input
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter previews..."
          aria-label="Filter history previews"
          className="w-full sm:w-64 rounded-lg border border-slate-300 dark:border-[#273449] px-3 py-1.5 text-sm bg-white dark:bg-[#0B1220] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
        />
      </div>

      <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3" aria-label="Loading history">
            <div className="h-10 bg-slate-100 dark:bg-[#111827] rounded animate-pulse" />
            <div className="h-10 bg-slate-100 dark:bg-[#111827] rounded animate-pulse" />
            <div className="h-10 bg-slate-100 dark:bg-[#111827] rounded animate-pulse" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="p-10 text-center">
            <Clock className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" aria-hidden="true" />
            <h2 className="mt-3 text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              {items.length === 0 ? 'No analysis history yet' : 'No matching entries'}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#A7B4C7] max-w-md mx-auto">
              {items.length === 0
                ? 'Analyse a suspicious message or URL to see your session history here.'
                : 'Try clearing your search term or switching the risk filter.'}
            </p>
            <button
              type="button"
              onClick={onBackToAnalyzer}
              className="mt-4 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Go to Analyzer
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#273449] bg-slate-50/70 dark:bg-[#111827]/70 text-xs font-semibold text-slate-600 dark:text-[#A7B4C7]">
                  <th className="py-3 px-4">Message / URL Preview</th>
                  <th className="py-3 px-4 whitespace-nowrap">Type</th>
                  <th className="py-3 px-4 whitespace-nowrap">Classification</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Score</th>
                  <th className="py-3 px-4 whitespace-nowrap">Analyzed</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#273449] text-sm">
                {filteredItems.map((item) => {
                  const formatted = new Date(item.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#111827]/50 transition-colors"
                    >
                      <td className="py-3 px-4 max-w-md">
                        <p className="text-slate-900 dark:text-[#F8FAFC] font-medium truncate">
                          {item.redactedPreview}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-[#A7B4C7] truncate">
                          {item.indicatorCount} indicator{item.indicatorCount === 1 ? '' : 's'} detected
                        </p>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-[#A7B4C7] whitespace-nowrap uppercase">
                        {item.mode === 'url' ? 'URL' : item.channel === 'auto' ? 'Message' : item.channel}
                      </td>
                      <td className={`py-3 px-4 text-xs whitespace-nowrap ${riskTextClass(item.classification)}`}>
                        {item.classification} RISK
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-[#F8FAFC] whitespace-nowrap">
                        {item.score}/100
                      </td>
                      <td className="py-3 px-4 text-xs font-mono tabular-nums text-slate-500 dark:text-[#A7B4C7] whitespace-nowrap">
                        {formatted}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onInspectResult(item.result)}
                            aria-label={`View scan details from ${formatted}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteItem(item.id)}
                            aria-label={`Delete history entry from ${formatted}`}
                            className="inline-flex items-center p-1.5 text-slate-400 dark:text-[#A7B4C7] hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
