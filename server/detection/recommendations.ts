import type {
  AnalysisMode,
  IndicatorItem,
  RiskLevel,
  UrlAnalysisDetail,
  VerifiedBrandHint,
} from '../../src/types/scamshield.ts';

export function buildRecommendations(params: {
  mode: AnalysisMode;
  classification: RiskLevel;
  indicators: IndicatorItem[];
  urls: UrlAnalysisDetail[];
  verifiedBrandHints?: VerifiedBrandHint[];
}): string[] {
  const { mode, classification, indicators, urls, verifiedBrandHints = [] } = params;
  const categories = new Set(indicators.map((i) => i.category));
  const ids = new Set(indicators.map((i) => i.id));
  const recs: string[] = [];

  if (urls.length > 0 && (classification !== 'LOW' || mode === 'url')) {
    recs.push('Do not click or open the link directly from the message.');
  }

  if (ids.has('remote-access-trap') || urls.some((u) => u.flags.some((f) => f.code === 'DANGEROUS_DOWNLOAD'))) {
    recs.push(
      'Never install AnyDesk, TeamViewer, QuickSupport, or .apk files sent over SMS or WhatsApp—they give scammers live access to your OTPs and banking apps.',
    );
  }

  if (ids.has('coercion-extortion')) {
    recs.push(
      'Hang up immediately: "Digital arrest" does not exist under law, and police or regulators never verify innocence or collect deposits over video call. Call 1930 or 112 if threatened.',
    );
  }

  if (ids.has('accidental-upi-refund')) {
    recs.push(
      'Never send a "refund" based on a screenshot or SMS alert—open your official banking or UPI app independently to check if funds actually settled.',
    );
  }

  if (ids.has('utility-sim-threat')) {
    recs.push(
      'Check your electricity bill or SIM status directly in your utility provider or telecom operator’s official app instead of calling phone numbers inside threat messages.',
    );
  }

  if (categories.has('credential')) {
    recs.push('Never share OTPs, PINs, CVVs, or passwords with anyone—even callers claiming to be support.');
  }

  if (categories.has('financial') || categories.has('impersonation')) {
    if (verifiedBrandHints.length > 0) {
      const domainSummary = verifiedBrandHints
        .slice(0, 2)
        .map((h) => `${h.brand} (${h.officialDomains[0]})`)
        .join(', ');
      recs.push(
        `Verify directly inside the official mobile app or by manually typing the verified domain: ${domainSummary}.`,
      );
    } else {
      recs.push(
        'Verify any account, KYC, or tax notice directly inside the official mobile app or by typing the official website address yourself.',
      );
    }
  }

  if (categories.has('delivery')) {
    recs.push(
      'Check parcel status on the courier’s official website using your original order tracking number instead of paying redelivery fees through SMS links.',
    );
  }

  if (categories.has('reward')) {
    recs.push(
      'Treat unsolicited prize claims, lottery wins, guaranteed trading returns, and messaging-app job offers as fraudulent—never pay upfront processing or security fees.',
    );
  }

  if (categories.has('urgency')) {
    recs.push('Pause before acting: artificial deadlines and suspension threats are engineered to bypass careful judgment.');
  }

  if (urls.some((u) => u.isHttps) && classification !== 'LOW') {
    recs.push(
      'Do not rely on the HTTPS padlock icon as proof of trust—phishing sites also obtain SSL certificates.',
    );
  }

  if (classification === 'CRITICAL' || classification === 'HIGH') {
    recs.push(
      'Block the sender and report fraud immediately via 1930 or cybercrime.gov.in (for financial cybercrime).',
    );
  } else if (classification === 'MEDIUM') {
    recs.push('Confirm the request through a separate, known-good contact channel before replying or submitting any details.');
  } else {
    recs.push(
      'Remember that a low-risk score does not guarantee safety—confirm unexpected requests through an official channel before sharing personal data.',
    );
  }

  return Array.from(new Set(recs));
}
