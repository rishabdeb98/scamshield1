import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Globe,
  Info,
  Lock,
  LockOpen,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import type {
  AnalysisResult,
  HighlightSegment,
  IndicatorItem,
  LibraryTrialContext,
  RiskLevel,
} from '../types/scamshield';

interface ResultsPanelProps {
  result: AnalysisResult;
  trialContext?: LibraryTrialContext | null;
  onReturnToLibrary?: () => void;
  onOpenSafetyCenter?: () => void;
}

function getRiskPresentation(level: RiskLevel) {
  if (level === 'CRITICAL') {
    return {
      label: 'CRITICAL RISK',
      surfaceClass:
        'bg-rose-100 border-rose-300 dark:bg-rose-950/50 dark:border-rose-800/70',
      textClass: 'text-rose-900 dark:text-rose-200',
      barClass: 'bg-rose-800 dark:bg-rose-500',
      Icon: ShieldAlert,
    };
  }
  if (level === 'HIGH') {
    return {
      label: 'HIGH RISK',
      surfaceClass: 'bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800/70',
      textClass: 'text-red-700 dark:text-red-300',
      barClass: 'bg-red-600 dark:bg-red-500',
      Icon: ShieldAlert,
    };
  }
  if (level === 'MEDIUM') {
    return {
      label: 'MEDIUM RISK',
      surfaceClass: 'bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/70',
      textClass: 'text-amber-700 dark:text-amber-300',
      barClass: 'bg-amber-500',
      Icon: AlertTriangle,
    };
  }
  return {
    label: 'LOW RISK',
    surfaceClass:
      'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800/70',
    textClass: 'text-emerald-700 dark:text-emerald-300',
    barClass: 'bg-emerald-600 dark:bg-emerald-500',
    Icon: CheckCircle2,
  };
}

const HIGHLIGHT_STYLES: Record<
  IndicatorItem['category'],
  { className: string; legendLabel: string; dotClass: string }
> = {
  credential: {
    className:
      'bg-rose-100 dark:bg-rose-950/70 text-rose-950 dark:text-rose-100 border-b-2 border-rose-500 dark:border-rose-400 rounded-xs px-1 py-0.5 font-medium',
    legendLabel: 'Credential / Remote Access',
    dotClass: 'bg-rose-500',
  },
  url: {
    className:
      'bg-red-100 dark:bg-red-950/70 text-red-950 dark:text-red-100 border-b-2 border-red-500 dark:border-red-400 rounded-xs px-1 py-0.5 font-mono text-[13px]',
    legendLabel: 'Suspicious URL',
    dotClass: 'bg-red-500',
  },
  urgency: {
    className:
      'bg-amber-100 dark:bg-amber-950/70 text-amber-950 dark:text-amber-100 border-b-2 border-amber-500 dark:border-amber-400 rounded-xs px-1 py-0.5 font-medium',
    legendLabel: 'Urgency / Coercion',
    dotClass: 'bg-amber-500',
  },
  financial: {
    className:
      'bg-orange-100 dark:bg-orange-950/70 text-orange-950 dark:text-orange-100 border-b-2 border-orange-500 dark:border-orange-400 rounded-xs px-1 py-0.5 font-medium',
    legendLabel: 'Financial / UPI / Fee',
    dotClass: 'bg-orange-500',
  },
  impersonation: {
    className:
      'bg-indigo-100 dark:bg-indigo-950/70 text-indigo-950 dark:text-indigo-100 border-b-2 border-indigo-500 dark:border-indigo-400 rounded-xs px-1 py-0.5 font-medium',
    legendLabel: 'Brand / Authority Claim',
    dotClass: 'bg-indigo-500',
  },
  reward: {
    className:
      'bg-purple-100 dark:bg-purple-950/70 text-purple-950 dark:text-purple-100 border-b-2 border-purple-500 dark:border-purple-400 rounded-xs px-1 py-0.5 font-medium',
    legendLabel: 'Prize / Job / Return Lure',
    dotClass: 'bg-purple-500',
  },
  delivery: {
    className:
      'bg-sky-100 dark:bg-sky-950/70 text-sky-950 dark:text-sky-100 border-b-2 border-sky-500 dark:border-sky-400 rounded-xs px-1 py-0.5 font-medium',
    legendLabel: 'Delivery / Customs Lure',
    dotClass: 'bg-sky-500',
  },
  context: {
    className:
      'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-100 border-b-2 border-slate-500 rounded-xs px-1 py-0.5',
    legendLabel: 'Obfuscation',
    dotClass: 'bg-slate-500',
  },
};

function renderHighlightSegments(segments: HighlightSegment[]) {
  return segments.map((seg, idx) => {
    if (!seg.category) {
      return <span key={idx}>{seg.text}</span>;
    }
    const style = HIGHLIGHT_STYLES[seg.category];
    return (
      <mark
        key={idx}
        title={seg.label ?? style.legendLabel}
        className={style.className}
      >
        {seg.text}
      </mark>
    );
  });
}

export function ResultsPanel({
  result,
  trialContext,
  onReturnToLibrary,
  onOpenSafetyCenter,
}: ResultsPanelProps) {
  const presentation = getRiskPresentation(result.classification);
  const { Icon } = presentation;
  const formattedTime = new Date(result.analyzedAt).toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const hasDiscrepancy =
    trialContext !== null &&
    trialContext !== undefined &&
    trialContext.expectedRisk !== result.classification;

  const segments = result.highlightedSegments ?? [];
  const hasHighlightedTokens = segments.some((s) => Boolean(s.category));
  const activeHighlightCategories = Array.from(
    new Set(
      segments
        .map((s) => s.category)
        .filter((c): c is IndicatorItem['category'] => Boolean(c)),
    ),
  );
  const verifiedHints = result.verifiedBrandHints ?? [];

  return (
    <section
      id="analysis-results"
      aria-live="polite"
      aria-label="Analysis Results"
      className="mt-8 bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs overflow-hidden"
    >
      {/* Scam Library Trial Context Banner */}
      {trialContext && (
        <div
          className={`px-5 sm:px-6 py-3.5 border-b text-xs ${
            hasDiscrepancy
              ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/70 text-amber-950 dark:text-amber-200'
              : 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/70 text-slate-800 dark:text-slate-200'
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                Scam Library Live Engine Trial: {trialContext.exampleTitle}
              </div>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-mono tabular-nums">
                <span>
                  Library reference: <strong>{trialContext.expectedRisk}</strong>
                </span>
                <span aria-hidden="true">·</span>
                <span>
                  Actual engine output: <strong>{result.classification}</strong> ({result.score}/100)
                </span>
              </div>
            </div>

            {onReturnToLibrary && (
              <button
                type="button"
                onClick={onReturnToLibrary}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-white dark:bg-[#111827] hover:bg-blue-50 dark:hover:bg-slate-800 border border-blue-200 dark:border-[#273449] rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Return to Scam Library</span>
              </button>
            )}
          </div>

          {hasDiscrepancy ? (
            <p className="mt-2 leading-relaxed text-amber-900 dark:text-amber-200">
              <strong>Calibration Note:</strong> The Scam Library labels this case study as{' '}
              <strong>{trialContext.expectedRisk}</strong>, while the live heuristic engine scored
              it <span className="font-mono font-semibold">{result.score}/100</span> (
              <strong>{result.classification}</strong>) based on the specific signals present in this
              sample.
            </p>
          ) : (
            <p className="mt-1.5 text-slate-600 dark:text-[#A7B4C7]">
              Live detection engine classification matches the Scam Library educational reference.
            </p>
          )}
        </div>
      )}

      {/* Top risk summary band */}
      <div className={`px-5 sm:px-6 py-5 border-b ${presentation.surfaceClass}`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-[#A7B4C7]">
              <span>{result.mode === 'url' ? 'URL Inspection' : 'Message Analysis'}</span>
              {result.channel && result.channel !== 'auto' && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="uppercase">{result.channel}</span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span className="font-mono tabular-nums">{formattedTime}</span>
              <span aria-hidden="true">·</span>
              <span>
                {result.savedToHistory ? 'Saved to session history' : 'Not saved (history disabled)'}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              <Icon className={`w-6 h-6 shrink-0 ${presentation.textClass}`} aria-hidden="true" />
              <h2 className={`text-xl font-bold tracking-tight ${presentation.textClass}`}>
                {presentation.label}
              </h2>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-200 max-w-2xl leading-relaxed">
              {result.summary}
            </p>
          </div>

          {/* Score meter */}
          <div className="md:w-60 shrink-0">
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-xs font-medium text-slate-600 dark:text-[#A7B4C7]">
                Risk Score
              </span>
              <span className={`text-2xl font-bold font-mono tabular-nums ${presentation.textClass}`}>
                {result.score}
                <span className="text-sm font-normal text-slate-500 dark:text-[#A7B4C7]">/100</span>
              </span>
            </div>
            <div
              className="w-full h-2.5 bg-white/80 dark:bg-[#0B1220] border border-slate-200/80 dark:border-[#273449] rounded-full overflow-hidden"
              role="progressbar"
              aria-valuenow={result.score}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Risk score ${result.score} out of 100`}
            >
              <div
                className={`h-full transition-all duration-300 ${presentation.barClass}`}
                style={{ width: `${Math.max(4, result.score)}%` }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] font-mono tabular-nums text-slate-500 dark:text-[#A7B4C7]">
              <span>0 Low</span>
              <span>30 Med</span>
              <span>60 High</span>
              <span>80 Crit</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main explainable breakdown */}
      <div className="p-5 sm:p-6 divide-y divide-slate-200 dark:divide-[#273449] space-y-6">
        {/* 0. Forensic Message X-Ray (when message has highlighted spans) */}
        {result.mode === 'message' && segments.length > 0 && (
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  Forensic Message X-Ray
                </h3>
                <p className="mt-0.5 text-xs text-slate-500 dark:text-[#A7B4C7]">
                  {hasHighlightedTokens
                    ? 'Suspicious phrases and links inside the submitted text are highlighted below (long numbers redacted).'
                    : 'No suspicious phrase triggers highlighted inside this message.'}
                </p>
              </div>
            </div>

            <div className="mt-3 p-4 rounded-lg bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] text-sm leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-words">
              {renderHighlightSegments(segments)}
            </div>

            {activeHighlightCategories.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-slate-600 dark:text-[#A7B4C7]">
                {activeHighlightCategories.map((cat) => {
                  const style = HIGHLIGHT_STYLES[cat];
                  return (
                    <span key={cat} className="inline-flex items-center gap-1.5">
                      <span
                        className={`w-2 h-2 rounded-xs shrink-0 ${style.dotClass}`}
                        aria-hidden="true"
                      />
                      <span>{style.legendLabel}</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Official Verified Domains Comparison */}
        {verifiedHints.length > 0 && (
          <div className={result.mode === 'message' && segments.length > 0 ? 'pt-6' : ''}>
            <div className="rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/70 p-4">
              <div className="flex items-start gap-2.5">
                <Globe
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <div className="space-y-1.5 min-w-0">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-900 dark:text-blue-200">
                    Official Domain Verification Reference
                  </h3>
                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    When a message mentions a bank, government body, or courier, compare any link
                    against its true official domains below—never trust extra prefixes or alternate
                    extensions:
                  </p>
                  <div className="pt-1 flex flex-wrap gap-2">
                    {verifiedHints.map((hint) => (
                      <div
                        key={hint.brand}
                        className="text-xs bg-white dark:bg-[#111827] border border-blue-200 dark:border-[#273449] rounded-md px-2.5 py-1.5 text-slate-800 dark:text-slate-200"
                      >
                        <span className="font-semibold">{hint.brand}:</span>{' '}
                        <span className="font-mono text-blue-700 dark:text-blue-300">
                          {hint.officialDomains.join(', ')}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 1. Detected Indicators */}
        <div
          className={
            (result.mode === 'message' && segments.length > 0) || verifiedHints.length > 0
              ? 'pt-6'
              : ''
          }
        >
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
            Detected Indicators ({result.indicators.length})
          </h3>
          {result.indicators.length === 0 ? (
            <p className="mt-2.5 text-sm text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
              No suspicious phishing, credential-harvesting, or structural URL indicators were
              triggered.
            </p>
          ) : (
            <ol className="mt-3 divide-y divide-slate-100 dark:divide-[#273449]">
              {result.indicators.map((indicator, index) => (
                <li key={indicator.id} className="py-3 first:pt-1 last:pb-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                      <span className="font-mono tabular-nums text-slate-400 dark:text-slate-500 mr-2">
                        {index + 1}.
                      </span>
                      {indicator.title}
                    </div>
                    <div className="text-xs font-mono tabular-nums text-slate-500 dark:text-[#A7B4C7]">
                      <span className="capitalize">{indicator.category}</span>
                      <span className="mx-1.5" aria-hidden="true">
                        ·
                      </span>
                      <span
                        className={
                          indicator.weight >= 25
                            ? 'text-red-700 dark:text-red-400 font-semibold'
                            : indicator.weight >= 15
                              ? 'text-amber-700 dark:text-amber-400 font-semibold'
                              : 'text-slate-700 dark:text-slate-200 font-semibold'
                        }
                      >
                        +{indicator.weight} pts
                      </span>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B4C7] leading-relaxed pl-5">
                    {indicator.explanation}
                  </p>
                  {indicator.evidence && (
                    <p className="mt-1 text-xs font-mono text-slate-500 dark:text-slate-400 pl-5 break-all">
                      Matched signal: {indicator.evidence}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </div>

        {/* 2. URL Inspection Breakdown + Root Domain Anatomy */}
        {result.urls.length > 0 && (
          <div className="pt-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Static URL Inspection ({result.urls.length})
            </h3>
            <p className="mt-1 text-xs text-slate-500 dark:text-[#A7B4C7]">
              Parsed safely without making any outbound HTTP requests. Always inspect the{' '}
              <strong className="text-slate-700 dark:text-slate-200">True Root Domain</strong>—the
              part immediately before <span className="font-mono">.com</span> /{' '}
              <span className="font-mono">.in</span> / <span className="font-mono">.gov.in</span>.
            </p>
            <div className="mt-3 divide-y divide-slate-100 dark:divide-[#273449]">
              {result.urls.map((urlItem, idx) => {
                const rootDomain = urlItem.registrableDomain || urlItem.hostname;
                return (
                  <div
                    key={`${urlItem.originalUrl}-${idx}`}
                    className="py-3.5 first:pt-1 last:pb-0 space-y-2.5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        {urlItem.isHttps ? (
                          <Lock
                            className="w-3.5 h-3.5 text-slate-500 dark:text-[#A7B4C7] shrink-0"
                            aria-hidden="true"
                          />
                        ) : (
                          <LockOpen
                            className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0"
                            aria-hidden="true"
                          />
                        )}
                        <span className="text-xs font-mono text-slate-900 dark:text-[#F8FAFC] break-all">
                          {urlItem.originalUrl}
                        </span>
                      </div>
                      <span className="text-xs font-mono tabular-nums text-slate-600 dark:text-[#A7B4C7] shrink-0">
                        URL risk {urlItem.urlRiskScore}/100
                      </span>
                    </div>

                    {/* Visual URL Anatomy Dissector */}
                    {urlItem.valid && rootDomain && (
                      <div className="flex flex-wrap items-stretch gap-2 text-xs">
                        <div className="px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449]">
                          <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-[#A7B4C7]">
                            Protocol
                          </div>
                          <div
                            className={`font-mono font-semibold ${
                              urlItem.isHttps
                                ? 'text-slate-800 dark:text-slate-200'
                                : 'text-amber-700 dark:text-amber-300'
                            }`}
                          >
                            {urlItem.scheme}
                          </div>
                        </div>

                        {urlItem.subdomainPart && (
                          <div className="px-2.5 py-1.5 rounded-md bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                            <div className="text-[10px] uppercase tracking-wide text-amber-800 dark:text-amber-300">
                              Subdomain Prefix
                            </div>
                            <div className="font-mono font-semibold text-amber-950 dark:text-amber-200 break-all">
                              {urlItem.subdomainPart}
                            </div>
                          </div>
                        )}

                        <div
                          className={`px-2.5 py-1.5 rounded-md border ${
                            urlItem.urlRiskScore >= 30 || urlItem.suspectedBrand
                              ? 'bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-800/80'
                              : 'bg-blue-50/80 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/70'
                          }`}
                        >
                          <div className="text-[10px] uppercase tracking-wide text-slate-600 dark:text-[#A7B4C7]">
                            True Root Domain (Owner)
                          </div>
                          <div className="font-mono font-bold text-slate-900 dark:text-[#F8FAFC] break-all">
                            {rootDomain}
                          </div>
                        </div>

                        {urlItem.pathSummary && urlItem.pathSummary !== '/' && (
                          <div className="px-2.5 py-1.5 rounded-md bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#273449]">
                            <div className="text-[10px] uppercase tracking-wide text-slate-500 dark:text-[#A7B4C7]">
                              Path
                            </div>
                            <div className="font-mono text-slate-700 dark:text-slate-300 break-all">
                              {urlItem.pathSummary}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-[#A7B4C7] font-mono tabular-nums">
                      <span>Host: {urlItem.hostname || 'Invalid'}</span>
                      <span aria-hidden="true">·</span>
                      <span>Subdomains: {urlItem.subdomainCount}</span>
                      <span aria-hidden="true">·</span>
                      <span>Length: {urlItem.urlLength} chars</span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-[#A7B4C7] leading-relaxed flex items-start gap-1.5">
                      <ExternalLink
                        className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 mt-0.5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{urlItem.safetyNote}</span>
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 3. Context Notes */}
        {result.contextNotes.length > 0 && (
          <div className="pt-6">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>Contextual Analysis Notes</span>
            </h3>
            <ul className="mt-2.5 space-y-1.5 text-sm text-slate-600 dark:text-[#A7B4C7] list-disc list-inside">
              {result.contextNotes.map((note, idx) => (
                <li key={idx} className="leading-relaxed">
                  {note}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 4. Recommended Actions */}
        <div className="pt-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Recommended Actions
            </h3>
            {onOpenSafetyCenter &&
              (result.classification === 'HIGH' || result.classification === 'CRITICAL') && (
                <button
                  type="button"
                  onClick={onOpenSafetyCenter}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/50 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800/70 rounded-lg transition-colors whitespace-nowrap"
                >
                  <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Already Clicked or Lost Money? Emergency Help (1930)</span>
                </button>
              )}
          </div>
          <ul className="mt-2.5 space-y-2">
            {result.recommendations.map((rec, idx) => (
              <li
                key={idx}
                className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-200 leading-relaxed"
              >
                <CheckCircle2
                  className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
                  aria-hidden="true"
                />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 5. How to Distinguish Genuine vs. Fraudulent */}
        <div className="pt-6">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
            How to Tell Genuine Apart from Fraudulent
          </h3>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200 dark:border-emerald-800/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-900 dark:text-emerald-300">
                <ShieldCheck className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Genuine Communication Patterns</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside leading-relaxed">
                <li>Masks account numbers (e.g. A/C XX4912) and states &ldquo;Never share OTP or PIN&rdquo;.</li>
                <li>Uses exact verified domains (<span className="font-mono">.gov.in</span> or official bank host) rather than shorteners.</li>
                <li>Directs you to open the official app independently rather than rushing a 2-hour link tap.</li>
              </ul>
            </div>

            <div className="p-4 rounded-lg bg-red-50/70 dark:bg-red-950/25 border border-red-200 dark:border-red-800/60 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-red-900 dark:text-red-300">
                <ShieldAlert className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Fraudulent Red Flags</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-disc list-inside leading-relaxed">
                <li>Threatens same-day account freeze, electricity cut-off, SIM block, or &ldquo;digital arrest&rdquo;.</li>
                <li>Requests UPI PIN, OTP, CVV, registration fee, or AnyDesk/APK install to receive money.</li>
                <li>Hides real owner behind <span className="font-mono">bit.ly</span>, raw IP addresses, or hyphenated lookalikes.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
