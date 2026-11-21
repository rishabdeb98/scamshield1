import {
  ArrowLeft,
  CheckCircle2,
  FlaskConical,
  Landmark,
  Link2,
  Package,
  Play,
  ShieldAlert,
  Smartphone,
  Briefcase,
  Building2,
  Coins,
} from 'lucide-react';
import type { RiskLevel, ScamLibraryCategory, ScamLibraryExample } from '../types/scamshield';

interface ScamExampleDetailProps {
  example: ScamLibraryExample;
  allExamples: ScamLibraryExample[];
  onBack: () => void;
  onSelectExample: (example: ScamLibraryExample) => void;
  onTryExample: (example: ScamLibraryExample) => void;
}

function getRiskBadgeStyle(level: RiskLevel): string {
  if (level === 'CRITICAL')
    return 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800';
  if (level === 'HIGH')
    return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/70';
  if (level === 'MEDIUM')
    return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/70';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-900/70';
}

export function getCategoryIcon(category: ScamLibraryCategory) {
  switch (category) {
    case 'Banking':
      return Landmark;
    case 'UPI':
      return Smartphone;
    case 'Government':
      return Building2;
    case 'Delivery':
      return Package;
    case 'Job':
      return Briefcase;
    case 'Financial':
      return Coins;
    case 'Phishing':
    default:
      return Link2;
  }
}

export function ScamExampleDetail({
  example,
  allExamples,
  onBack,
  onSelectExample,
  onTryExample,
}: ScamExampleDetailProps) {
  const CategoryIcon = getCategoryIcon(example.category);
  const relatedExamples = example.relatedIds
    .map((id) => allExamples.find((item) => item.id === id))
    .filter((item): item is ScamLibraryExample => Boolean(item));

  return (
    <section className="py-8 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-[#A7B4C7] hover:text-slate-900 dark:hover:text-[#F8FAFC] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" aria-hidden="true" />
          <span>Back to Scam Library</span>
        </button>

        <button
          type="button"
          onClick={() => onTryExample(example)}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
        >
          <Play className="w-4 h-4" aria-hidden="true" />
          <span>TRY THIS EXAMPLE</span>
        </button>
      </div>

      {/* Main detail card */}
      <article className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs overflow-hidden">
        {/* Header band */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-[#273449] bg-slate-50/70 dark:bg-[#111827]/70">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600 dark:text-[#A7B4C7]">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-800 dark:text-[#F8FAFC]">
                  <CategoryIcon
                    className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
                    aria-hidden="true"
                  />
                  <span>{example.categoryDisplay}</span>
                </span>
                <span aria-hidden="true">·</span>
                <span className="uppercase font-mono">{example.channel}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono tabular-nums">Added {example.addedAt}</span>
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                {example.title}
              </h1>
              <p className="text-sm text-slate-600 dark:text-[#A7B4C7] max-w-3xl leading-relaxed">
                {example.description}
              </p>
            </div>

            <div className="shrink-0 flex flex-col items-start md:items-end gap-1">
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#A7B4C7]">
                Educational Risk Classification
              </span>
              <span
                className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-md border ${getRiskBadgeStyle(
                  example.riskLevel,
                )}`}
              >
                {example.riskLevel} RISK
              </span>
            </div>
          </div>
        </div>

        {/* Body sections */}
        <div className="p-5 sm:p-6 divide-y divide-slate-200 dark:divide-[#273449] space-y-6">
          {/* 4. Example suspicious message */}
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                Sample Suspicious Message
              </h2>
              <span className="text-[11px] text-slate-500 dark:text-[#A7B4C7]">
                Fictional demo message using reserved example domains
              </span>
            </div>
            <blockquote className="rounded-lg bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#273449] p-4 text-sm font-mono text-slate-900 dark:text-[#F8FAFC] leading-relaxed break-words">
              &ldquo;{example.sampleMessage}&rdquo;
            </blockquote>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => onTryExample(example)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                <FlaskConical className="w-4 h-4" aria-hidden="true" />
                <span>TRY THIS EXAMPLE</span>
              </button>
              <span className="text-xs text-slate-500 dark:text-[#A7B4C7]">
                Sends this exact text to the live ScamShield Message Scanner for real-time engine scoring.
              </span>
            </div>
          </div>

          {/* 5. Explanation & 7. Attack Technique & 8. How it works */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  Why This Is a Scam
                </h2>
                <p className="mt-1.5 text-sm text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
                  {example.explanation}
                </p>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  Attack Technique
                </h2>
                <p className="mt-1.5 text-sm text-slate-700 dark:text-[#E2E8F0] font-medium leading-relaxed">
                  {example.attackTechnique}
                </p>
              </div>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                How the Scam Works
              </h2>
              <p className="mt-1.5 text-sm text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
                {example.howItWorks}
              </p>
            </div>
          </div>

          {/* 6. Red Flags & 9. How to protect yourself */}
          <div className="pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] mb-2.5">
                Key Red Flags
              </h2>
              <ul className="space-y-2">
                {example.redFlags.map((flag, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-[#E2E8F0] leading-relaxed"
                  >
                    <ShieldAlert
                      className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{flag}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] mb-2.5">
                How to Protect Yourself
              </h2>
              <ul className="space-y-2">
                {example.protectionAdvice.map((tip, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-[#E2E8F0] leading-relaxed"
                  >
                    <CheckCircle2
                      className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
                      aria-hidden="true"
                    />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 10. Related Scam Examples */}
          {relatedExamples.length > 0 && (
            <div className="pt-6">
              <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] mb-3">
                Related Scam Examples
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {relatedExamples.map((rel) => {
                  const RelIcon = getCategoryIcon(rel.category);
                  return (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => onSelectExample(rel)}
                      className="text-left p-3.5 rounded-lg border border-slate-200 dark:border-[#273449] bg-white dark:bg-[#111827]/70 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-[#111827] transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-500 dark:text-[#A7B4C7]">
                          <RelIcon
                            className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400"
                            aria-hidden="true"
                          />
                          <span>{rel.category}</span>
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${getRiskBadgeStyle(
                            rel.riskLevel,
                          )}`}
                        >
                          {rel.riskLevel}
                        </span>
                      </div>
                      <div className="mt-1.5 text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        {rel.title}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </article>
    </section>
  );
}
