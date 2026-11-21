import { ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { useState } from 'react';
import { RED_FLAG_GUIDE_ITEMS } from '../data/redFlagGuide';

export function RedFlagGuide() {
  const [expandedId, setExpandedId] = useState<string>(RED_FLAG_GUIDE_ITEMS[0]?.id ?? '');

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-[#F8FAFC]">
          Red Flag Knowledge Centre
        </h2>
        <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B4C7]">
          Learn the eight recurring persuasion tactics and structural signals fraudsters use across SMS, WhatsApp, and email.
        </p>
      </div>

      <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs divide-y divide-slate-200 dark:divide-[#273449]">
        {RED_FLAG_GUIDE_ITEMS.map((item, idx) => {
          const isOpen = expandedId === item.id;
          return (
            <div key={item.id}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setExpandedId(isOpen ? '' : item.id)}
                className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left hover:bg-slate-50/70 dark:hover:bg-[#111827]/70 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-xs font-mono tabular-nums font-semibold text-blue-600 dark:text-blue-400 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <ShieldAlert
                    className="w-4 h-4 text-slate-500 dark:text-[#A7B4C7] shrink-0"
                    aria-hidden="true"
                  />
                  <span className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                    {item.title}
                  </span>
                </div>
                {isOpen ? (
                  <ChevronUp
                    className="w-4 h-4 text-slate-500 dark:text-[#A7B4C7] shrink-0"
                    aria-hidden="true"
                  />
                ) : (
                  <ChevronDown
                    className="w-4 h-4 text-slate-500 dark:text-[#A7B4C7] shrink-0"
                    aria-hidden="true"
                  />
                )}
              </button>

              {isOpen && (
                <div className="px-5 pb-5 pt-2 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-slate-50/40 dark:bg-[#111827]/70">
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-[#F8FAFC]">
                        What It Means
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
                        {item.whatItMeans}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-[#F8FAFC]">
                        Why Scammers Use It
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
                        {item.whyScammersUseIt}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-[#F8FAFC]">
                        Simple Example
                      </div>
                      <p className="mt-1 text-xs font-mono text-slate-800 dark:text-[#F8FAFC] bg-white dark:bg-[#0B1220] border border-slate-200 dark:border-[#273449] rounded-lg p-2.5 leading-relaxed">
                        {item.simpleExample}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-800 dark:text-[#F8FAFC]">
                        How to Recognise It
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
                        {item.howToRecogniseIt}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
