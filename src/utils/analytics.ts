import type { HistoryItem, RiskLevel } from '../types/scamshield';

export interface PeriodDelta {
  totalDiffPct: number | null;
  highRiskDiffPct: number | null;
}

export interface OverviewStats {
  totalScans: number;
  lowCount: number;
  mediumCount: number;
  highCount: number;
  criticalCount: number;
  highAndCriticalCount: number;
  suspiciousUrlsCount: number;
  threatDetectionRate: number;
  lastScanAt: string | null;
  periodDelta: PeriodDelta;
}

export interface DailyActivityPoint {
  dateKey: string;
  label: string;
  totalScans: number;
  highRiskScans: number;
}

export interface ThreatCategoryStat {
  name: string;
  count: number;
  percentage: number;
}

export const RISK_TIERS: Array<{
  level: RiskLevel;
  range: string;
  title: string;
  status: string;
  hex: string;
  badgeClass: string;
  textClass: string;
  barClass: string;
}> = [
  {
    level: 'LOW',
    range: '0–29',
    title: 'LOW RISK',
    status: 'Relatively safe indicators.',
    hex: '#16A34A',
    badgeClass:
      'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800/70',
    textClass: 'text-emerald-700 dark:text-emerald-400',
    barClass: 'bg-emerald-600 dark:bg-emerald-500',
  },
  {
    level: 'MEDIUM',
    range: '30–59',
    title: 'MEDIUM RISK',
    status: 'Suspicious indicators detected.',
    hex: '#D97706',
    badgeClass:
      'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800/70',
    textClass: 'text-amber-700 dark:text-amber-400',
    barClass: 'bg-amber-500',
  },
  {
    level: 'HIGH',
    range: '60–79',
    title: 'HIGH RISK',
    status: 'Multiple strong threat indicators detected.',
    hex: '#DC2626',
    badgeClass:
      'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-800/70',
    textClass: 'text-red-700 dark:text-red-400',
    barClass: 'bg-red-600 dark:bg-red-500',
  },
  {
    level: 'CRITICAL',
    range: '80–100',
    title: 'CRITICAL RISK',
    status: 'Severe potential fraud or phishing indicators.',
    hex: '#B91C1C',
    badgeClass:
      'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-200 dark:border-rose-800/80',
    textClass: 'text-rose-900 dark:text-rose-300',
    barClass: 'bg-rose-800 dark:bg-rose-600',
  },
];

export function countSuspiciousUrlsInItem(item: HistoryItem): number {
  const urls = item.result?.urls ?? [];
  if (item.mode === 'url') {
    if (urls.length === 0) return item.score >= 30 ? 1 : 0;
    return urls.filter((u) => u.urlRiskScore >= 20 || u.flags.length > 0 || !u.valid).length;
  }
  return urls.filter(
    (u) => u.urlRiskScore >= 20 || u.isShortener || u.isIpAddress || !u.valid || Boolean(u.suspectedBrand),
  ).length;
}

export function computeOverviewStats(items: HistoryItem[]): OverviewStats {
  const totalScans = items.length;
  let lowCount = 0;
  let mediumCount = 0;
  let highCount = 0;
  let criticalCount = 0;
  let suspiciousUrlsCount = 0;

  for (const item of items) {
    if (item.classification === 'LOW') lowCount += 1;
    else if (item.classification === 'MEDIUM') mediumCount += 1;
    else if (item.classification === 'HIGH') highCount += 1;
    else if (item.classification === 'CRITICAL') criticalCount += 1;

    suspiciousUrlsCount += countSuspiciousUrlsInItem(item);
  }

  const highAndCriticalCount = highCount + criticalCount;
  const threatCount = mediumCount + highAndCriticalCount;
  const threatDetectionRate = totalScans > 0 ? Math.round((threatCount / totalScans) * 100) : 0;

  // Real period-over-period delta: compare last 7 days vs prior 7 days (days 8–14)
  // Only populate when real historical records exist in the prior 7-day window.
  const now = Date.now();
  const msDay = 86_400_000;
  const recentWindowStart = now - 7 * msDay;
  const priorWindowStart = now - 14 * msDay;

  const recentItems = items.filter((i) => new Date(i.createdAt).getTime() >= recentWindowStart);
  const priorItems = items.filter((i) => {
    const t = new Date(i.createdAt).getTime();
    return t >= priorWindowStart && t < recentWindowStart;
  });

  let totalDiffPct: number | null = null;
  let highRiskDiffPct: number | null = null;

  if (priorItems.length > 0) {
    totalDiffPct = Math.round(((recentItems.length - priorItems.length) / priorItems.length) * 100);
    const recentHigh = recentItems.filter(
      (i) => i.classification === 'HIGH' || i.classification === 'CRITICAL',
    ).length;
    const priorHigh = priorItems.filter(
      (i) => i.classification === 'HIGH' || i.classification === 'CRITICAL',
    ).length;
    if (priorHigh > 0) {
      highRiskDiffPct = Math.round(((recentHigh - priorHigh) / priorHigh) * 100);
    }
  }

  return {
    totalScans,
    lowCount,
    mediumCount,
    highCount,
    criticalCount,
    highAndCriticalCount,
    suspiciousUrlsCount,
    threatDetectionRate,
    lastScanAt: items[0]?.createdAt ?? null,
    periodDelta: {
      totalDiffPct,
      highRiskDiffPct,
    },
  };
}

function toLocalDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function computeDailyActivity(items: HistoryItem[], rangeDays: 7 | 30 | 90): DailyActivityPoint[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const buckets = new Map<string, DailyActivityPoint>();
  for (let offset = rangeDays - 1; offset >= 0; offset -= 1) {
    const d = new Date(today);
    d.setDate(today.getDate() - offset);
    const key = toLocalDayKey(d);
    const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    buckets.set(key, {
      dateKey: key,
      label,
      totalScans: 0,
      highRiskScans: 0,
    });
  }

  for (const item of items) {
    const d = new Date(item.createdAt);
    if (Number.isNaN(d.getTime())) continue;
    const key = toLocalDayKey(d);
    const bucket = buckets.get(key);
    if (!bucket) continue;
    bucket.totalScans += 1;
    if (item.classification === 'HIGH' || item.classification === 'CRITICAL') {
      bucket.highRiskScans += 1;
    }
  }

  return Array.from(buckets.values());
}

const THREAT_CATEGORY_NAMES = [
  'Phishing Attempts',
  'Banking Scams',
  'UPI Fraud',
  'Fake KYC Notifications',
  'Government Impersonation',
  'Digital Arrest Scams',
  'Fake Job Offers',
  'Delivery Scams',
  'Suspicious URLs',
] as const;

export function computeThreatCategories(items: HistoryItem[]): ThreatCategoryStat[] {
  const counts = new Map<string, number>();
  for (const name of THREAT_CATEGORY_NAMES) {
    counts.set(name, 0);
  }

  const increment = (name: (typeof THREAT_CATEGORY_NAMES)[number]) => {
    counts.set(name, (counts.get(name) ?? 0) + 1);
  };

  for (const item of items) {
    const indicators = item.result?.indicators ?? [];
    const urls = item.result?.urls ?? [];
    const combinedText = [
      item.redactedPreview,
      item.summary,
      ...indicators.map((i) => `${i.id} ${i.title} ${i.evidence ?? ''}`),
    ]
      .join(' ')
      .toLowerCase();

    const hasThreatIndicators = item.score >= 30 || indicators.length > 0;

    // 1. Suspicious URLs
    if (countSuspiciousUrlsInItem(item) > 0) {
      increment('Suspicious URLs');
    }

    if (!hasThreatIndicators) continue;

    // 2. Phishing Attempts
    if (
      indicators.some((i) => i.category === 'credential' || i.id === 'unverified-action-link') ||
      /\b(phishing|login|password|otp|credential|paypa1|verify\s+account)\b/i.test(combinedText)
    ) {
      increment('Phishing Attempts');
    }

    // 3. Fake KYC Notifications
    if (/\bkyc\b/i.test(combinedText)) {
      increment('Fake KYC Notifications');
    }

    // 4. UPI Fraud
    if (/\b(upi|qr\s*code|collect\s*request|cashback)\b/i.test(combinedText)) {
      increment('UPI Fraud');
    }

    // 5. Banking Scams
    if (
      indicators.some((i) => i.category === 'financial') ||
      /\b(bank|hdfc|sbi|icici|axis|chase|wells\s*fargo|account\s+(?:will\s+be\s+)?suspended|refund)\b/i.test(
        combinedText,
      )
    ) {
      increment('Banking Scams');
    }

    // 6. Digital Arrest Scams
    if (
      /\b(digital\s+arrest|arrest\s+warrant|stay\s+on\s+(?:video|skype|whatsapp)\s+call|cbi|trai|enforcement\s+directorate|cyber\s+crime\s+cell|police\s+cyber)\b/i.test(
        combinedText,
      )
    ) {
      increment('Digital Arrest Scams');
    }

    // 7. Government Impersonation
    if (
      /\b(irs|hmrc|income\s+tax|reserve\s+bank|rbi|customs\s+department|trai|cbi|gov)\b/i.test(
        combinedText,
      ) ||
      urls.some((u) => u.suspectedBrand === 'IRS')
    ) {
      increment('Government Impersonation');
    }

    // 8. Fake Job Offers
    if (
      indicators.some((i) => i.id === 'reward-job-scam' || i.id === 'off-platform-recruitment') &&
      /\b(job|work\s+from\s+home|part[- ]time|hiring|salary|earn|hr\s+manager|task)\b/i.test(
        combinedText,
      )
    ) {
      increment('Fake Job Offers');
    }

    // 9. Delivery Scams
    if (
      indicators.some((i) => i.category === 'delivery') ||
      /\b(fedex|dhl|ups|usps|india\s+post|package|parcel|redelivery|customs\s+duty)\b/i.test(
        combinedText,
      )
    ) {
      increment('Delivery Scams');
    }
  }

  const maxCount = Math.max(1, ...Array.from(counts.values()));
  return THREAT_CATEGORY_NAMES.map((name) => {
    const count = counts.get(name) ?? 0;
    return {
      name,
      count,
      percentage: count > 0 ? Math.round((count / maxCount) * 100) : 0,
    };
  }).sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export function generateThreatSummary(items: HistoryItem[], stats: OverviewStats): string {
  if (items.length === 0) {
    return 'No scan records yet. Run a message or URL check to populate threat intelligence and activity trends.';
  }

  if (stats.criticalCount > 0 || stats.highCount > 0) {
    const urgentTotal = stats.criticalCount + stats.highCount;
    const noun = urgentTotal === 1 ? 'item' : 'items';
    const criticalNote =
      stats.criticalCount > 0 ? ` (${stats.criticalCount} critical)` : '';
    return `${urgentTotal} high-risk ${noun}${criticalNote} detected across ${stats.totalScans} recent scan${stats.totalScans === 1 ? '' : 's'}. Review flagged items before interacting with the senders or links.`;
  }

  if (stats.mediumCount > 0) {
    return `${stats.mediumCount} medium-risk scan${stats.mediumCount === 1 ? '' : 's'} detected out of ${stats.totalScans} total checks. Verify senders via official apps before clicking links or sharing details.`;
  }

  return `All ${stats.totalScans} recent scan${stats.totalScans === 1 ? '' : 's'} scored low risk. Continue verifying unexpected financial or account requests independently.`;
}

function escapeCsvCell(value: string | number): string {
  let str = String(value ?? '');
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  return `"${str.replace(/"/g, '""')}"`;
}

export function exportHistoryToCsv(items: HistoryItem[]): void {
  const headers = [
    'Scan ID',
    'Message / URL Preview',
    'Scan Type',
    'Channel',
    'Risk Score',
    'Risk Level',
    'Indicators Detected',
    'Date and Time',
    'Summary',
  ];

  const rows = items.map((item, idx) => {
    const scanCode = `SCAN-${String(items.length - idx).padStart(3, '0')}`;
    return [
      scanCode,
      item.redactedPreview,
      item.mode === 'url' ? 'URL' : 'Message',
      item.mode === 'url' ? 'URL' : item.channel.toUpperCase(),
      item.score,
      item.classification,
      item.indicatorCount,
      new Date(item.createdAt).toISOString(),
      item.summary,
    ]
      .map(escapeCsvCell)
      .join(',');
  });

  const csvContent = [headers.map(escapeCsvCell).join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const today = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `scamshield-scan-report-${today}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Clearly labeled sample-only preview dataset for demonstrating dashboard charts when user history is empty.
export function buildSamplePreviewItems(): HistoryItem[] {
  const now = Date.now();
  const day = 86_400_000;
  const makeDate = (daysAgo: number, hour = 10) => {
    const d = new Date(now - daysAgo * day);
    d.setHours(hour, 15, 0, 0);
    return d.toISOString();
  };

  return [
    {
      id: 'demo-1',
      mode: 'message',
      channel: 'sms',
      redactedPreview: '[Sample] URGENT: Your HDFC Bank account will be suspended today due to pending KYC verification…',
      score: 90,
      classification: 'CRITICAL',
      summary: 'Critical fraud or phishing risk detected. Multiple severe credential-harvesting, coercion, or malicious link indicators matched.',
      indicatorCount: 4,
      createdAt: makeDate(0, 11),
      result: {
        mode: 'message',
        channel: 'sms',
        score: 90,
        classification: 'CRITICAL',
        summary: 'Critical fraud or phishing risk detected.',
        indicators: [
          {
            id: 'urgency-threat',
            title: 'Urgency or account-threat pressure',
            category: 'urgency',
            weight: 15,
            severity: 'medium',
            explanation: 'Threatens immediate account suspension.',
          },
          {
            id: 'financial-scam-lure',
            title: 'High-risk financial, KYC, or UPI payment lure',
            category: 'financial',
            weight: 20,
            severity: 'high',
            explanation: 'Requests urgent KYC verification.',
          },
          {
            id: 'brand-gov-impersonation',
            title: 'Claims to represent HDFC',
            category: 'impersonation',
            weight: 20,
            severity: 'high',
            explanation: 'Impersonates a banking institution.',
          },
          {
            id: 'suspicious-url-embedded',
            title: 'Suspicious URL detected in message',
            category: 'url',
            weight: 30,
            severity: 'high',
            explanation: 'Uses a lookalike .xyz domain over HTTP.',
            evidence: 'http://hdfc-kyc-update.xyz/verify-account',
          },
        ],
        urls: [
          {
            originalUrl: 'http://hdfc-kyc-update.xyz/verify-account',
            normalizedUrl: 'http://hdfc-kyc-update.xyz/verify-account',
            valid: true,
            scheme: 'http',
            hostname: 'hdfc-kyc-update.xyz',
            port: '',
            pathSummary: '/verify-account',
            isHttps: false,
            isShortener: false,
            isIpAddress: false,
            subdomainCount: 0,
            urlLength: 41,
            suspectedBrand: 'HDFC',
            flags: [],
            urlRiskScore: 80,
            safetyNote: 'Sample preview URL.',
          },
        ],
        recommendations: ['Do not click the link.', 'Verify inside your official bank app.'],
        contextNotes: ['Sample demonstration record.'],
        analyzedAt: makeDate(0, 11),
        characterCount: 145,
        savedToHistory: false,
        redactedPreview: '[Sample] URGENT: Your HDFC Bank account will be suspended today…',
      },
    },
    {
      id: 'demo-2',
      mode: 'url',
      channel: 'auto',
      redactedPreview: '[Sample] https://paypa1-account-verify.xyz/signin',
      score: 65,
      classification: 'HIGH',
      summary: 'High risk URL structure detected.',
      indicatorCount: 3,
      createdAt: makeDate(1, 15),
      result: {
        mode: 'url',
        score: 65,
        classification: 'HIGH',
        summary: 'High risk URL structure detected.',
        indicators: [
          {
            id: 'url-flag-brand',
            title: 'Possible PayPal lookalike or impersonation domain',
            category: 'url',
            weight: 35,
            severity: 'high',
            explanation: 'Domain mimics PayPal using digit substitution.',
          },
        ],
        urls: [
          {
            originalUrl: 'https://paypa1-account-verify.xyz/signin',
            normalizedUrl: 'https://paypa1-account-verify.xyz/signin',
            valid: true,
            scheme: 'https',
            hostname: 'paypa1-account-verify.xyz',
            port: '',
            pathSummary: '/signin',
            isHttps: true,
            isShortener: false,
            isIpAddress: false,
            subdomainCount: 0,
            urlLength: 40,
            suspectedBrand: 'PayPal',
            flags: [],
            urlRiskScore: 65,
            safetyNote: 'Sample preview URL.',
          },
        ],
        recommendations: ['Do not enter credentials on lookalike domains.'],
        contextNotes: ['Sample demonstration record.'],
        analyzedAt: makeDate(1, 15),
        characterCount: 40,
        savedToHistory: false,
        redactedPreview: '[Sample] https://paypa1-account-verify.xyz/signin',
      },
    },
    {
      id: 'demo-3',
      mode: 'message',
      channel: 'whatsapp',
      redactedPreview: '[Sample] TRAI Notice: Your number will be disconnected. Stay on video call for digital arrest verification…',
      score: 65,
      classification: 'HIGH',
      summary: 'High likelihood of a scam or phishing attempt.',
      indicatorCount: 3,
      createdAt: makeDate(2, 14),
      result: {
        mode: 'message',
        channel: 'whatsapp',
        score: 65,
        classification: 'HIGH',
        summary: 'High likelihood of a scam or phishing attempt.',
        indicators: [
          {
            id: 'urgency-threat',
            title: 'Urgency or account-threat pressure',
            category: 'urgency',
            weight: 15,
            severity: 'medium',
            explanation: 'Coercive digital arrest and video call demand.',
            evidence: 'digital arrest, stay on video call',
          },
          {
            id: 'brand-gov-impersonation',
            title: 'Claims to represent TRAI',
            category: 'impersonation',
            weight: 20,
            severity: 'high',
            explanation: 'Impersonates a government regulator.',
            evidence: 'TRAI',
          },
        ],
        urls: [],
        recommendations: ['Law enforcement never conducts arrests over video calls.'],
        contextNotes: ['Sample demonstration record.'],
        analyzedAt: makeDate(2, 14),
        characterCount: 112,
        savedToHistory: false,
        redactedPreview: '[Sample] TRAI Notice: Your number will be disconnected…',
      },
    },
    {
      id: 'demo-4',
      mode: 'url',
      channel: 'auto',
      redactedPreview: '[Sample] https://bit.ly/claim-upi-cashback-99',
      score: 35,
      classification: 'MEDIUM',
      summary: 'Moderate risk URL.',
      indicatorCount: 2,
      createdAt: makeDate(4, 9),
      result: {
        mode: 'url',
        score: 35,
        classification: 'MEDIUM',
        summary: 'Moderate risk URL.',
        indicators: [
          {
            id: 'url-flag-shortener',
            title: 'URL shortener hides final destination (bit.ly)',
            category: 'url',
            weight: 20,
            severity: 'medium',
            explanation: 'Shortened link obscures target domain.',
          },
        ],
        urls: [
          {
            originalUrl: 'https://bit.ly/claim-upi-cashback-99',
            normalizedUrl: 'https://bit.ly/claim-upi-cashback-99',
            valid: true,
            scheme: 'https',
            hostname: 'bit.ly',
            port: '',
            pathSummary: '/claim-upi-cashback-99',
            isHttps: true,
            isShortener: true,
            isIpAddress: false,
            subdomainCount: 0,
            urlLength: 36,
            suspectedBrand: null,
            flags: [],
            urlRiskScore: 35,
            safetyNote: 'Sample preview URL.',
          },
        ],
        recommendations: ['Avoid shortened links for financial or UPI cashback claims.'],
        contextNotes: ['Sample demonstration record.'],
        analyzedAt: makeDate(4, 9),
        characterCount: 36,
        savedToHistory: false,
        redactedPreview: '[Sample] https://bit.ly/claim-upi-cashback-99',
      },
    },
    {
      id: 'demo-5',
      mode: 'message',
      channel: 'sms',
      redactedPreview: '[Sample] Rs. 480.00 debited from A/C XX4912 via UPI Ref 43••••12. Do not share OTP or PIN.',
      score: 0,
      classification: 'LOW',
      summary: 'Relatively safe indicators detected.',
      indicatorCount: 0,
      createdAt: makeDate(5, 18),
      result: {
        mode: 'message',
        channel: 'sms',
        score: 0,
        classification: 'LOW',
        summary: 'Relatively safe indicators detected.',
        indicators: [],
        urls: [],
        recommendations: ['Verify unexpected transactions via your official bank app.'],
        contextNotes: ['Sample demonstration record.'],
        analyzedAt: makeDate(5, 18),
        characterCount: 120,
        savedToHistory: false,
        redactedPreview: '[Sample] Rs. 480.00 debited from A/C XX4912…',
      },
    },
  ];
}
