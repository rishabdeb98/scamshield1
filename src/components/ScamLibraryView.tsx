import { useMemo, useState } from 'react';
import { BookOpen, Clock, HelpCircle, Search, ShieldAlert } from 'lucide-react';
import { SCAM_LIBRARY_EXAMPLES } from '../data/scamLibrary';
import type { RiskLevel, ScamLibraryCategory, ScamLibraryExample } from '../types/scamshield';
import { RedFlagGuide } from './RedFlagGuide';
import { ScamAwarenessQuiz } from './ScamAwarenessQuiz';
import { getCategoryIcon, ScamExampleDetail } from './ScamExampleDetail';
import { getRiskBadgeClasses } from '../utils/riskStyles';

export type LibrarySubTab = 'browse' | 'quiz' | 'red-flags';

interface ScamLibraryViewProps {
  selectedExample: ScamLibraryExample | null;
  activeTab: LibrarySubTab;
  onChangeTab: (tab: LibrarySubTab) => void;
  onOpenExample: (example: ScamLibraryExample) => void;
  onCloseExample: () => void;
  onTryExample: (example: ScamLibraryExample) => void;
  onQuizComplete: (score: number) => void;
  exploredExampleIds: string[];
}

type CategoryFilter = 'ALL' | ScamLibraryCategory;
type RiskFilter = 'ALL' | RiskLevel;
type SortOption = 'highest-risk' | 'recent' | 'alphabetical';

const CATEGORIES: CategoryFilter[] = [
  'ALL',
  'Banking',
  'UPI',
  'Government',
  'Delivery',
  'Job',
  'Financial',
  'Phishing',
];

const RISK_RANK: Record<RiskLevel, number> = {
  CRITICAL: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export function ScamLibraryView({
  selectedExample,
  activeTab,
  onChangeTab,
  onOpenExample,
  onCloseExample,
  onTryExample,
  onQuizComplete,
  exploredExampleIds,
}: ScamLibraryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [riskFilter, setRiskFilter] = useState<RiskFilter>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('highest-risk');

  const recentExamples = useMemo(
    () =>
      [...SCAM_LIBRARY_EXAMPLES]
        .sort((a, b) => b.addedAt.localeCompare(a.addedAt))
        .slice(0, 3),
    [],
  );

  const filteredExamples = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    const list = SCAM_LIBRARY_EXAMPLES.filter((item) => {
      if (categoryFilter !== 'ALL' && item.category !== categoryFilter) return false;
      if (riskFilter !== 'ALL' && item.riskLevel !== riskFilter) return false;
      if (
        q &&
        !item.title.toLowerCase().includes(q) &&
        !item.description.toLowerCase().includes(q) &&
        !item.categoryDisplay.toLowerCase().includes(q) &&
        !item.sampleMessage.toLowerCase().includes(q) &&
        !item.attackTechnique.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'highest-risk') {
        const diff = RISK_RANK[b.riskLevel] - RISK_RANK[a.riskLevel];
        return diff !== 0 ? diff : a.title.localeCompare(b.title);
      }
      if (sortBy === 'recent') {
        return b.addedAt.localeCompare(a.addedAt) || a.title.localeCompare(b.title);
      }
      return a.title.localeCompare(b.title);
    });
  }, [searchQuery, categoryFilter, riskFilter, sortBy]);

  if (selectedExample) {
    return (
      <ScamExampleDetail
        example={selectedExample}
        allExamples={SCAM_LIBRARY_EXAMPLES}
        onBack={onCloseExample}
        onSelectExample={onOpenExample}
        onTryExample={onTryExample}
      />
    );
  }

  return (
    <section className="py-8 space-y-6">
      {/* Page Heading */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
            Scam Library
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-[#A7B4C7] max-w-2xl">
            Explore common digital scams, understand how fraudsters operate, and learn how to protect yourself.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs font-mono tabular-nums text-slate-600 dark:text-[#A7B4C7] shrink-0">
          <span>{SCAM_LIBRARY_EXAMPLES.length} Available Examples</span>
          <span aria-hidden="true">·</span>
          <span>{exploredExampleIds.length} Explored</span>
        </div>
      </div>

      {/* Sub-navigation Tabs */}
      <div
        role="tablist"
        aria-label="Scam Library sections"
        className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-200/70 dark:bg-[#111827] border border-transparent dark:border-[#273449] rounded-lg"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'browse'}
          onClick={() => onChangeTab('browse')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'browse'
              ? 'bg-white dark:bg-[#172033] text-slate-900 dark:text-[#F8FAFC] shadow-xs font-semibold'
              : 'text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Scam Examples ({SCAM_LIBRARY_EXAMPLES.length})</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'quiz'}
          onClick={() => onChangeTab('quiz')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'quiz'
              ? 'bg-white dark:bg-[#172033] text-slate-900 dark:text-[#F8FAFC] shadow-xs font-semibold'
              : 'text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Test Your Scam Awareness</span>
        </button>

        <button
          type="button"
          role="tab"
          aria-selected={activeTab === 'red-flags'}
          onClick={() => onChangeTab('red-flags')}
          className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
            activeTab === 'red-flags'
              ? 'bg-white dark:bg-[#172033] text-slate-900 dark:text-[#F8FAFC] shadow-xs font-semibold'
              : 'text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Red Flag Knowledge Centre</span>
        </button>
      </div>

      {activeTab === 'quiz' && <ScamAwarenessQuiz onQuizComplete={onQuizComplete} />}

      {activeTab === 'red-flags' && <RedFlagGuide />}

      {activeTab === 'browse' && (
        <div className="space-y-6">
          {/* Recently Added Examples */}
          <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-4 sm:p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-[#F8FAFC] mb-3">
              <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>Recently Added Examples</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {recentExamples.map((item) => {
                const Icon = getCategoryIcon(item.category);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onOpenExample(item)}
                    className="text-left p-3 rounded-lg border border-slate-200 dark:border-[#273449] bg-white dark:bg-[#111827]/70 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-[#111827] transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-[#A7B4C7]">
                        <Icon className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
                        <span>{item.category}</span>
                      </span>
                      <span className="text-[11px] font-mono tabular-nums text-slate-400 dark:text-[#64748B]">
                        {item.addedAt}
                      </span>
                    </div>
                    <div className="mt-1 text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate">
                      {item.title}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search, Filters & Sort Controls */}
          <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-4 sm:p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="relative flex-1 max-w-md">
                <Search
                  className="w-4 h-4 text-slate-400 dark:text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search scams by title, keyword, or technique..."
                  aria-label="Search scam library"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-300 dark:border-[#273449] bg-white dark:bg-[#0B1220] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B] focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-[#A7B4C7]">
                  <span className="font-medium">Risk:</span>
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value as RiskFilter)}
                    aria-label="Filter by risk level"
                    className="rounded-lg border border-slate-300 dark:border-[#273449] bg-white dark:bg-[#0B1220] px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                  >
                    <option value="ALL">All Levels</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </label>

                <label className="inline-flex items-center gap-2 text-xs text-slate-600 dark:text-[#A7B4C7]">
                  <span className="font-medium">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    aria-label="Sort scam examples"
                    className="rounded-lg border border-slate-300 dark:border-[#273449] bg-white dark:bg-[#0B1220] px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-[#F8FAFC] focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
                  >
                    <option value="highest-risk">Highest risk first</option>
                    <option value="recent">Recently added</option>
                    <option value="alphabetical">Alphabetical</option>
                  </select>
                </label>
              </div>
            </div>

            {/* Category filter tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div
                role="group"
                aria-label="Filter by scam category"
                className="inline-flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-[#111827] rounded-lg"
              >
                {CATEGORIES.map((cat) => {
                  const active = categoryFilter === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCategoryFilter(cat)}
                      className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                        active
                          ? 'bg-white dark:bg-[#172033] text-slate-900 dark:text-[#F8FAFC] shadow-xs font-semibold'
                          : 'text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                      }`}
                    >
                      {cat === 'ALL' ? 'All Categories' : cat}
                    </button>
                  );
                })}
              </div>

              <span
                aria-live="polite"
                className="text-xs font-mono tabular-nums text-slate-500 dark:text-[#A7B4C7]"
              >
                Showing {filteredExamples.length} of {SCAM_LIBRARY_EXAMPLES.length}
              </span>
            </div>
          </div>

          {/* Card Grid */}
          {filteredExamples.length === 0 ? (
            <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl p-10 text-center">
              <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                No scam examples match your filters
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-[#A7B4C7]">
                Try clearing your search term or resetting the category and risk filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('ALL');
                  setRiskFilter('ALL');
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredExamples.map((example) => {
                const Icon = getCategoryIcon(example.category);
                const isExplored = exploredExampleIds.includes(example.id);
                return (
                  <article
                    key={example.id}
                    className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 flex flex-col justify-between gap-4 hover:border-blue-300 dark:hover:border-blue-500/70 transition-colors"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-[#A7B4C7]">
                          <span className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-900/70 flex items-center justify-center shrink-0">
                            <Icon
                              className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
                              aria-hidden="true"
                            />
                          </span>
                          <span>{example.categoryDisplay}</span>
                        </div>

                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-md border shrink-0 ${getRiskBadgeClasses(
                            example.riskLevel,
                          )}`}
                        >
                          {example.riskLevel}
                        </span>
                      </div>

                      <div>
                        <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                          {example.title}
                        </h2>
                        <p className="mt-1.5 text-xs text-slate-600 dark:text-[#A7B4C7] leading-relaxed line-clamp-3">
                          {example.description}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-[#273449] flex items-center justify-between gap-3">
                      <span className="text-[11px] text-slate-500 dark:text-[#A7B4C7]">
                        {isExplored ? 'Explored' : `Channel: ${example.channel.toUpperCase()}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => onOpenExample(example)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded-lg transition-colors whitespace-nowrap"
                      >
                        View Example
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
