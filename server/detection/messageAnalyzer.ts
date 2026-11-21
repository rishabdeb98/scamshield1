import type {
  IndicatorItem,
  MessageChannel,
  UrlAnalysisDetail,
  VerifiedBrandHint,
} from '../../src/types/scamshield.ts';
import {
  analyzeUrl,
  extractUrlsFromText,
  isOfficialDomainForBrand,
  OFFICIAL_BRAND_DOMAINS,
} from './urlAnalyzer.ts';

export interface MessageExtraction {
  indicators: IndicatorItem[];
  urls: UrlAnalysisDetail[];
  contextNotes: string[];
  verifiedBrandHints: VerifiedBrandHint[];
  protectiveSignalsCount: number;
  normalizedText: string;
}

const ZERO_WIDTH_DETECT_REGEX = /[\u200B-\u200D\uFEFF\u00AD]/;
const ZERO_WIDTH_STRIP_REGEX = /[\u200B-\u200D\uFEFF\u00AD]/g;

const PROTECTIVE_OTP_PHRASES =
  /\b(do\s+not\s+share|never\s+share|don't\s+share|do\s+not\s+disclose|not\s+initiated\s+by\s+you|if\s+you\s+did\s+not\s+request|did\s+not\s+make\s+this)\b/i;

const LEGIT_INFO_TRANSACTION =
  /\b(debited|credited|spent|withdrawn|payment\s+of|upi\s+ref|txn\s+id|available\s+bal|a\/c\s*[x*]{2,}\d{2,4}|ending\s+in\s+\d{4})\b/i;

const LEGIT_DELIVERY_STATUS =
  /\b(out\s+for\s+delivery|dispatched|arriving\s+today|delivered\s+to|tracking\s+(?:id|number|#)\s*:?\s*[a-z0-9]{6,}|pin\s+at\s+doorstep)\b/i;

const CREDENTIAL_HARVEST_A =
  /\b(share|send|reply|provide|enter|confirm|verify|submit|type|tell\s+me)\b[^.!\n]{0,45}\b(otp|one[- ]time\s+password|passcode|pin|cvv|password|login\s+details|card\s+number|ssn|pan\s+number|aadhaar)\b/gi;
const CREDENTIAL_HARVEST_B =
  /\b(otp|password|pin|cvv|kyc)\b[^.!\n]{0,35}\b(expire|required|verify|update|click|link|send\s+back|share)\b/gi;
const MENTIONS_OTP_OR_PASSWORD = /\b(otp|one[- ]time\s+password|password|pin|cvv)\b/i;
const DOORSTEP_PIN_PATTERN = /\b(doorstep|upon\s+receiving|delivery\s+pin|delivery\s+agent)\b/i;
const REMOTE_LINK_ACTION_PATTERN = /\b(click|link|http|reply\s+with|send\s+to)\b/i;

const REMOTE_ACCESS_REGEX =
  /\b(anydesk|teamviewer|quicksupport|quick\s+support|rustdesk|ultraviewer|screen[- ]?sharing\s+app)\b|\b(?:download|install)\b[^.!\n]{0,40}\.apk\b/gi;

const URGENCY_REGEX =
  /\b(immediately|urgent|urgently|right\s+now|today\s+only|tonight|before\s+midnight|within\s+\d+\s*(?:hours?|hrs?|minutes?|mins?)|final\s+warning|last\s+chance|act\s+now|expires?\s+(?:today|tonight|soon|in\s+\d+)|(?:will\s+be|has\s+been)\s+(?:suspended|blocked|frozen|terminated|closed|deactivated|deleted|disconnected)|legal\s+action|penalty)\b|\bpay\b[^.!\n]{0,30}\btoday\b/gi;

const COERCION_REGEX =
  /\b(digital\s+arrest|arrest\s+warrant|stay\s+on\s+(?:video|skype|whatsapp)\s+call|do\s+not\s+(?:inform|tell)\s+anyone|keep\s+(?:this|it)\s+(?:secret|confidential)|money\s+laundering|narcotics\s+parcel)\b/gi;

const UTILITY_SIM_REGEX =
  /\b(?:electricity\s+(?:power|connection|supply|bill|officer|office)|previous\s+month\s+bill\s+was\s+not\s+updated|(?:sim|mobile\s+number|esim)\s+(?:will\s+be|is\s+about\s+to\s+be)\s+(?:blocked|deactivated|suspended))\b/gi;

const FINANCIAL_SCAM_REGEX =
  /\b(kyc\s*(?:verify|verification|update|pending|expired|suspended)|verify\s+(?:your\s+)?(?:kyc|bank\s+account|pan|card)|unclaimed\s+refund|tax\s+refund|refund\s+pending|(?:processing|registration|security|clearance|redelivery|verification)\s+fee|laptop\s+security\s+fee|security\s+deposit|send\s+(?:money|funds|gift\s*cards?|bitcoin|crypto|usdt)|transfer\s+(?:minimum\s+|immediately|now|(?:rs\.?|₹|\$)\s*[\d,]+|security\s+deposit)|pay\s+(?:a\s+)?(?:small|refundable)?\s*(?:fee|(?:rs\.?|₹|\$)\s*[\d,]+)|(?:enter|type)\s+(?:your\s+)?upi\s+pin\s+to\s+(?:receive|claim)|scan\s+(?:this\s+)?qr\s+(?:code\s+)?to\s+(?:receive|claim)|upi\s+(?:cashback|collect\s+request|reward)\s+(?:claim|approve)|approve\s+(?:the\s+)?collect\s+request)\b/gi;

const ACCIDENTAL_REFUND_REGEX =
  /\b(?:(?:transferred|sent|credited)\s+(?:rs\.?|₹|\$)?\s*[\d,]+\s+by\s+mistake|accidental\s+transfer|(?:see|check)\s+screenshot[^.!\n]{0,45}refund|refund\s+(?:rs\.?|₹|\$)?\s*[\d,]*\s*(?:back|urgently|right\s+now))\b/gi;

const GENERIC_BANK_MENTION = /\b(bank|account|upi|debit|credit\s+card|transaction|payment)\b/i;

const IMPERSONATION_REGEX =
  /\b(irs|hmrc|income\s+tax(?:\s+department)?|reserve\s+bank|rbi|sebi|trai|cbi|enforcement\s+directorate|uidai|epfo|sbi|state\s+bank\s+of\s+india|hdfc|icici|axis\s+bank|chase|wells\s+fargo|bank\s+of\s+america|paypal|amazon|flipkart|paytm|phonepe|netflix|apple\s+support|microsoft\s+support|whatsapp\s+team|instagram|fedex|dhl|usps|ups|india\s+post|bluedart|delhivery|airtel|jio|customs\s+department|police\s+cyber|cyber\s+crime\s+cell|pm\s+[a-z\s]{2,25}scheme|welfare\s+scheme|direct\s+subsidy|electricity\s+(?:board|department|office))\b/gi;

const EXTERNAL_ACTION_REGEX =
  /\b(click\s+(?:here|the\s+link|below)|call\s+\+?\d|contact\s+(?:our\s+)?[a-z\s]{0,20}\d{5,}|message\s+(?:us\s+)?on\s+(?:whatsapp|telegram)|reply\s+with|join\s+(?:the\s+)?video\s+call|digital\s+arrest)\b/i;

const REWARD_JOB_REGEX =
  /\b(congratulations[!,\s]+you(?:'ve|\s+have)?\s+won|lucky\s+winner|won\s+(?:a\s+)?(?:lottery|prize|jackpot|iphone|cash)|claim\s+your\s+(?:prize|reward|bonus)|guaranteed\s+(?:daily|weekly)\s+(?:income|earnings)|earn\s+(?:rs\.?|₹|inr|\$|€|£)?\s*[\d,]+(?:\s*(?:to|-)\s*(?:rs\.?|₹|inr|\$|€|£)?\s*[\d,]+)?\s*(?:\/|per)\s*(?:day|hour|hr|week)|work\s+from\s+home\s+(?:part[- ]time|no\s+experience)|part[- ]time\s+job\s+offer|like\s+youtube\s+videos\s+and\s+earn|selected\s+for\s+a\s+cash\s+reward)\b/gi;

const INVESTMENT_SCAM_REGEX =
  /\b(guaranteed\s+(?:\d+%\s*)?(?:weekly|monthly|daily)?\s*returns?|zero\s+risk|double\s+your\s+(?:capital|money|investment)|vip\s+(?:stock|crypto|trading)\s+group)\b/gi;

const JOB_ADVANCE_FEE_REGEX =
  /\b(shortlisted\s+for[^.!\n]{0,40}|confirm\s+offer\s+letter|(?:registration|laptop\s+security|training|onboarding)\s+(?:and\s+\w+\s+)?fee)\b/gi;

const MESSAGING_APP_MENTION = /\b(whatsapp|telegram)\b/gi;
const RECRUIT_CONTEXT_REGEX =
  /\b(job|salary|earn|income|hiring|hr\s+manager|part[- ]time|commission|task|trading)\b/i;

const DELIVERY_TRAP_REGEX =
  /\b(package\s+(?:is\s+)?(?:held|suspended|on\s+hold)|parcel\s+(?:is\s+)?(?:held|on\s+hold)|incomplete\s+(?:shipping\s+)?address|unable\s+to\s+deliver|reschedule\s+(?:your\s+)?delivery|redelivery\s+(?:fee|link)|update\s+(?:your\s+)?delivery\s+address|customs\s+duty\s+unpaid|unpaid\s+clearance\s+duty)\b/gi;

const BRAND_KEYWORDS: Array<{ brand: string; pattern: RegExp; contextOnly?: boolean }> = [
  { brand: 'SBI', pattern: /\b(sbi|state\s+bank\s+of\s+india|yono(?:\s+sbi)?)\b/i },
  { brand: 'HDFC', pattern: /\bhdfc(?:\s+bank)?\b/i },
  { brand: 'ICICI', pattern: /\bicici(?:\s+bank|\s+card\s+services)?\b/i },
  { brand: 'Axis', pattern: /\baxis(?:\s+bank)?\b/i },
  { brand: 'Chase', pattern: /\bchase(?:\s+bank)?\b/i },
  { brand: 'Wells Fargo', pattern: /\bwells\s+fargo\b/i },
  { brand: 'Bank of America', pattern: /\bbank\s+of\s+america\b/i },
  { brand: 'PayPal', pattern: /\bpaypal\b/i },
  { brand: 'Amazon', pattern: /\bamazon\b/i },
  { brand: 'Flipkart', pattern: /\bflipkart\b/i },
  { brand: 'FedEx', pattern: /\bfedex\b/i },
  { brand: 'DHL', pattern: /\bdhl\b/i },
  { brand: 'USPS', pattern: /\busps\b/i },
  { brand: 'UPS', pattern: /\bups\b/i },
  { brand: 'India Post', pattern: /\bindia\s+post\b/i },
  { brand: 'BlueDart', pattern: /\bblue\s*dart\b/i },
  { brand: 'Delhivery', pattern: /\bdelhivery\b/i },
  { brand: 'UIDAI', pattern: /\b(uidai|aadhaar)\b/i },
  { brand: 'Income Tax', pattern: /\b(income\s+tax(?:\s+department)?|incometax)\b/i },
  { brand: 'EPFO', pattern: /\bepfo\b/i },
  { brand: 'TRAI', pattern: /\btrai\b/i },
  { brand: 'Airtel', pattern: /\bairtel\b/i },
  { brand: 'Jio', pattern: /\bjio\b/i },
  { brand: 'Paytm', pattern: /\bpaytm\b/i },
  { brand: 'PhonePe', pattern: /\bphonepe\b/i },
  { brand: 'Instagram', pattern: /\b(instagram|meta)\b/i },
  { brand: 'Netflix', pattern: /\bnetflix\b/i },
  { brand: 'Apple', pattern: /\bapple(?:\s+support)?\b/i },
  { brand: 'Microsoft', pattern: /\bmicrosoft(?:\s+support)?\b/i },
  { brand: 'IRS', pattern: /\birs\b/i },
  { brand: 'WhatsApp', pattern: /\bwhatsapp\s+(?:team|support|security|verification)\b/i, contextOnly: true },
];

function collectMatches(text: string, globalRegex: RegExp, max = 8): string[] {
  globalRegex.lastIndex = 0;
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = globalRegex.exec(text)) !== null) {
    const val = m[0].trim();
    if (val) found.add(val);
    if (found.size >= max) break;
  }
  globalRegex.lastIndex = 0;
  return Array.from(found);
}

export function analyzeMessageContent(
  text: string,
  channel: MessageChannel = 'auto',
): MessageExtraction {
  const hasZeroWidthChars = ZERO_WIDTH_DETECT_REGEX.test(text);
  const normalized = text.replace(ZERO_WIDTH_STRIP_REGEX, '').trim();
  const indicators: IndicatorItem[] = [];
  const contextNotes: string[] = [];

  if (hasZeroWidthChars) {
    indicators.push({
      id: 'zero-width-obfuscation',
      title: 'Hidden zero-width character obfuscation',
      category: 'context',
      weight: 20,
      severity: 'high',
      explanation:
        'Invisible Unicode characters were embedded inside words (a common spammer technique used to bypass SMS and email keyword filters).',
      evidence: 'Invisible Unicode characters stripped during inspection',
    });
  }

  // 1. Extract and analyze embedded URLs statically
  const extractedRawUrls = extractUrlsFromText(normalized);
  const urls = extractedRawUrls.map((u) => analyzeUrl(u));

  // Detect protective phrasing that legitimate banks/services include
  const hasProtectiveOtpNotice = PROTECTIVE_OTP_PHRASES.test(normalized);
  const hasLegitTxnPattern = LEGIT_INFO_TRANSACTION.test(normalized);
  const hasLegitDeliveryPattern = LEGIT_DELIVERY_STATUS.test(normalized);

  // 2. OTP / Password / Credential Harvesting Check (context-aware)
  const credSnippets = [
    ...collectMatches(normalized, CREDENTIAL_HARVEST_A, 4),
    ...collectMatches(normalized, CREDENTIAL_HARVEST_B, 4),
  ];
  const asksForCredentials = credSnippets.length > 0;
  const mentionsOtpOrPassword = MENTIONS_OTP_OR_PASSWORD.test(normalized);

  const isDoorstepDeliveryPin =
    hasLegitDeliveryPattern &&
    urls.length === 0 &&
    DOORSTEP_PIN_PATTERN.test(normalized) &&
    !REMOTE_LINK_ACTION_PATTERN.test(normalized);

  if (asksForCredentials && !hasProtectiveOtpNotice && !isDoorstepDeliveryPin) {
    indicators.push({
      id: 'credential-request',
      title: 'Credential or OTP harvesting request',
      category: 'credential',
      weight: 30,
      severity: 'high',
      explanation:
        'The message asks you to share, send, or submit an OTP, password, PIN, or sensitive identity details. Legitimate banks and services never ask you to hand over an OTP or password.',
      evidence: credSnippets[0],
      matchedSnippets: credSnippets,
    });
  } else if (isDoorstepDeliveryPin) {
    contextNotes.push(
      'Mentions a doorstep delivery PIN alongside a standard tracking update and zero links—consistent with legitimate courier handoff verification.',
    );
  } else if (mentionsOtpOrPassword && hasProtectiveOtpNotice && urls.length === 0) {
    contextNotes.push(
      'Contains an OTP/security keyword paired with a standard "do not share" warning and no external links—consistent with legitimate two-factor or bank alerts.',
    );
  }

  // 2b. Remote-Access / Screen-Sharing & Malicious APK Lures
  const remoteSnippets = collectMatches(normalized, REMOTE_ACCESS_REGEX, 4);
  if (remoteSnippets.length > 0) {
    indicators.push({
      id: 'remote-access-trap',
      title: 'Remote-access app or APK sideloading request',
      category: 'credential',
      weight: 35,
      severity: 'high',
      explanation: `Instructs you to install or share access via a remote-control tool or APK (${remoteSnippets.join(', ')}). Scammers use screen-sharing apps to watch OTPs and drain bank accounts.`,
      evidence: remoteSnippets.join(', '),
      matchedSnippets: remoteSnippets,
    });
  }

  // 3. Urgency & Coercion / Threat Indicators
  const urgencyMatches = collectMatches(normalized, URGENCY_REGEX, 6);
  if (urgencyMatches.length > 0) {
    const uniqueTerms = Array.from(new Set(urgencyMatches.map((m) => m.toLowerCase()))).slice(0, 4);
    indicators.push({
      id: 'urgency-threat',
      title: 'Urgency or account-threat pressure',
      category: 'urgency',
      weight: 15,
      severity: 'medium',
      explanation: `Uses time pressure or threatening consequences (${uniqueTerms.join(', ')}) designed to panic the recipient into acting before verifying.`,
      evidence: uniqueTerms.join(', '),
      matchedSnippets: urgencyMatches,
    });
  }

  // 3b. Digital Arrest, Legal Extortion & Forced Secrecy
  const coercionMatches = collectMatches(normalized, COERCION_REGEX, 5);
  if (coercionMatches.length > 0) {
    indicators.push({
      id: 'coercion-extortion',
      title: 'Digital arrest or secrecy coercion tactic',
      category: 'urgency',
      weight: 30,
      severity: 'high',
      explanation: `Uses fake legal intimidation or forced isolation (${coercionMatches.join(', ')}). Law enforcement never conducts "digital arrests" or demands secrecy over video calls.`,
      evidence: coercionMatches.join(', '),
      matchedSnippets: coercionMatches,
    });
  }

  // 3c. Utility / Electricity Disconnection & SIM Blocking Traps
  const utilitySimMatches = collectMatches(normalized, UTILITY_SIM_REGEX, 4);
  if (utilitySimMatches.length > 0) {
    indicators.push({
      id: 'utility-sim-threat',
      title: 'Electricity disconnection or SIM-blocking threat',
      category: 'urgency',
      weight: 25,
      severity: 'high',
      explanation: `Threatens sudden utility disconnection or SIM suspension (${utilitySimMatches.join(', ')}), a widespread scam tactic directing victims to call a fraudster's personal number.`,
      evidence: utilitySimMatches.join(', '),
      matchedSnippets: utilitySimMatches,
    });
  }

  // 4. Financial / KYC / UPI Fraud / Payment / Refund Lures
  const scamFinancialMatches = collectMatches(normalized, FINANCIAL_SCAM_REGEX, 6);
  const accidentalRefundMatches = collectMatches(normalized, ACCIDENTAL_REFUND_REGEX, 4);
  const genericBankMention = GENERIC_BANK_MENTION.test(normalized);

  if (accidentalRefundMatches.length > 0) {
    indicators.push({
      id: 'accidental-upi-refund',
      title: 'Accidental transfer / screenshot refund pressure',
      category: 'financial',
      weight: 25,
      severity: 'high',
      explanation: `Claims money was sent by mistake or relies on a screenshot while pressuring you to send a refund (${accidentalRefundMatches.join(', ')}). Always verify your real bank balance inside your official banking app before transferring anything.`,
      evidence: accidentalRefundMatches.join(', '),
      matchedSnippets: accidentalRefundMatches,
    });
  }

  if (scamFinancialMatches.length > 0) {
    const sample = Array.from(new Set(scamFinancialMatches.map((m) => m.toLowerCase()))).slice(0, 3);
    indicators.push({
      id: 'financial-scam-lure',
      title: 'High-risk financial, KYC, or UPI payment lure',
      category: 'financial',
      weight: 20,
      severity: 'high',
      explanation: `Contains classic financial scam phrasing (${sample.join(', ')}) such as forced KYC updates, fake UPI collect/QR receive prompts, unexpected refunds, or upfront fees.`,
      evidence: sample.join(', '),
      matchedSnippets: scamFinancialMatches,
    });
  } else if (genericBankMention && urls.length > 0 && !hasProtectiveOtpNotice) {
    indicators.push({
      id: 'financial-link-combo',
      title: 'Financial notice paired with clickable link',
      category: 'financial',
      weight: 15,
      severity: 'medium',
      explanation:
        'Combines banking or payment terminology with an embedded link. Official financial alerts typically instruct you to open your banking app directly rather than clicking a link.',
    });
  } else if (hasLegitTxnPattern && urls.length === 0 && !asksForCredentials && urgencyMatches.length === 0) {
    contextNotes.push(
      'Mentions banking/transaction terms in an informational format (account mask/reference without links or credential demands).',
    );
  }

  // 5. Brand & Government Impersonation + Official Domain Verification
  const impersonationMatches = collectMatches(normalized, IMPERSONATION_REGEX, 6);

  const detectedBrandKeys = new Set<string>();
  for (const entry of BRAND_KEYWORDS) {
    if (entry.pattern.test(normalized)) {
      detectedBrandKeys.add(entry.brand);
    }
  }
  for (const u of urls) {
    if (u.suspectedBrand) {
      detectedBrandKeys.add(u.suspectedBrand);
    }
  }

  const verifiedBrandHints: VerifiedBrandHint[] = Array.from(detectedBrandKeys)
    .filter((b) => Boolean(OFFICIAL_BRAND_DOMAINS[b]))
    .map((brand) => ({
      brand,
      officialDomains: OFFICIAL_BRAND_DOMAINS[brand],
    }));

  const hasSuspiciousUrl = urls.some((u) => u.urlRiskScore >= 20 || u.isShortener || !u.valid);
  const requestsExternalAction = urls.length > 0 || EXTERNAL_ACTION_REGEX.test(normalized);

  if (impersonationMatches.length > 0) {
    const entities = Array.from(new Set(impersonationMatches)).slice(0, 3);
    if (requestsExternalAction && (!hasLegitDeliveryPattern || hasSuspiciousUrl || urgencyMatches.length > 0)) {
      indicators.push({
        id: 'brand-gov-impersonation',
        title: `Claims to represent ${entities.join(', ')}`,
        category: 'impersonation',
        weight: 20,
        severity: hasSuspiciousUrl ? 'high' : 'medium',
        explanation: `References a known organization (${entities.join(', ')}) alongside an action prompt, coercion, or external contact path. Scammers frequently impersonate trusted banks, couriers, and government bodies.`,
        evidence: entities.join(', '),
        matchedSnippets: impersonationMatches,
      });
    } else if (hasLegitDeliveryPattern && !hasSuspiciousUrl && scamFinancialMatches.length === 0) {
      contextNotes.push(
        `References ${entities.join(', ')} in a routine status notification without urgent fee demands or suspicious URLs.`,
      );
    }
  }

  // Brand-vs-domain mismatch check
  if (urls.length > 0 && detectedBrandKeys.size > 0) {
    for (const brand of detectedBrandKeys) {
      const cfg = BRAND_KEYWORDS.find((k) => k.brand === brand);
      if (cfg?.contextOnly) continue;
      const official = OFFICIAL_BRAND_DOMAINS[brand];
      if (!official) continue;
      const matchesOfficial = urls.some(
        (u) => u.valid && isOfficialDomainForBrand(u.hostname, brand),
      );
      const alreadyFlaggedLookalike = urls.some((u) => u.suspectedBrand === brand);
      if (!matchesOfficial && !alreadyFlaggedLookalike) {
        indicators.push({
          id: 'brand-domain-mismatch',
          title: `Domain does not match ${brand}'s official website`,
          category: 'impersonation',
          weight: 20,
          severity: 'high',
          explanation: `The message references ${brand}, yet the embedded link points to "${urls[0]?.hostname || urls[0]?.originalUrl}" instead of an official ${brand} domain (${official.join(', ')}).`,
          evidence: `${brand} ≠ ${urls[0]?.hostname || urls[0]?.originalUrl}`,
        });
        break;
      }
    }
  }

  // 6. Fake Reward, Lottery, Job & Guaranteed-Return Investment Scams
  const rewardOrJobMatches = collectMatches(normalized, REWARD_JOB_REGEX, 6);
  const investmentScamMatches = collectMatches(normalized, INVESTMENT_SCAM_REGEX, 5);
  const jobAdvanceFeeMatches = collectMatches(normalized, JOB_ADVANCE_FEE_REGEX, 4);
  const offPlatformRecruit =
    MESSAGING_APP_MENTION.test(normalized) && RECRUIT_CONTEXT_REGEX.test(normalized);
  MESSAGING_APP_MENTION.lastIndex = 0;

  if (rewardOrJobMatches.length > 0) {
    const evidenceText = Array.from(new Set(rewardOrJobMatches.map((m) => m.toLowerCase())))
      .slice(0, 3)
      .join(', ');
    indicators.push({
      id: 'reward-job-scam',
      title: 'Unsolicited prize, lottery, or unrealistic job offer',
      category: 'reward',
      weight: 25,
      severity: 'high',
      explanation:
        'Promises unexpected winnings, guaranteed daily income, or easy remote pay—classic hallmarks of advance-fee and task scams.',
      evidence: evidenceText,
      matchedSnippets: rewardOrJobMatches,
    });
  } else if (jobAdvanceFeeMatches.length > 0 && (scamFinancialMatches.length > 0 || urls.length > 0)) {
    indicators.push({
      id: 'job-advance-fee-lure',
      title: 'Job offer or shortlist requiring upfront payment',
      category: 'reward',
      weight: 20,
      severity: 'high',
      explanation: `Claims you are shortlisted or offered employment while demanding an upfront registration or equipment fee (${jobAdvanceFeeMatches.join(', ')}). Legitimate employers never charge candidates to accept an offer letter.`,
      evidence: jobAdvanceFeeMatches.join(', '),
      matchedSnippets: jobAdvanceFeeMatches,
    });
  }

  if (investmentScamMatches.length > 0) {
    indicators.push({
      id: 'investment-return-scam',
      title: 'Guaranteed-return or "zero risk" investment claim',
      category: 'reward',
      weight: 25,
      severity: 'high',
      explanation: `Promises guaranteed high returns or capital doubling (${investmentScamMatches.join(', ')}). Legitimate regulated investments never guarantee fixed high weekly returns with zero risk.`,
      evidence: investmentScamMatches.join(', '),
      matchedSnippets: investmentScamMatches,
    });
  }

  if (offPlatformRecruit) {
    const appMatches = collectMatches(normalized, MESSAGING_APP_MENTION, 3);
    indicators.push({
      id: 'off-platform-recruitment',
      title: 'Off-platform messaging recruitment (WhatsApp/Telegram)',
      category: 'impersonation',
      weight: 15,
      severity: 'medium',
      explanation:
        'Directs candidates or investors to private messaging apps like WhatsApp or Telegram rather than an official company portal.',
      evidence: 'WhatsApp / Telegram redirect',
      matchedSnippets: appMatches,
    });
  }

  // 7. Fake Delivery / Customs / Redelivery Traps
  const deliveryTrapMatches = collectMatches(normalized, DELIVERY_TRAP_REGEX, 6);

  if (deliveryTrapMatches.length > 0) {
    const sample = Array.from(new Set(deliveryTrapMatches.map((m) => m.toLowerCase()))).slice(0, 3);
    indicators.push({
      id: 'delivery-trap',
      title: 'Suspicious delivery hold or address-update lure',
      category: 'delivery',
      weight: 15,
      severity: 'medium',
      explanation: `Claims a parcel cannot be delivered (${sample.join(', ')}) and requires immediate action or a small fee—a widespread smishing tactic.`,
      evidence: sample.join(', '),
      matchedSnippets: deliveryTrapMatches,
    });
  }

  // 8. URL-derived indicators rolled into message indicators
  if (urls.length > 0) {
    const highestUrlRisk = Math.max(...urls.map((u) => u.urlRiskScore));
    const hasShortener = urls.some((u) => u.isShortener);
    const hasIp = urls.some((u) => u.isIpAddress);
    const hasBrandLookalike = urls.find((u) => u.suspectedBrand);
    const hasDangerousDownload = urls.some((u) =>
      u.flags.some((f) => f.code === 'DANGEROUS_DOWNLOAD'),
    );

    if (highestUrlRisk >= 20 || hasShortener || hasIp || hasBrandLookalike || hasDangerousDownload) {
      const reasons: string[] = [];
      if (hasDangerousDownload) reasons.push('direct APK or executable download');
      if (hasBrandLookalike) reasons.push(`possible ${hasBrandLookalike.suspectedBrand} lookalike domain`);
      if (hasShortener) reasons.push('URL shortener hiding destination');
      if (hasIp) reasons.push('raw IP address host');
      if (reasons.length === 0 && urls[0]?.flags[0]) {
        reasons.push(urls[0].flags[0].label.toLowerCase());
      }

      indicators.push({
        id: 'suspicious-url-embedded',
        title: 'Suspicious URL detected in message',
        category: 'url',
        weight: highestUrlRisk >= 45 ? 30 : 25,
        severity: highestUrlRisk >= 45 ? 'high' : 'medium',
        explanation: `The message contains a link flagged for ${reasons.join(', ')}. Inspect the domain carefully before tapping.`,
        evidence: urls[0]?.originalUrl,
        matchedSnippets: urls.map((u) => u.originalUrl),
      });
    } else if (indicators.length > 0) {
      const hasInsecureHttp = urls.some((u) => u.valid && !u.isHttps && u.scheme === 'http');
      indicators.push({
        id: 'unverified-action-link',
        title: 'External action link paired with suspicious prompts',
        category: 'url',
        weight: hasInsecureHttp ? 20 : 15,
        severity: hasInsecureHttp ? 'high' : 'medium',
        explanation:
          'Pairing an unverified external link with urgent, financial, or unsolicited offer prompts is a primary phishing vector.',
        evidence: urls[0]?.originalUrl,
        matchedSnippets: urls.map((u) => u.originalUrl),
      });
    } else if (indicators.length === 0) {
      contextNotes.push(
        `Contains ${urls.length} link(s) without structural phishing anomalies, though you should still verify the domain matches the official sender.`,
      );
    }
  }

  // Channel-specific verification context (Problem Statement alignment)
  if (channel === 'sms') {
    contextNotes.push(
      'SMS Channel Tip: Official alerts from Indian banks and government entities use registered 6-character DLT headers (suffixes -S Service, -T Transactional, -G Government). Be cautious if an urgent bank or utility notice arrives from a standard 10-digit personal mobile number.',
    );
  } else if (channel === 'whatsapp') {
    contextNotes.push(
      'WhatsApp Channel Tip: Official institutions do not issue arrest warrants, conduct KYC updates, or demand payments via personal WhatsApp numbers or unverified forwarded links.',
    );
  } else if (channel !== 'auto') {
    const channelLabel = channel === 'email' ? 'Email' : 'Social Media';
    contextNotes.push(
      `Evaluated with ${channelLabel} communication context—check the sender address/handle carefully in addition to the message text.`,
    );
  }

  let protectiveSignalsCount = 0;
  if (hasProtectiveOtpNotice) protectiveSignalsCount += 1;
  if (hasLegitTxnPattern && scamFinancialMatches.length === 0) protectiveSignalsCount += 1;
  if (hasLegitDeliveryPattern && deliveryTrapMatches.length === 0 && !hasSuspiciousUrl) {
    protectiveSignalsCount += 1;
  }

  return {
    indicators,
    urls,
    contextNotes,
    verifiedBrandHints,
    protectiveSignalsCount,
    normalizedText: normalized,
  };
}
