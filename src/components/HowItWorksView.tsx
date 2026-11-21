interface HowItWorksViewProps {
  onTryAnalyzer: () => void;
}

export function HowItWorksView({ onTryAnalyzer }: HowItWorksViewProps) {
  const steps = [
    {
      num: '01',
      title: 'Message & Context Parsing',
      body: 'ScamShield scans pasted SMS, WhatsApp, email, and social media messages for financial lures, OTP harvesting, urgency threats, prize scams, and brand impersonation—while checking for protective phrasing like "do not share OTP" so normal bank alerts are not falsely flagged.',
    },
    {
      num: '02',
      title: 'Static URL Structure Inspection',
      body: 'Any links inside the message (or pasted into the URL checker) are parsed strictly on the server without ever opening or fetching the destination. We inspect IP-literal hosts, link shorteners, punycode homographs, misspelled brand domains, stacked subdomains, and HTTP vs HTTPS.',
    },
    {
      num: '03',
      title: 'Weighted Risk Scoring (0–100)',
      body: 'Detected indicators contribute weighted risk points and context synergy adjustments, capped at 100. Scores map cleanly to LOW (0–29), MEDIUM (30–59), or HIGH (60–100) risk.',
    },
    {
      num: '04',
      title: 'Explainable Breakdown & Guidance',
      body: 'Instead of an opaque verdict, ScamShield lists every triggered rule, why it matters, and tailored next steps so everyday users learn to spot social engineering independently.',
    },
  ];

  return (
    <section className="py-8 space-y-8">
      <div className="max-w-3xl">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
          How ScamShield Evaluates Suspicious Messages
        </h1>
        <p className="mt-2 text-base text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
          Effective phishing detection looks beyond isolated keywords like &ldquo;bank&rdquo; or &ldquo;OTP&rdquo;
          and examines intent, urgency, and link structure together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step) => (
          <div
            key={step.num}
            className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6"
          >
            <div className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400">
              {step.num}
            </div>
            <h2 className="mt-1.5 text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              {step.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
              {step.body}
            </p>
          </div>
        ))}
      </div>

      {/* Contrast example: Context-aware scoring */}
      <div className="bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#273449] rounded-xl shadow-xs p-5 sm:p-6">
        <h2 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
          Why Context Matters: Scam vs. Legitimate Alert
        </h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-[#273449]">
          <div className="space-y-2 pr-0 md:pr-4">
            <div className="text-xs font-semibold text-red-700 dark:text-red-400">
              HIGH RISK · Phishing Pattern
            </div>
            <p className="text-sm font-mono text-slate-800 dark:text-[#F8FAFC] bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#273449] rounded-lg p-3">
              &ldquo;Your bank account will be suspended today. Verify your KYC immediately using this
              link: http://hdfc-kyc-update.xyz/verify&rdquo;
            </p>
            <p className="text-xs text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
              Combines immediate suspension threat, forced KYC demand, bank impersonation, unencrypted HTTP,
              and a non-official <span className="font-mono">.xyz</span> domain.
            </p>
          </div>

          <div className="space-y-2 pt-4 md:pt-0 md:pl-6">
            <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">
              LOW RISK · Legitimate Alert
            </div>
            <p className="text-sm font-mono text-slate-800 dark:text-[#F8FAFC] bg-slate-50 dark:bg-[#0B1220] border border-slate-200 dark:border-[#273449] rounded-lg p-3">
              &ldquo;Rs. 480 debited from A/C XX4912 via UPI Ref 4325109821. Do not share OTP or PIN with
              anyone. Call official helpline if not you.&rdquo;
            </p>
            <p className="text-xs text-slate-600 dark:text-[#A7B4C7] leading-relaxed">
              Contains &ldquo;OTP&rdquo; and &ldquo;debited&rdquo;, but pairs them with a protective
              non-sharing warning, masked account details, and zero external links.
            </p>
          </div>
        </div>

        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-[#273449]">
          <button
            type="button"
            onClick={onTryAnalyzer}
            className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Try These Samples in the Analyzer
          </button>
        </div>
      </div>
    </section>
  );
}
