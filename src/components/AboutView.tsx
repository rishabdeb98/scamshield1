interface AboutViewProps {
  onBackToAnalyzer: () => void;
}

export function AboutView({ onBackToAnalyzer }: AboutViewProps) {
  return (
    <section className="py-8 space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
          About ScamShield
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
          ScamShield is a cybersecurity awareness and message-verification tool built to help everyday
          users recognize social engineering, phishing links, and fraudulent SMS or WhatsApp alerts
          before clicking.
        </p>
      </div>

      <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6 divide-y divide-slate-200 dark:divide-[#273449] space-y-5">
        <div>
          <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
            Security &amp; Privacy Safeguards
          </h2>
          <ul className="mt-2.5 space-y-2 text-sm text-slate-600 dark:text-[#A7B4C7] list-disc list-inside leading-relaxed">
            <li>
              <strong className="text-slate-900 dark:text-[#F8FAFC]">Zero Link Execution:</strong> Submitted URLs are inspected strictly as text on the
              server. ScamShield never visits, crawls, or opens user-submitted links.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-[#F8FAFC]">Session-Isolated History:</strong> Saved analyses are stored in SQLite scoped to a
              signed, HTTP-only session cookie so other users cannot view or delete your records.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-[#F8FAFC]">Automatic Digit Masking &amp; Opt-Out:</strong> Long numeric sequences and explicit
              OTP/PIN codes are masked before saving previews, and you can disable history storage
              completely at any time.
            </li>
            <li>
              <strong className="text-slate-900 dark:text-[#F8FAFC]">Input Validation &amp; Anti-CSRF Protection:</strong> All analysis and history
              requests enforce length limits, safe text rendering, and origin/header checks.
            </li>
          </ul>
        </div>

        <div className="pt-5">
          <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
            Important Limitations
          </h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
            Automated pattern and heuristic scoring cannot guarantee 100% detection of novel or highly
            targeted scams. A low score does not replace verifying unexpected financial, delivery, or
            account requests directly through an organization&apos;s official app or customer support
            number.
          </p>
          <div className="mt-5">
            <button
              type="button"
              onClick={onBackToAnalyzer}
              className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              Return to Analyzer
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
