import type {
  AnalysisResult,
  HighlightSegment,
  IndicatorItem,
  MessageChannel,
  UrlAnalysisDetail,
  VerifiedBrandHint,
} from '../../src/types/scamshield.ts';
import { analyzeMessageContent } from './messageAnalyzer.ts';
import { buildRecommendations } from './recommendations.ts';
import { calculateRiskScore } from './riskScoring.ts';
import { analyzeUrl } from './urlAnalyzer.ts';

export function maskSensitiveDigits(input: string): string {
  return input
    .replace(/\b(\d{4})[- ](\d{4})[- ](\d{4})[- ](\d{4})\b/g, '$1-••••-••••-$4')
    .replace(/\b(\d{4})[- ](\d{4})[- ](\d{4})\b/g, '$1-••••-$3')
    .replace(/\b[A-Z]{5}\d{4}[A-Z]\b/g, '•••PAN••••')
    .replace(/(\+\d{1,3}[- ]\d{4,5})[- ]\d{2,3}(\d{2,3})\b/g, '$1-•••$2')
    .replace(/\b(\d{2})\d{4,}(\d{2})\b/g, '$1••••$2')
    .replace(/\b(otp|pin|cvv|code)\s*(?:is|:)?\s*\d{4,8}\b/gi, '$1 ••••');
}

export function redactSensitivePreview(input: string, maxLength = 140): string {
  let masked = maskSensitiveDigits(input).replace(/\s+/g, ' ').trim();

  if (masked.length > maxLength) {
    masked = `${masked.slice(0, maxLength - 1).trimEnd()}…`;
  }
  return masked;
}

export function buildHighlightSegments(
  text: string,
  indicators: IndicatorItem[],
  urls: UrlAnalysisDetail[],
): HighlightSegment[] {
  const safeText = maskSensitiveDigits(text);
  if (!safeText) return [];

  interface SpanCandidate {
    start: number;
    end: number;
    category: IndicatorItem['category'];
    label: string;
    priority: number;
  }

  const candidates: SpanCandidate[] = [];
  const lowerText = safeText.toLowerCase();

  const addMatchesForTerm = (
    rawTerm: string,
    category: IndicatorItem['category'],
    label: string,
    priority: number,
  ) => {
    const cleanTerm = maskSensitiveDigits(rawTerm).trim();
    if (cleanTerm.length < 3) return;
    const needle = cleanTerm.toLowerCase();
    let idx = 0;
    while (idx < lowerText.length) {
      const foundAt = lowerText.indexOf(needle, idx);
      if (foundAt === -1) break;
      candidates.push({
        start: foundAt,
        end: foundAt + cleanTerm.length,
        category,
        label,
        priority,
      });
      idx = foundAt + cleanTerm.length;
    }
  };

  for (const ind of indicators) {
    const snippets = ind.matchedSnippets ?? [];
    for (const snip of snippets) {
      addMatchesForTerm(snip, ind.category, ind.title, ind.weight);
    }
  }

  for (const u of urls) {
    if (u.urlRiskScore > 0 || u.isShortener || u.isIpAddress || !u.valid) {
      addMatchesForTerm(
        u.originalUrl,
        'url',
        u.suspectedBrand ? `Lookalike ${u.suspectedBrand} link` : 'Suspicious URL',
        Math.max(35, u.urlRiskScore),
      );
    }
  }

  if (candidates.length === 0) {
    return [{ text: safeText }];
  }

  // Sort by highest priority first, then longest span, then earliest position
  candidates.sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    const lenDiff = b.end - b.start - (a.end - a.start);
    if (lenDiff !== 0) return lenDiff;
    return a.start - b.start;
  });

  const accepted: SpanCandidate[] = [];
  for (const cand of candidates) {
    const overlaps = accepted.some((acc) => cand.start < acc.end && cand.end > acc.start);
    if (!overlaps) {
      accepted.push(cand);
    }
  }

  accepted.sort((a, b) => a.start - b.start);

  const segments: HighlightSegment[] = [];
  let cursor = 0;
  for (const span of accepted) {
    if (span.start > cursor) {
      segments.push({ text: safeText.slice(cursor, span.start) });
    }
    segments.push({
      text: safeText.slice(span.start, span.end),
      category: span.category,
      label: span.label,
    });
    cursor = span.end;
  }
  if (cursor < safeText.length) {
    segments.push({ text: safeText.slice(cursor) });
  }

  return segments;
}

export function runMessageAnalysis(params: {
  text: string;
  channel?: MessageChannel;
  saveToHistory?: boolean;
}): AnalysisResult {
  const channel: MessageChannel = params.channel ?? 'auto';
  const trimmed = params.text.trim();
  const extraction = analyzeMessageContent(trimmed, channel);
  const scoring = calculateRiskScore({
    mode: 'message',
    indicators: extraction.indicators,
    urls: extraction.urls,
    protectiveSignalsCount: extraction.protectiveSignalsCount,
  });
  const recommendations = buildRecommendations({
    mode: 'message',
    classification: scoring.classification,
    indicators: extraction.indicators,
    urls: extraction.urls,
    verifiedBrandHints: extraction.verifiedBrandHints,
  });

  const highlightedSegments = buildHighlightSegments(
    extraction.normalizedText,
    extraction.indicators,
    extraction.urls,
  );

  return {
    mode: 'message',
    channel,
    score: scoring.score,
    classification: scoring.classification,
    summary: scoring.summary,
    indicators: extraction.indicators,
    urls: extraction.urls,
    recommendations,
    contextNotes: extraction.contextNotes,
    highlightedSegments,
    verifiedBrandHints: extraction.verifiedBrandHints,
    analyzedAt: new Date().toISOString(),
    characterCount: trimmed.length,
    savedToHistory: Boolean(params.saveToHistory),
    redactedPreview: redactSensitivePreview(trimmed),
  };
}

export function runUrlAnalysis(params: {
  url: string;
  saveToHistory?: boolean;
}): AnalysisResult {
  const trimmed = params.url.trim();
  const urlDetail = analyzeUrl(trimmed);

  const indicators: IndicatorItem[] = urlDetail.flags.map((flag, idx) => ({
    id: `url-flag-${flag.code.toLowerCase()}-${idx}`,
    title: flag.label,
    category: 'url',
    weight: flag.weight,
    severity: flag.weight >= 25 ? 'high' : flag.weight >= 15 ? 'medium' : 'low',
    explanation: flag.explanation,
    evidence: urlDetail.hostname || urlDetail.originalUrl,
  }));

  const verifiedBrandHints: VerifiedBrandHint[] =
    urlDetail.suspectedBrand && urlDetail.officialDomains
      ? [{ brand: urlDetail.suspectedBrand, officialDomains: urlDetail.officialDomains }]
      : [];

  const scoring = calculateRiskScore({
    mode: 'url',
    indicators,
    urls: [urlDetail],
    protectiveSignalsCount: 0,
  });

  const recommendations = buildRecommendations({
    mode: 'url',
    classification: scoring.classification,
    indicators,
    urls: [urlDetail],
    verifiedBrandHints,
  });

  const contextNotes = [urlDetail.safetyNote];
  if (urlDetail.valid && urlDetail.isHttps) {
    contextNotes.push(
      'Protocol: HTTPS (encryption in transit verified, domain trustworthiness still requires user verification).',
    );
  } else if (urlDetail.valid && urlDetail.scheme === 'http') {
    contextNotes.push('Protocol: HTTP (unencrypted connection).');
  }

  return {
    mode: 'url',
    score: scoring.score,
    classification: scoring.classification,
    summary: scoring.summary,
    indicators,
    urls: [urlDetail],
    recommendations,
    contextNotes,
    verifiedBrandHints,
    analyzedAt: new Date().toISOString(),
    characterCount: trimmed.length,
    savedToHistory: Boolean(params.saveToHistory),
    redactedPreview: redactSensitivePreview(trimmed, 120),
  };
}
