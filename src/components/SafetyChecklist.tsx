import { CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { SECURITY_CHECKLIST_ITEMS } from '../data/safetyCenter';

const CHECKLIST_STORAGE_KEY = 'scamshield_safety_checklist';

function loadSavedChecklist(): string[] {
  try {
    const raw = window.localStorage.getItem(CHECKLIST_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const validIds = new Set(SECURITY_CHECKLIST_ITEMS.map((item) => item.id));
    return parsed.filter((id): id is string => typeof id === 'string' && validIds.has(id));
  } catch {
    return [];
  }
}

export function SafetyChecklist() {
  const [checkedIds, setCheckedIds] = useState<string[]>(() => loadSavedChecklist());

  useEffect(() => {
    try {
      window.localStorage.setItem(CHECKLIST_STORAGE_KEY, JSON.stringify(checkedIds));
    } catch {
      // Ignore storage failures in sandboxed browsers
    }
  }, [checkedIds]);

  const totalCount = SECURITY_CHECKLIST_ITEMS.length;
  const completedCount = checkedIds.length;
  const completionPct = Math.round((completedCount / totalCount) * 100);
  const allCompleted = completedCount === totalCount;

  const toggleItem = (id: string) => {
    setCheckedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleReset = () => {
    setCheckedIds([]);
  };

  return (
    <section
      id="safety-checklist"
      aria-label="Quick Security Checklist"
      className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6 space-y-5"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#273449]">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
            How Secure Are You Online?
          </h2>
          <p className="mt-1 text-xs text-slate-600 dark:text-[#A7B4C7]">
            Personal habit self-assessment checklist (saved locally in your browser; not a technical
            or scientific security score).
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <div className="text-lg font-bold font-mono tabular-nums text-slate-900 dark:text-[#F8FAFC]">
              {completionPct}%
            </div>
            <div className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-[#A7B4C7]">
              {completedCount} of {totalCount} completed
            </div>
          </div>

          <button
            type="button"
            onClick={handleReset}
            disabled={completedCount === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 dark:border-[#273449] rounded-lg transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div>
        <div
          className="w-full h-2.5 bg-slate-100 dark:bg-[#0B1220] border border-slate-200 dark:border-[#273449] rounded-full overflow-hidden"
          role="progressbar"
          aria-valuenow={completionPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Checklist self-assessment completion ${completionPct}%`}
        >
          <div
            className={`h-full transition-all duration-300 ${
              allCompleted ? 'bg-emerald-600 dark:bg-emerald-500' : 'bg-blue-600 dark:bg-blue-500'
            }`}
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {allCompleted && (
        <div
          role="status"
          className="flex items-start gap-3 px-4 py-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/70 text-xs text-emerald-900 dark:text-emerald-200"
        >
          <ShieldCheck
            className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <div>
            <p className="font-semibold">
              Great habits! You have ticked all eight self-assessment items.
            </p>
            <p className="mt-0.5 text-emerald-800 dark:text-emerald-300">
              Keep reviewing your account permissions and software updates regularly—completing this
              checklist supports good habits, though no checklist alone guarantees device security.
            </p>
          </div>
        </div>
      )}

      {/* Checklist items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {SECURITY_CHECKLIST_ITEMS.map((item) => {
          const checked = checkedIds.includes(item.id);
          return (
            <label
              key={item.id}
              className={`flex items-start gap-3 p-3.5 rounded-lg border cursor-pointer transition-colors ${
                checked
                  ? 'bg-blue-50/60 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800/70'
                  : 'bg-slate-50/70 dark:bg-[#111827] border-slate-200 dark:border-[#273449] hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => toggleItem(item.id)}
                className="mt-0.5 w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-600 shrink-0"
              />
              <span
                className={`text-sm leading-snug ${
                  checked
                    ? 'text-slate-900 dark:text-[#F8FAFC] font-medium'
                    : 'text-slate-700 dark:text-[#A7B4C7]'
                }`}
              >
                {item.label}
              </span>
              {checked && (
                <CheckCircle2
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 ml-auto mt-0.5 shrink-0"
                  aria-hidden="true"
                />
              )}
            </label>
          );
        })}
      </div>
    </section>
  );
}
