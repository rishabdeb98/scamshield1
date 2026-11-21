import type {
  AnalysisMode,
  IndicatorItem,
  RiskLevel,
  UrlAnalysisDetail,
} from '../../src/types/scamshield.ts';

export interface ScoringOutcome {
  score: number;
  classification: RiskLevel;
  summary: string;
}

export function classifyScore(score: number): RiskLevel {
  if (score >= 80) return 'CRITICAL';
  if (score >= 60) return 'HIGH';
  if (score >= 30) return 'MEDIUM';
  return 'LOW';
}

export function calculateRiskScore(params: {
  mode: AnalysisMode;
  indicators: IndicatorItem[];
  urls: UrlAnalysisDetail[];
  protectiveSignalsCount: number;
}): ScoringOutcome {
  const { mode, indicators, urls, protectiveSignalsCount } = params;

  let rawScore = 0;

  if (mode === 'url') {
    const primaryUrl = urls[0];
    rawScore = primaryUrl ? primaryUrl.urlRiskScore : 0;
  } else {
    rawScore = indicators.reduce((sum, item) => sum + item.weight, 0);

    // Synergy check: credential/financial/coercion + urgency + suspicious URL/impersonation increases confidence
    const categories = new Set(indicators.map((i) => i.category));
    const hasHighRiskCombo =
      categories.has('urgency') &&
      (categories.has('url') || categories.has('credential')) &&
      (categories.has('financial') || categories.has('impersonation') || categories.has('delivery'));

    const hasDigitalArrestOrRemoteTrap = indicators.some(
      (i) => i.id === 'coercion-extortion' || i.id === 'remote-access-trap',
    );

    if ((hasHighRiskCombo || hasDigitalArrestOrRemoteTrap) && rawScore < 75) {
      rawScore += 10;
    }

    // Dampen false positives when protective legitimate phrasing is present and no hard scam lure exists
    if (
      protectiveSignalsCount > 0 &&
      !categories.has('credential') &&
      !categories.has('reward') &&
      !urls.some((u) => u.urlRiskScore >= 25)
    ) {
      rawScore = Math.max(0, rawScore - 15);
    }
  }

  const score = Math.max(0, Math.min(100, Math.round(rawScore)));
  const classification = classifyScore(score);

  let summary = '';
  if (mode === 'url') {
    if (classification === 'CRITICAL') {
      summary =
        'Critical risk URL detected. Severe phishing, brand-impersonation, or obfuscation indicators are present—do not open this link.';
    } else if (classification === 'HIGH') {
      summary =
        'High risk URL structure detected. Multiple strong threat indicators point toward phishing or link obfuscation.';
    } else if (classification === 'MEDIUM') {
      summary =
        'Moderate risk URL. Suspicious structural indicators (such as link shortening, HTTP, or unusual length) warrant caution.';
    } else {
      summary =
        'Low structural risk detected in this URL. Remember that a low-risk score does not guarantee a site is safe—always verify the sender.';
    }
  } else {
    if (classification === 'CRITICAL') {
      summary =
        'Critical fraud or phishing risk detected. Multiple severe credential-harvesting, coercion, or malicious link indicators matched.';
    } else if (classification === 'HIGH') {
      summary =
        'High likelihood of a scam or phishing attempt. Multiple strong social-engineering, credential, or link indicators were triggered.';
    } else if (classification === 'MEDIUM') {
      summary =
        'Potentially suspicious message. Suspicious indicators detected; verify through an official app or trusted number before responding.';
    } else {
      summary =
        'Relatively safe indicators detected. No strong scam lures were found, though a low-risk score does not guarantee complete safety.';
    }
  }

  return { score, classification, summary };
}
