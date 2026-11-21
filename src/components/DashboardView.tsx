import { useMemo, useState } from 'react';
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Award,
  BookOpen,
  CheckCircle2,
  Download,
  Eye,
  HelpCircle,
  Link2,
  MessageSquareText,
  Percent,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import { SCAM_LIBRARY_EXAMPLES } from '../data/scamLibrary';
import type {
  ActiveView,
  AnalysisResult,
  AwarenessProgress,
  HistoryItem,
  RiskLevel,
} from '../types/scamshield';
import {
  buildSamplePreviewItems,
  computeOverviewStats,
  computeThreatCategories,
  exportHistoryToCsv,
  generateThreatSummary,
  RISK_TIERS,
} from '../utils/analytics';
import { DashboardCharts } from './DashboardCharts';
import { getQuizRankLabel } from './ScamAwarenessQuiz';
import type { LibrarySubTab } from './ScamLibraryView';
import { getRiskBadgeClasses, getRiskLabel } from '../utils/riskStyles';

interface DashboardViewProps {
  historyItems: HistoryItem[];
  isLoadingHistory: boolean;
  awarenessProgress: AwarenessProgress;
  isQuickVerifying: boolean;
  onQuickVerify: (rawInput: string) => Promise<void>;
  onNavigate: (view: ActiveView) => void;
  onOpenLibraryTab: (tab: LibrarySubTab) => void;
  onInspectResult: (result: AnalysisResult) => void;
}

type RiskFilter = 'ALL' | RiskLevel;

export function DashboardView({
  historyItems,
  isLoadingHistory,
  awarenessProgress,
  isQuickVerifying,
  onQuickVerify,
  onNavigate,
  onOpenLibraryTab,
  onInspectResult,
}: DashboardViewProps) {
  const [recentFilter, setRecentFilter] = useState<RiskFilter>('ALL');
  const [recentSearch, setRecentSearch] = useState('');
  const [showSamplePreview, setShowSamplePreview] = useState(false);
  const [quickInput, setQuickInput] = useState('');
  const [quickError, setQuickError] = useState<string | null>(null);

  const hasAwarenessActivity =
    awarenessProgress.exploredExampleIds.length > 0 || awarenessProgress.quizAttempts > 0;
  const bestQuizRank =
    awarenessProgress.bestQuizScore !== null
      ? getQuizRankLabel(awarenessProgress.bestQuizScore)
      : null;

  const isPreviewMode = historyItems.length === 0 && showSamplePreview;
  const activeDataset = useMemo(
    () => (isPreviewMode ? buildSamplePreviewItems() : historyItems),
    [isPreviewMode, historyItems],
  );

  const stats = useMemo(() => computeOverviewStats(activeDataset), [activeDataset]);
  const threatCategories = useMemo(() => computeThreatCategories(activeDataset), [activeDataset]);
  const threatSummary = useMemo(
    () => generateThreatSummary(activeDataset, stats),
    [activeDataset, stats],
  );

  const filteredRecent = useMemo(() => {
    const q = recentSearch.trim().toLowerCase();
    return activeDataset
      .map((item, index) => ({
        item,
        scanId: `SCAN-${String(activeDataset.length - index).padStart(3, '0')}`,
      }))
      .filter(({ item, scanId }) => {
        if (recentFilter !== 'ALL' && item.classification !== recentFilter) return false;
        if (
          q &&
          !item.redactedPreview.toLowerCase().includes(q) &&
          !scanId.toLowerCase().includes(q) &&
          !item.summary.toLowerCase().includes(q)
        ) {
          return false;
        }
        return true;
      })
      .slice(0, 8);
  }, [activeDataset, recentFilter, recentSearch]);

  const currentDateLabel = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const lastScanLabel = stats.lastScanAt
    ? new Date(stats.lastScanAt).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'No scans yet';

  const jumpToRecentWithFilter = (filter: RiskFilter) => {
    setRecentFilter(filter);
    document.getElementById('recent-scans-section')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  const statCards = [
    {
      id: 'total',
      label: 'Total Scans',
      value: stats.totalScans.toLocaleString(),
      description: 'Messages and URLs analysed',
      delta: stats.periodDelta.totalDiffPct,
      icon: Activity,
      iconClass: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60',
      onClick: () => jumpToRecentWithFilter('ALL'),
    },
    {
      id: 'high',
      label: 'High Risk',
      value: stats.highAndCriticalCount.toLocaleString(),
      description: `${stats.criticalCount} critical · ${stats.highCount} high`,
      delta: stats.periodDelta.highRiskDiffPct,
      icon: AlertOctagon,
      iconClass: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/60',
      onClick: () =>
        jumpToRecentWithFilter(
          stats.criticalCount > 0 && stats.highCount === 0 ? 'CRITICAL' : 'HIGH',
        ),
    },
    {
      id: 'medium',
      label: 'Medium Risk',
      value: stats.mediumCount.toLocaleString(),
      description: 'Suspicious indicators detected',
      delta: null,
      icon: AlertTriangle,
      iconClass: 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60',
      onClick: () => jumpToRecentWithFilter('MEDIUM'),
    },
    {
      id: 'low',
      label: 'Low Risk',
      value: stats.lowCount.toLocaleString(),
      description: 'Relatively safe indicators',
      delta: null,
      icon: CheckCircle2,
      iconClass: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60',
      onClick: () => jumpToRecentWithFilter('LOW'),
    },
    {
      id: 'urls',
      label: 'Suspicious URLs',
      value: stats.suspiciousUrlsCount.toLocaleString(),
      description: 'Flagged across link & text scans',
      delta: null,
      icon: Link2,
      iconClass: 'text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800',
      onClick: () => onNavigate('url-scanner'),
    },
    {
      id: 'rate',
      label: 'Threat Detection Rate',
      value: `${stats.threatDetectionRate}%`,
      description: 'Medium, high & critical share',
      delta: null,
      icon: Percent,
      iconClass: 'text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60',
      onClick: () => onNavigate('history'),
    },
  ];

  const totalForBar = Math.max(1, stats.totalScans);
  const tierPercentages = RISK_TIERS.map((tier) => {
    const count =
      tier.level === 'LOW'
        ? stats.lowCount
        : tier.level === 'MEDIUM'
          ? stats.mediumCount
          : tier.level === 'HIGH'
            ? stats.highCount
            : stats.criticalCount;
    return {
      ...tier,
      count,
      widthPct: stats.totalScans > 0 ? (count / totalForBar) * 100 : 0,
    };
  });

  return (
    <div className="py-8 space-y-8">
      {/* 1. Welcome Section & Security Health */}
      <section className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
            Security Overview
          </h1>
          <p className="mt-1.5 text-sm sm:text-base text-slate-600 dark:text-[#A7B4C7]">
            Monitor suspicious messages, phishing attempts and potential digital threats.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-[#A7B4C7] font-mono tabular-nums">
            <span>{currentDateLabel}</span>
            <span aria-hidden="true">·</span>
            <span>Last scan: {lastScanLabel}</span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 font-sans font-semibold text-emerald-700 dark:text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              Detection Engine: Active
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          {historyItems.length === 0 && (
            <button
              type="button"
              onClick={() => setShowSamplePreview((prev) => !prev)}
              className="px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-[#273449] rounded-lg transition-colors whitespace-nowrap"
            >
              {showSamplePreview ? 'Exit Sample Preview' : 'Preview Sample Data'}
            </button>
          )}
          <button
            type="button"
            disabled={activeDataset.length === 0}
            onClick={() => exportHistoryToCsv(activeDataset)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-300 dark:border-[#273449] rounded-lg transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Export CSV</span>
          </button>
        </div>
      </section>

      {/* Instant Quick Verify Bar (zero-friction entry) */}
      <section
        aria-label="Instant Quick Verify"
        className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6 space-y-3"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Instant Verify — Message or Link
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#A7B4C7] mt-0.5">
              Paste any suspicious SMS, WhatsApp forward, or standalone URL—ScamShield automatically chooses message or link inspection.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500 dark:text-[#A7B4C7]">
            Zero-click safe parsing
          </span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const trimmed = quickInput.trim();
            if (!trimmed) {
              setQuickError('Paste a suspicious SMS, WhatsApp message, or URL to verify.');
              return;
            }
            setQuickError(null);
            void onQuickVerify(trimmed);
          }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <label htmlFor="dashboard-quick-verify" className="sr-only">
            Paste suspicious message or link
          </label>
          <input
            id="dashboard-quick-verify"
            type="text"
            value={quickInput}
            onChange={(e) => {
              setQuickInput(e.target.value);
              if (quickError) setQuickError(null);
            }}
            placeholder="e.g. Urgent: Your SBI KYC is blocked today http://... or https://bit.ly/..."
            className="flex-1 rounded-lg border border-slate-300 dark:border-[#273449] px-3.5 py-2.5 text-sm text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 bg-slate-50/50 dark:bg-[#0B1220] focus:outline-none focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/15"
          />
          <button
            type="submit"
            disabled={isQuickVerifying}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 disabled:bg-blue-400 dark:disabled:bg-blue-800 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            <span>{isQuickVerifying ? 'Verifying...' : 'Verify Now'}</span>
          </button>
        </form>

        {quickError && (
          <p role="alert" className="text-xs text-red-700 dark:text-red-400 font-medium">
            {quickError}
          </p>
        )}
      </section>

      {/* Clearly-labeled Sample Preview Banner */}
      {isPreviewMode && (
        <div
          role="status"
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-xs text-amber-900 dark:text-amber-200"
        >
          <span>
            <strong>Sample / Demo Preview Active:</strong> Displaying illustrative sample data. Your
            actual scan history is separate and currently empty—run a scan to record real threats.
          </span>
          <button
            type="button"
            onClick={() => onNavigate('message-scanner')}
            className="font-semibold text-amber-900 dark:text-amber-200 underline hover:no-underline whitespace-nowrap"
          >
            Run Real Scan
          </button>
        </div>
      )}

      {/* Auto-generated Threat Summary */}
      <section
        aria-label="Threat Summary"
        className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
      >
        <div className="flex items-start sm:items-center gap-3">
          <ShieldAlert
            className={`w-5 h-5 shrink-0 ${
              stats.highAndCriticalCount > 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
            aria-hidden="true"
          />
          <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
            {threatSummary}
          </p>
        </div>
        {stats.highAndCriticalCount > 0 && (
          <button
            type="button"
            onClick={() => jumpToRecentWithFilter(stats.criticalCount > 0 ? 'CRITICAL' : 'HIGH')}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 whitespace-nowrap shrink-0 self-start sm:self-center"
          >
            Review flagged scans →
          </button>
        )}
      </section>

      {/* 2. Six Interactive Overview Statistic Cards */}
      <section
        aria-label="Overview Statistics"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4"
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <button
              key={card.id}
              type="button"
              onClick={card.onClick}
              className="text-left bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] hover:border-blue-300 dark:hover:border-blue-500 rounded-xl shadow-xs p-4 transition-colors flex flex-col justify-between gap-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <div className="flex items-center justify-between gap-2 w-full">
                <span className="text-xs font-semibold text-slate-600 dark:text-[#A7B4C7] truncate">
                  {card.label}
                </span>
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${card.iconClass}`}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                </span>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-bold font-mono tabular-nums text-slate-900 dark:text-[#F8FAFC]">
                  {card.value}
                </div>
                <div className="mt-1 flex items-center justify-between gap-1 text-[11px] text-slate-500 dark:text-[#A7B4C7]">
                  <span className="truncate">{card.description}</span>
                  {card.delta !== null && (
                    <span
                      className={`font-mono tabular-nums font-semibold shrink-0 ${
                        card.delta > 0
                          ? 'text-red-600 dark:text-red-400'
                          : 'text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      {card.delta > 0 ? `+${card.delta}%` : `${card.delta}%`}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* 3. Quick Scan Section */}
      <section aria-label="Quick Scan Actions" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60 flex items-center justify-center shrink-0">
              <MessageSquareText
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                aria-hidden="true"
              />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                Message Scanner
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B4C7]">
                Analyse SMS, WhatsApp messages and emails.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('message-scanner')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <span>Scan a Message</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] flex items-center justify-center shrink-0">
              <Link2 className="w-5 h-5 text-slate-800 dark:text-slate-200" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                URL Scanner
              </h2>
              <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B4C7]">
                Check suspicious links before opening them.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('url-scanner')}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-white bg-slate-900 dark:bg-blue-600 hover:bg-slate-800 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <span>Analyse a URL</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </section>

      {/* 3b. Your Scam Awareness */}
      <section
        aria-label="Your Scam Awareness"
        className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6 space-y-5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-[#273449]">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Your Scam Awareness
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#A7B4C7] mt-0.5">
              Real activity tracked from Scam Library examples explored and awareness quiz attempts
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onOpenLibraryTab('browse')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-[#273449] rounded-lg transition-colors whitespace-nowrap"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>Scam Library</span>
            </button>
            <button
              type="button"
              onClick={() => onOpenLibraryTab('quiz')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap"
            >
              <HelpCircle className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Test Awareness</span>
            </button>
          </div>
        </div>

        {!hasAwarenessActivity ? (
          <div className="py-6 px-4 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] text-center space-y-3">
            <Award className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" aria-hidden="true" />
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                No scam awareness activity recorded yet
              </p>
              <p className="text-xs text-slate-600 dark:text-[#A7B4C7] max-w-lg mx-auto leading-relaxed">
                Explore real-world Indian scam case studies or complete the 10-question awareness quiz
                to track examples reviewed, categories covered, and your best score here.
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
              <button
                type="button"
                onClick={() => onOpenLibraryTab('browse')}
                className="px-4 py-2 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors"
              >
                Explore {SCAM_LIBRARY_EXAMPLES.length} Scam Examples
              </button>
              <button
                type="button"
                onClick={() => onOpenLibraryTab('quiz')}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-[#273449] rounded-lg transition-colors"
              >
                Start 10-Question Quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449]">
              <div className="text-xs font-medium text-slate-500 dark:text-[#A7B4C7]">
                Examples Explored
              </div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-[#F8FAFC]">
                {awarenessProgress.exploredExampleIds.length}
                <span className="text-sm font-normal text-slate-500 dark:text-[#A7B4C7]">
                  {' '}
                  / {SCAM_LIBRARY_EXAMPLES.length}
                </span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500 dark:text-[#A7B4C7]">
                Case studies opened
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449]">
              <div className="text-xs font-medium text-slate-500 dark:text-[#A7B4C7]">
                Quiz Attempts
              </div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-[#F8FAFC]">
                {awarenessProgress.quizAttempts}
              </div>
              <div className="mt-1 text-[11px] text-slate-500 dark:text-[#A7B4C7]">
                Completed 10-question runs
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449]">
              <div className="text-xs font-medium text-slate-500 dark:text-[#A7B4C7]">
                Best Quiz Score
              </div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-[#F8FAFC]">
                {awarenessProgress.bestQuizScore !== null
                  ? `${awarenessProgress.bestQuizScore}/100`
                  : '—'}
              </div>
              <div className="mt-1 text-[11px] text-slate-600 dark:text-slate-300 font-medium">
                {bestQuizRank ? bestQuizRank.rank : 'No quiz taken yet'}
              </div>
            </div>

            <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449]">
              <div className="text-xs font-medium text-slate-500 dark:text-[#A7B4C7]">
                Scam Categories Explored
              </div>
              <div className="mt-1 text-2xl font-bold font-mono tabular-nums text-slate-900 dark:text-[#F8FAFC]">
                {awarenessProgress.exploredCategories.length}
                <span className="text-sm font-normal text-slate-500 dark:text-[#A7B4C7]"> / 7</span>
              </div>
              <div className="mt-1 text-[11px] text-slate-500 dark:text-[#A7B4C7] truncate">
                {awarenessProgress.exploredCategories.length > 0
                  ? awarenessProgress.exploredCategories.join(', ')
                  : 'None yet'}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 4. Analytics Charts Section */}
      <DashboardCharts
        items={activeDataset}
        stats={stats}
        onSelectRiskFilter={(level) => jumpToRecentWithFilter(level)}
      />

      {/* 5. Threat Intelligence + Risk Classification Legend */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Detected Threat Categories (7 cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6">
          <div className="flex items-baseline justify-between gap-2 pb-4 border-b border-slate-100 dark:border-[#273449]">
            <div>
              <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                Detected Threat Categories
              </h2>
              <p className="text-xs text-slate-500 dark:text-[#A7B4C7] mt-0.5">
                Calculated from stored scan indicators and URL detections
              </p>
            </div>
            <span className="text-xs font-mono tabular-nums text-slate-500 dark:text-[#A7B4C7]">
              {activeDataset.length} scan{activeDataset.length === 1 ? '' : 's'} indexed
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {threatCategories.map((cat) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-200">{cat.name}</span>
                  <span className="font-mono tabular-nums text-slate-600 dark:text-[#A7B4C7]">
                    {cat.count} detection{cat.count === 1 ? '' : 's'}
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-[#0B1220] rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${
                      cat.count > 0
                        ? 'bg-blue-600 dark:bg-blue-500'
                        : 'bg-slate-200 dark:bg-[#273449]'
                    }`}
                    style={{ width: `${cat.count > 0 ? Math.max(6, cat.percentage) : 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Classification System & Legend (5 cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6 flex flex-col justify-between space-y-5">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Risk Classification System
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#A7B4C7] mt-0.5">
              Visual distribution bar and score legend (0–100)
            </p>

            {/* Visual risk distribution bar */}
            <div className="mt-4">
              <div
                className="w-full h-3 bg-slate-100 dark:bg-[#0B1220] rounded-full overflow-hidden flex"
                aria-label="Visual risk distribution bar"
              >
                {stats.totalScans > 0 ? (
                  tierPercentages.map(
                    (tier) =>
                      tier.count > 0 && (
                        <div
                          key={tier.level}
                          className={`h-full ${tier.barClass}`}
                          style={{ width: `${tier.widthPct}%` }}
                          title={`${tier.title}: ${tier.count}`}
                        />
                      ),
                  )
                ) : (
                  <div className="h-full w-full bg-slate-200 dark:bg-[#273449]" />
                )}
              </div>
            </div>

            {/* 4-tier legend */}
            <div className="mt-4 divide-y divide-slate-100 dark:divide-[#273449]">
              {tierPercentages.map((tier) => (
                <div key={tier.level} className="py-2.5 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5 min-w-0">
                    <span
                      className={`mt-0.5 w-2.5 h-2.5 rounded-xs shrink-0 ${tier.barClass}`}
                      aria-hidden="true"
                    />
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        <span className="font-mono tabular-nums mr-1.5">{tier.range}</span>
                        <span className={tier.textClass}>{tier.title}</span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-[#A7B4C7]">{tier.status}</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-200 shrink-0">
                    {tier.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-[#A7B4C7] bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] rounded-lg px-3.5 py-2.5 leading-relaxed">
            <strong className="text-slate-800 dark:text-slate-200">Important:</strong> A low-risk
            score does not guarantee that a message or website is safe. Always verify financial or
            credential requests via official channels.
          </p>
        </div>
      </section>

      {/* 6. Recent Scan Activity Table */}
      <section
        id="recent-scans-section"
        aria-label="Recent Scans"
        className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs overflow-hidden"
      >
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-[#273449] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Recent Scans
            </h2>
            <p className="text-xs text-slate-500 dark:text-[#A7B4C7] mt-0.5">
              Click any scan or View details to inspect its full explainable breakdown
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search
                className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="search"
                value={recentSearch}
                onChange={(e) => setRecentSearch(e.target.value)}
                placeholder="Search scans..."
                aria-label="Search recent scans"
                className="pl-8 pr-3 py-1.5 w-48 sm:w-56 text-xs rounded-lg border border-slate-300 dark:border-[#273449] bg-white dark:bg-[#0B1220] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-600 dark:focus:border-blue-500"
              />
            </div>

            <div
              role="group"
              aria-label="Filter recent scans by risk level"
              className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#111827] border border-transparent dark:border-[#273449] rounded-lg overflow-x-auto"
            >
              {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as RiskFilter[]).map((level) => {
                const active = recentFilter === level;
                return (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setRecentFilter(level)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                      active
                        ? 'bg-white dark:bg-[#172033] text-slate-900 dark:text-[#F8FAFC] shadow-xs font-semibold'
                        : 'text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                    }`}
                  >
                    {level === 'ALL' ? 'All' : getRiskLabel(level)}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              onClick={() => onNavigate('history')}
              className="px-3 py-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              View all history
            </button>
          </div>
        </div>

        {isLoadingHistory && historyItems.length === 0 ? (
          <div className="p-6 space-y-3" aria-label="Loading recent scans">
            <div className="h-10 bg-slate-100 dark:bg-[#111827] rounded animate-pulse" />
            <div className="h-10 bg-slate-100 dark:bg-[#111827] rounded animate-pulse" />
            <div className="h-10 bg-slate-100 dark:bg-[#111827] rounded animate-pulse" />
          </div>
        ) : activeDataset.length === 0 ? (
          <div className="p-10 text-center">
            <ShieldCheck
              className="w-9 h-9 text-slate-300 dark:text-slate-600 mx-auto"
              aria-hidden="true"
            />
            <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              No scans recorded yet
            </h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-[#A7B4C7] max-w-md mx-auto">
              Analyse an SMS, WhatsApp message, email, or suspicious URL to see real-time risk
              telemetry and recent activity here.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => onNavigate('message-scanner')}
                className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors"
              >
                Perform First Scan
              </button>
              <button
                type="button"
                onClick={() => setShowSamplePreview(true)}
                className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-[#273449] rounded-lg transition-colors"
              >
                Preview Sample Dashboard
              </button>
            </div>
          </div>
        ) : filteredRecent.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-500 dark:text-[#A7B4C7]">
            No recent scans match your current filter.{' '}
            <button
              type="button"
              onClick={() => {
                setRecentFilter('ALL');
                setRecentSearch('');
              }}
              className="text-blue-600 dark:text-blue-400 font-semibold hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#273449] bg-slate-50/70 dark:bg-[#111827] text-xs font-semibold text-slate-600 dark:text-[#A7B4C7]">
                  <th className="py-3 px-4 whitespace-nowrap">Scan ID</th>
                  <th className="py-3 px-4">Message / URL</th>
                  <th className="py-3 px-4 whitespace-nowrap">Scan Type</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Risk Score</th>
                  <th className="py-3 px-4 whitespace-nowrap">Risk Level</th>
                  <th className="py-3 px-4 whitespace-nowrap">Date and Time</th>
                  <th className="py-3 px-4 text-right whitespace-nowrap">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#273449] text-sm">
                {filteredRecent.map(({ item, scanId }) => {
                  const formatted = new Date(item.createdAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  });
                  return (
                    <tr
                      key={item.id}
                      onClick={() => onInspectResult(item.result)}
                      className="hover:bg-slate-50/90 dark:hover:bg-[#111827]/70 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 text-xs font-mono tabular-nums font-semibold text-slate-700 dark:text-slate-200 whitespace-nowrap">
                        {scanId}
                      </td>
                      <td className="py-3 px-4 max-w-sm">
                        <p className="text-slate-900 dark:text-[#F8FAFC] font-medium truncate">
                          {item.redactedPreview}
                        </p>
                      </td>
                      <td className="py-3 px-4 text-xs text-slate-600 dark:text-[#A7B4C7] whitespace-nowrap">
                        {item.mode === 'url' ? 'URL' : 'Message'}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-slate-900 dark:text-[#F8FAFC] whitespace-nowrap">
                        {item.score}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border ${getRiskBadgeClasses(
                            item.classification,
                          )}`}
                        >
                          {getRiskLabel(item.classification)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-xs font-mono tabular-nums text-slate-500 dark:text-[#A7B4C7] whitespace-nowrap">
                        {formatted}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectResult(item.result);
                          }}
                          aria-label={`View details for ${scanId}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 rounded-md transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>View details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
