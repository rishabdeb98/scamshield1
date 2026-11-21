import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ExternalLink,
  Globe,
  KeyRound,
  Landmark,
  Lightbulb,
  Mail,
  MessageSquareWarning,
  PhoneCall,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Users,
  Wifi,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';
import {
  COMMON_INDIAN_SCAMS,
  DAILY_SAFETY_TIPS,
  EMERGENCY_SCAM_STEPS,
  EVERYDAY_GUIDELINES,
  getDailySafetyTipIndex,
  OFFICIAL_REPORTING_RESOURCES,
} from '../data/safetyCenter';
import { SafetyChecklist } from './SafetyChecklist';

interface SafetyCenterViewProps {
  onExploreLibraryExample: (exampleId: string) => void;
  onOpenScanner: () => void;
}

function getGuidelineIcon(id: string) {
  switch (id) {
    case 'password-security':
      return KeyRound;
    case 'upi-payments':
      return Smartphone;
    case 'sms-whatsapp':
      return MessageSquareWarning;
    case 'banking-security':
      return Landmark;
    case 'social-media':
      return Users;
    case 'device-wifi':
      return Wifi;
    case 'jobs-shopping':
    default:
      return ShoppingBag;
  }
}

export function SafetyCenterView({
  onExploreLibraryExample,
  onOpenScanner,
}: SafetyCenterViewProps) {
  const [tipIndex, setTipIndex] = useState<number>(() => getDailySafetyTipIndex());
  const currentTip = DAILY_SAFETY_TIPS[tipIndex] ?? DAILY_SAFETY_TIPS[0];

  const handleNextTip = () => {
    setTipIndex((prev) => (prev + 1) % DAILY_SAFETY_TIPS.length);
  };

  const scrollToChecklist = () => {
    document.getElementById('safety-checklist')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div className="py-8 space-y-10">
      {/* Page Heading & Daily Safety Tip */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-center space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
            Safety Center
          </h1>
          <p className="text-sm sm:text-base text-slate-600 dark:text-[#A7B4C7] max-w-2xl leading-relaxed">
            Your everyday guide to staying safe online. Access official Indian cybercrime reporting
            channels, emergency recovery steps, practical digital hygiene guidelines, and a personal
            security checklist.
          </p>
        </div>

        {/* 6. Cybersecurity Awareness Tips (Compact Daily Card) */}
        <aside
          aria-label="Cyber Safety Tip of the Day"
          className="lg:col-span-5 bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 flex flex-col justify-between gap-4"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400">
                <Lightbulb className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>Cyber Safety Tip of the Day</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#A7B4C7]">
                {currentTip.topic}
              </span>
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {currentTip.tip}
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-[#273449]">
            <span className="text-[11px] font-mono tabular-nums text-slate-500 dark:text-[#A7B4C7]">
              Tip {tipIndex + 1} of {DAILY_SAFETY_TIPS.length}
            </span>
            <button
              type="button"
              onClick={handleNextTip}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Show Another Tip</span>
            </button>
          </div>
        </aside>
      </section>

      {/* 1. Emergency Cybercrime Help Section */}
      <section aria-label="Emergency Cybercrime Help" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              Need Help? Report Cybercrime
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B4C7]">
              Verified Indian reporting channels. If money was lost to online fraud, report to{' '}
              <strong className="text-slate-900 dark:text-[#F8FAFC]">1930</strong> and{' '}
              <strong className="text-slate-900 dark:text-[#F8FAFC]">cybercrime.gov.in</strong> as
              quickly as possible.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {OFFICIAL_REPORTING_RESOURCES.map((resource) => {
            const isPrimaryFraud = resource.id === 'helpline-1930';
            return (
              <article
                key={resource.id}
                className={`bg-white dark:bg-[#172033] border rounded-xl shadow-xs p-5 sm:p-6 flex flex-col justify-between gap-4 ${
                  isPrimaryFraud
                    ? 'border-red-200 dark:border-red-800/70'
                    : 'border-slate-200 dark:border-[#273449]'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-xs font-medium text-slate-500 dark:text-[#A7B4C7]">
                        {resource.badgeLabel}
                      </div>
                      <h3 className="mt-0.5 text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
                        {resource.title}
                      </h3>
                    </div>
                    <span
                      className={`text-sm font-mono tabular-nums font-bold shrink-0 ${
                        isPrimaryFraud
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-blue-700 dark:text-blue-400'
                      }`}
                    >
                      {resource.id === 'portal-cybercrime'
                        ? 'cybercrime.gov.in'
                        : resource.id === 'cert-in'
                          ? 'cert-in.org.in'
                          : resource.primaryContact}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
                    {resource.purpose}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-[#A7B4C7] leading-relaxed">
                    {resource.distinctionNote}
                  </p>

                  {resource.id === 'cert-in' && (
                    <div className="pt-2 border-t border-slate-100 dark:border-[#273449] space-y-1.5 text-xs text-slate-600 dark:text-[#A7B4C7]">
                      <div className="flex flex-wrap items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" aria-hidden="true" />
                        <span>Incident email:</span>
                        <a
                          href={`mailto:${resource.email}`}
                          className="font-mono text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          {resource.email}
                        </a>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <PhoneCall
                          className="w-3.5 h-3.5 text-slate-400 shrink-0"
                          aria-hidden="true"
                        />
                        <span>Toll-free incident response helpdesk:</span>
                        <a
                          href={resource.tollFreeHref}
                          className="font-mono font-semibold text-blue-700 dark:text-blue-400 hover:underline"
                        >
                          {resource.tollFreeNumber}
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  {resource.telHref && (
                    <a
                      href={resource.telHref}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white rounded-lg transition-colors whitespace-nowrap ${
                        isPrimaryFraud
                          ? 'bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-500'
                          : 'bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-500'
                      }`}
                    >
                      <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{resource.actionLabel}</span>
                    </a>
                  )}

                  {resource.websiteUrl && (
                    <a
                      href={resource.websiteUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 rounded-lg transition-colors whitespace-nowrap"
                    >
                      <Globe className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>{resource.actionLabel}</span>
                      <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    </a>
                  )}

                  {resource.tollFreeHref && (
                    <a
                      href={resource.tollFreeHref}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-[#273449] rounded-lg transition-colors whitespace-nowrap"
                    >
                      <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Call {resource.tollFreeNumber}</span>
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        <p className="text-xs text-slate-600 dark:text-[#A7B4C7] bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] rounded-lg px-4 py-3 leading-relaxed">
          Helpline availability, procedures and response times may vary. Use official government
          channels and verify contact details when needed.
        </p>
      </section>

      {/* 2. What To Do If You Have Been Scammed */}
      <section
        aria-label="Emergency Step-by-Step Guide"
        className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6 space-y-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-[#273449]">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              Act Quickly – What To Do If You Have Been Scammed
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B4C7]">
              Follow these steps in order to report financial fraud, contain account access, and
              preserve digital evidence.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <a
              href="tel:1930"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <PhoneCall className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Call 1930</span>
            </a>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>Report Cybercrime</span>
              <ExternalLink className="w-3 h-3" aria-hidden="true" />
            </a>
            <button
              type="button"
              onClick={scrollToChecklist}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-[#273449] rounded-lg transition-colors whitespace-nowrap"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              <span>View Safety Checklist</span>
            </button>
          </div>
        </div>

        {/* Prominent warning */}
        <div
          role="note"
          className="flex items-start gap-3 px-4 py-3.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/70 text-sm text-amber-950 dark:text-amber-200"
        >
          <AlertTriangle
            className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0"
            aria-hidden="true"
          />
          <p className="font-medium leading-relaxed">
            Do not delay reporting financial fraud. Quick reporting may help authorities and
            financial institutions take action.
          </p>
        </div>

        {/* 9 numbered steps */}
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {EMERGENCY_SCAM_STEPS.map((step) => (
            <li
              key={step.stepNumber}
              className="p-4 rounded-lg bg-slate-50/80 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] space-y-1.5"
            >
              <div className="text-xs font-mono tabular-nums font-bold text-blue-700 dark:text-blue-400">
                Step {String(step.stepNumber).padStart(2, '0')}
              </div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {step.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
                {step.detail}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 3. Everyday Cybersecurity Guidelines */}
      <section aria-label="Everyday Cybersecurity Guidelines" className="space-y-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
            Stay Safe Every Day
          </h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B4C7]">
            Practical habits across payments, messaging, banking, social media, and devices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {EVERYDAY_GUIDELINES.map((guide) => {
            const Icon = getGuidelineIcon(guide.id);
            return (
              <article
                key={guide.id}
                className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 flex flex-col justify-between gap-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/60 flex items-center justify-center shrink-0">
                      <Icon
                        className="w-4 h-4 text-blue-600 dark:text-blue-400"
                        aria-hidden="true"
                      />
                    </span>
                    <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                      {guide.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
                    {guide.summary}
                  </p>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#273449]">
                    <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                      DO
                    </div>
                    <ul className="space-y-1.5">
                      {guide.dos.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 leading-relaxed"
                        >
                          <CheckCircle2
                            className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#273449]">
                    <div className="text-[11px] font-semibold text-red-700 dark:text-red-400">
                      DON&apos;T
                    </div>
                    <ul className="space-y-1.5">
                      {guide.donts.map((item, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-200 leading-relaxed"
                        >
                          <XCircle
                            className="w-3.5 h-3.5 text-red-600 dark:text-red-400 mt-0.5 shrink-0"
                            aria-hidden="true"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* 4. Common Indian Cyber Scams */}
      <section aria-label="Common Indian Cyber Scams" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
              Know the Scams Before They Target You
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-[#A7B4C7]">
              Quick summaries of twelve widespread digital scams in India. Select{' '}
              <strong className="text-slate-800 dark:text-slate-200">Explore Example</strong> to
              inspect full message breakdowns in the Scam Library.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {COMMON_INDIAN_SCAMS.map((scam) => (
            <article
              key={scam.id}
              className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <ShieldAlert
                    className="w-4 h-4 text-red-600 dark:text-red-400 mt-1 shrink-0"
                    aria-hidden="true"
                  />
                  <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    {scam.title}
                  </h3>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-[#A7B4C7]">
                    How It Works
                  </div>
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    {scam.howItWorks}
                  </p>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-[#A7B4C7]">
                    Common Warning Signs
                  </div>
                  <ul className="mt-1 space-y-1 list-disc list-inside text-xs text-slate-600 dark:text-[#A7B4C7]">
                    {scam.warningSigns.map((sign, idx) => (
                      <li key={idx} className="leading-relaxed">
                        {sign}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <div className="text-[11px] font-semibold text-slate-500 dark:text-[#A7B4C7]">
                    How to Protect Yourself
                  </div>
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-200 leading-relaxed">
                    {scam.howToProtect}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-[#273449] flex items-center justify-between gap-2">
                {scam.libraryExampleId ? (
                  <button
                    type="button"
                    onClick={() => onExploreLibraryExample(scam.libraryExampleId!)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>Explore Example</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onOpenScanner}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-[#111827] hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <span>Check Suspicious Text</span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* 5. Quick Security Checklist */}
      <SafetyChecklist />

      {/* Independent Tool Disclaimer */}
      <section
        aria-label="Safety Center Disclaimer"
        className="bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#273449] rounded-xl px-5 py-4 text-xs text-slate-600 dark:text-[#A7B4C7] leading-relaxed"
      >
        <strong className="text-slate-800 dark:text-slate-200">Disclaimer:</strong> ScamShield is
        an independent educational and awareness tool. It is not a government service and does not
        replace official cybercrime reporting channels. Using ScamShield or completing the security
        checklist does not guarantee protection against every scam or cyber threat.
      </section>
    </div>
  );
}
