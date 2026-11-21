import type { UrlAnalysisDetail, UrlFlag } from '../../src/types/scamshield.ts';

const URL_SHORTENERS = new Set([
  'bit.ly',
  'tinyurl.com',
  't.co',
  'goo.gl',
  'rb.gy',
  'is.gd',
  'cutt.ly',
  'ow.ly',
  'shorturl.at',
  'tiny.cc',
  'rebrand.ly',
  'buff.ly',
  'bl.ink',
  't.ly',
  'v.gd',
  's.id',
]);

const RISKY_TLDS = new Set([
  'xyz',
  'top',
  'click',
  'tk',
  'ml',
  'ga',
  'cf',
  'gq',
  'buzz',
  'work',
  'support',
  'icu',
  'vip',
  'loan',
  'win',
  'bid',
  'club',
  'rest',
  'cyou',
  'cfd',
  'sbs',
]);

export const OFFICIAL_BRAND_DOMAINS: Record<string, string[]> = {
  PayPal: ['paypal.com'],
  Amazon: ['amazon.com', 'amazon.in', 'amazon.co.uk', 'amazon.de', 'amazon.ca'],
  Flipkart: ['flipkart.com'],
  Microsoft: ['microsoft.com', 'live.com', 'outlook.com', 'office.com'],
  Apple: ['apple.com', 'icloud.com'],
  Google: ['google.com', 'accounts.google.com', 'gmail.com'],
  Netflix: ['netflix.com'],
  WhatsApp: ['whatsapp.com', 'wa.me'],
  Instagram: ['instagram.com', 'help.instagram.com', 'meta.com'],
  FedEx: ['fedex.com'],
  DHL: ['dhl.com'],
  UPS: ['ups.com'],
  USPS: ['usps.com'],
  'India Post': ['indiapost.gov.in'],
  BlueDart: ['bluedart.com'],
  Delhivery: ['delhivery.com'],
  SBI: ['sbi.co.in', 'onlinesbi.sbi'],
  HDFC: ['hdfcbank.com'],
  ICICI: ['icicibank.com'],
  Axis: ['axisbank.com'],
  Paytm: ['paytm.com'],
  PhonePe: ['phonepe.com'],
  UIDAI: ['uidai.gov.in', 'myaadhaar.uidai.gov.in'],
  'Income Tax': ['incometax.gov.in', 'incometaxindia.gov.in'],
  EPFO: ['epfindia.gov.in'],
  TRAI: ['trai.gov.in'],
  Airtel: ['airtel.in'],
  Jio: ['jio.com'],
  Chase: ['chase.com'],
  'Bank of America': ['bankofamerica.com'],
  'Wells Fargo': ['wellsfargo.com'],
  IRS: ['irs.gov'],
};

const BRAND_TYPOSQUAT_PATTERNS: Array<{ brand: string; pattern: RegExp }> = [
  { brand: 'PayPal', pattern: /payp[a4@]l|paypa[1l!]|p[a4]ypal/i },
  { brand: 'Amazon', pattern: /amaz[o0]n|arnazon|amz0n|amazon[-.]?(verify|support|refund|prime)/i },
  { brand: 'Flipkart', pattern: /f[1l]ipkart|flipkart[-.]?(offer|reward|win|refund)/i },
  { brand: 'Microsoft', pattern: /micr[o0]s[o0]ft|rnicrosoft|msft[-.]?(login|secure|verify)/i },
  { brand: 'Apple', pattern: /app[1l]e|apple[-.]?(id|support|verify|icloud)/i },
  { brand: 'Google', pattern: /g[o0]{2}gle|g[o0]ogle/i },
  { brand: 'Netflix', pattern: /netf[1l]ix|netfllx/i },
  { brand: 'WhatsApp', pattern: /whats[a4]pp|whatsap+[-.]?(verify|web|update)/i },
  { brand: 'Instagram', pattern: /(?:instagram|insta|meta)[-.]?(appeal|verify|badge|support|login)/i },
  { brand: 'FedEx', pattern: /fedex[-.]?(track|delivery|parcel|customs)|fed[e3]x/i },
  { brand: 'DHL', pattern: /dhl[-.]?(express|parcel|track|delivery|customs)/i },
  { brand: 'UPS', pattern: /ups[-.]?(parcel|track|delivery|redelivery)/i },
  { brand: 'USPS', pattern: /usps[-.]?(track|delivery|post|redelivery)/i },
  { brand: 'India Post', pattern: /indiapost[-.]?(parcel|track|redelivery|fee|post)/i },
  { brand: 'BlueDart', pattern: /bluedart[-.]?(track|parcel|delivery|reschedule)/i },
  { brand: 'Delhivery', pattern: /delhivery[-.]?(track|parcel|address|reschedule)/i },
  { brand: 'SBI', pattern: /sb[1il][-.]?(kyc|online|verify|update|yono)|yono[-.]?sbi/i },
  { brand: 'HDFC', pattern: /hdfc[-.]?(kyc|bank|verify|update|netbank)/i },
  { brand: 'ICICI', pattern: /icici[-.]?(kyc|bank|verify|update|cards?)/i },
  { brand: 'Axis', pattern: /axis[-.]?(kyc|bank|verify|dispute|update)/i },
  { brand: 'Paytm', pattern: /paytm[-.]?(kyc|cashback|wallet|verify|reward)/i },
  { brand: 'PhonePe', pattern: /phonepe[-.]?(cashback|reward|verify|kyc)/i },
  { brand: 'UIDAI', pattern: /(?:uidai|aadha+r)[-.]?(update|verify|portal|kyc|ekyc)/i },
  { brand: 'Income Tax', pattern: /(?:incometax|income-tax|tax-pan)[-.]?(pan|refund|verify|gov)/i },
  { brand: 'EPFO', pattern: /epf[o0]?[-.]?(claim|kyc|passbook|update|portal)/i },
  { brand: 'Airtel', pattern: /airtel[-.]?(kyc|sim|esim|verify|5g)/i },
  { brand: 'Jio', pattern: /jio[-.]?(kyc|sim|recharge|free|verify)/i },
  { brand: 'Chase', pattern: /chase[-.]?(verify|secure|online|alert)/i },
  { brand: 'IRS', pattern: /irs[-.]?(refund|tax|gov|verify|claim)/i },
];

const PHISHING_PATH_WORDS =
  /(verify|kyc|login|signin|sign-in|update|confirm|secure|password|otp|unlock|suspended|claim|prize|refund|redelivery|wallet|billing|appeal|subsidy|dispute|cancel)/i;

const DANGEROUS_DOWNLOAD_EXT = /\.(apk|exe|bat|cmd|msi|scr|vbs|ps1|jar)(?:$|[?#])/i;

const MESSAGING_REDIRECT_HOSTS = new Set(['wa.me', 'chat.whatsapp.com', 't.me', 'telegram.me']);

const MULTI_PART_PUBLIC_SUFFIXES = new Set([
  'co.uk',
  'co.in',
  'org.uk',
  'gov.in',
  'gov.uk',
  'com.au',
  'co.jp',
  'ac.in',
  'edu.au',
  'net.in',
  'org.in',
]);

function isIpv4(host: string): boolean {
  const parts = host.split('.');
  if (parts.length !== 4) return false;
  return parts.every((p) => /^\d{1,3}$/.test(p) && Number(p) >= 0 && Number(p) <= 255);
}

function isIpv6OrHexIp(host: string): boolean {
  if (host.startsWith('[') && host.endsWith(']')) return true;
  if (/^0x[0-9a-f]+$/i.test(host)) return true;
  if (/^\d{8,12}$/.test(host)) return true; // integer IP representation
  return false;
}

export function getRegistrableDomain(hostname: string): string {
  const clean = hostname.replace(/\.+$/, '').toLowerCase();
  const labels = clean.split('.').filter(Boolean);
  if (labels.length <= 2) return clean;
  const lastTwo = `${labels[labels.length - 2]}.${labels[labels.length - 1]}`;
  if (MULTI_PART_PUBLIC_SUFFIXES.has(lastTwo) && labels.length >= 3) {
    return `${labels[labels.length - 3]}.${lastTwo}`;
  }
  return lastTwo;
}

function getSubdomainPrefix(hostname: string, registrable: string): string {
  const clean = hostname.replace(/\.+$/, '').toLowerCase();
  if (!clean || clean === registrable || !clean.endsWith(`.${registrable}`)) return '';
  return clean.slice(0, clean.length - registrable.length - 1);
}

function countSubdomains(hostname: string): number {
  const registrable = getRegistrableDomain(hostname);
  const prefix = getSubdomainPrefix(hostname, registrable);
  if (!prefix) return 0;
  return prefix.split('.').filter(Boolean).length;
}

export function isOfficialDomainForBrand(hostname: string, brand: string): boolean {
  const officialList = OFFICIAL_BRAND_DOMAINS[brand];
  if (!officialList) return false;
  const clean = hostname.replace(/\.+$/, '').toLowerCase();
  const registrable = getRegistrableDomain(clean);
  return officialList.some((d) => clean === d || registrable === d || clean.endsWith(`.${d}`));
}

export function extractUrlsFromText(text: string): string[] {
  const matches = new Set<string>();
  const httpRegex = /\b(?:https?:\/\/|hxxps?:\/\/)[^\s<>"')\]}]+/gi;
  let match: RegExpExecArray | null;
  while ((match = httpRegex.exec(text)) !== null) {
    const cleaned = match[0].replace(/[.,;:!?]+$/, '');
    matches.add(cleaned);
  }

  // Also catch bare domains with path or suspicious TLD/shortener if no scheme was provided
  const bareRegex =
    /\b(?:[a-z0-9-]+\.)+(?:com|net|org|in|co\.in|co\.uk|gov\.in|sbi|xyz|top|click|tk|ml|ga|cf|gq|ly|gl|io|info|buzz|work|support|icu|vip|me)(?:\/[^\s<>"')\]}]*)?/gi;
  while ((match = bareRegex.exec(text)) !== null) {
    const candidate = match[0].replace(/[.,;:!?]+$/, '');
    const alreadyCovered = Array.from(matches).some((existing) =>
      existing.toLowerCase().includes(candidate.toLowerCase()),
    );
    if (!alreadyCovered) {
      matches.add(candidate);
    }
  }

  return Array.from(matches).slice(0, 10);
}

export function analyzeUrl(rawInput: string): UrlAnalysisDetail {
  const trimmed = rawInput.trim();
  const flags: UrlFlag[] = [];

  if (!trimmed) {
    return {
      originalUrl: rawInput,
      normalizedUrl: '',
      valid: false,
      scheme: '',
      hostname: '',
      registrableDomain: '',
      subdomainPart: '',
      port: '',
      pathSummary: '',
      isHttps: false,
      isShortener: false,
      isIpAddress: false,
      subdomainCount: 0,
      urlLength: 0,
      suspectedBrand: null,
      flags: [
        {
          code: 'EMPTY_URL',
          label: 'Empty URL',
          weight: 0,
          explanation: 'No URL was supplied for inspection.',
        },
      ],
      urlRiskScore: 0,
      safetyNote: 'Provide a full URL to inspect its domain structure statically.',
    };
  }

  // Block dangerous script/data schemes immediately
  const lowerTrimmed = trimmed.toLowerCase();
  if (/^(javascript|vbscript|data|file):/i.test(lowerTrimmed)) {
    return {
      originalUrl: rawInput,
      normalizedUrl: trimmed,
      valid: false,
      scheme: lowerTrimmed.split(':')[0] || 'unknown',
      hostname: '',
      registrableDomain: '',
      subdomainPart: '',
      port: '',
      pathSummary: '',
      isHttps: false,
      isShortener: false,
      isIpAddress: false,
      subdomainCount: 0,
      urlLength: trimmed.length,
      suspectedBrand: null,
      flags: [
        {
          code: 'DANGEROUS_SCHEME',
          label: 'Executable or unsafe URI scheme',
          weight: 50,
          explanation:
            'This link uses a non-web URI scheme (such as javascript: or data:) that can execute code or mask malicious payloads rather than pointing to a normal website.',
        },
      ],
      urlRiskScore: 50,
      safetyNote: 'Never open or paste links using javascript:, data:, or file: schemes.',
    };
  }

  // Normalize defanged URLs (hxxp -> http) and bare domains
  let candidate = trimmed.replace(/^hxxps?:\/\//i, (m) =>
    m.toLowerCase().startsWith('hxxps') ? 'https://' : 'http://',
  );
  const hadExplicitScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(candidate);
  if (!hadExplicitScheme) {
    candidate = `http://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return {
      originalUrl: rawInput,
      normalizedUrl: trimmed,
      valid: false,
      scheme: '',
      hostname: '',
      registrableDomain: '',
      subdomainPart: '',
      port: '',
      pathSummary: '',
      isHttps: false,
      isShortener: false,
      isIpAddress: false,
      subdomainCount: 0,
      urlLength: trimmed.length,
      suspectedBrand: null,
      flags: [
        {
          code: 'MALFORMED_URL',
          label: 'Malformed or unreadable URL structure',
          weight: 20,
          explanation:
            'The URL could not be parsed cleanly. Attackers sometimes insert invalid characters or spacing to evade filters or confuse users.',
        },
      ],
      urlRiskScore: 20,
      safetyNote: 'Verify the exact link format; malformed links should not be trusted.',
    };
  }

  const scheme = parsed.protocol.replace(':', '').toLowerCase();
  const hostname = parsed.hostname.toLowerCase();
  const hasDotOrIp = hostname.includes('.') || isIpv4(hostname) || isIpv6OrHexIp(hostname);

  if (!hostname || !hasDotOrIp || /\s/.test(trimmed)) {
    return {
      originalUrl: rawInput,
      normalizedUrl: trimmed,
      valid: false,
      scheme,
      hostname,
      registrableDomain: hostname,
      subdomainPart: '',
      port: parsed.port,
      pathSummary: parsed.pathname,
      isHttps: scheme === 'https',
      isShortener: false,
      isIpAddress: false,
      subdomainCount: 0,
      urlLength: trimmed.length,
      suspectedBrand: null,
      flags: [
        {
          code: 'MALFORMED_URL',
          label: 'Incomplete or malformed domain',
          weight: 20,
          explanation:
            'The supplied link does not contain a valid top-level domain name or contains whitespace.',
        },
      ],
      urlRiskScore: 20,
      safetyNote: 'Check that the link is complete and free of hidden spaces.',
    };
  }

  const isHttps = hadExplicitScheme ? scheme === 'https' : false;
  const ipDetected = isIpv4(hostname) || isIpv6OrHexIp(hostname);
  const registrableDomain = ipDetected ? hostname : getRegistrableDomain(hostname);
  const subdomainPart = ipDetected ? '' : getSubdomainPrefix(hostname, registrableDomain);
  const isShortener = URL_SHORTENERS.has(hostname) || URL_SHORTENERS.has(registrableDomain);
  const subdomainCount = ipDetected ? 0 : countSubdomains(hostname);
  const tld = hostname.split('.').pop() || '';
  const urlLength = trimmed.length;
  const fullPathAndQuery = `${parsed.pathname}${parsed.search}`;

  // 1. Userinfo / '@' credential trick
  if (parsed.username || parsed.password || trimmed.includes('@')) {
    flags.push({
      code: 'USERINFO_AT_SIGN',
      label: 'Embedded "@" symbol in URL authority',
      weight: 30,
      explanation:
        'URLs containing "@" before the domain can trick readers into seeing a trusted brand on the left while the browser actually connects to the host on the right.',
    });
  }

  // 2. IP address instead of domain name
  if (ipDetected) {
    flags.push({
      code: 'IP_ADDRESS_HOST',
      label: 'Direct IP address used instead of domain name',
      weight: 30,
      explanation:
        'Legitimate banks, delivery carriers, and online services rarely send customers to raw IP addresses. Attackers use raw IPs to bypass domain-reputation checks.',
    });
  }

  // 3. Punycode / IDN homograph indicator
  if (hostname.includes('xn--')) {
    flags.push({
      code: 'PUNYCODE_HOMOGRAPH',
      label: 'Internationalized punycode domain (xn--)',
      weight: 25,
      explanation:
        'Punycode domains can visually imitate standard Latin brand letters using lookalike Unicode characters (homograph spoofing).',
    });
  }

  // 4. URL shortener
  if (isShortener) {
    flags.push({
      code: 'URL_SHORTENER',
      label: `URL shortener hides final destination (${registrableDomain})`,
      weight: 20,
      explanation:
        'Shortened links conceal the real destination domain until clicked, which scammers routinely exploit in SMS and WhatsApp phishing.',
    });
  }

  // 4b. Direct executable / Android APK payload link
  if (DANGEROUS_DOWNLOAD_EXT.test(fullPathAndQuery)) {
    flags.push({
      code: 'DANGEROUS_DOWNLOAD',
      label: 'Direct APK or executable file download link',
      weight: 35,
      explanation:
        'Points directly to an installable Android APK or executable file—commonly used to sideload banking trojans disguised as courier, electricity, or KYC updates.',
    });
  }

  // 4c. Off-platform chat redirect
  if (MESSAGING_REDIRECT_HOSTS.has(hostname) || MESSAGING_REDIRECT_HOSTS.has(registrableDomain)) {
    flags.push({
      code: 'MESSAGING_REDIRECT',
      label: `Off-platform messaging redirect (${registrableDomain})`,
      weight: 15,
      explanation:
        'Redirects to a private chat channel (WhatsApp/Telegram), frequently used by job-task and investment scammers to evade official platform moderation.',
    });
  }

  // 5. Brand typosquatting / misleading brand impersonation in domain
  let suspectedBrand: string | null = null;
  let officialDomains: string[] | undefined;
  for (const entry of BRAND_TYPOSQUAT_PATTERNS) {
    if (entry.pattern.test(hostname) && !isOfficialDomainForBrand(hostname, entry.brand)) {
      suspectedBrand = entry.brand;
      officialDomains = OFFICIAL_BRAND_DOMAINS[entry.brand];
      flags.push({
        code: 'BRAND_IMPERSONATION_DOMAIN',
        label: `Possible ${entry.brand} lookalike or impersonation domain`,
        weight: 35,
        explanation: `The domain "${hostname}" resembles or embeds "${entry.brand}" without matching ${entry.brand}'s official domain (${officialDomains?.join(', ') ?? 'official site'}).`,
      });
      break;
    }
  }

  // 6. Excessive subdomains
  if (subdomainCount >= 3) {
    flags.push({
      code: 'EXCESSIVE_SUBDOMAINS',
      label: `Excessive subdomains (${subdomainCount} levels)`,
      weight: 20,
      explanation:
        'Phishing links often stack subdomains (e.g., bank.login.verify.attacker.tld) so the trusted-looking words appear first while the real owner is at the far right.',
    });
  }

  // 7. Risky TLD
  if (RISKY_TLDS.has(tld) && !ipDetected) {
    flags.push({
      code: 'RISKY_TLD',
      label: `High-abuse top-level domain (.${tld})`,
      weight: 15,
      explanation: `The ".${tld}" domain extension is disproportionately used in disposable phishing campaigns and is unusual for established institutions.`,
    });
  }

  // 8. Suspicious characters / excessive hyphens / percent-encoding in host or path
  const domainHyphens = (hostname.match(/-/g) || []).length;
  const hasDoubleSlashInPath = parsed.pathname.includes('//');
  const encodedCharsCount = (trimmed.match(/%[0-9a-f]{2}/gi) || []).length;
  if (domainHyphens >= 3 || hasDoubleSlashInPath || encodedCharsCount >= 3) {
    flags.push({
      code: 'SUSPICIOUS_CHARACTERS',
      label: 'Suspicious URL obfuscation characters',
      weight: 15,
      explanation:
        'Multiple hyphens in the domain, extra path slashes, or heavy percent-encoding are commonly used to mimic legitimate pages or evade automated scanners.',
    });
  }

  // 9. Misleading action keywords in non-official domain + path
  if (!suspectedBrand && PHISHING_PATH_WORDS.test(hostname)) {
    flags.push({
      code: 'MISLEADING_DOMAIN_KEYWORDS',
      label: 'Action/verification keywords embedded in domain name',
      weight: 15,
      explanation: `The domain "${hostname}" includes sensitive action terms (like verify, kyc, login, or refund), which scammers register to appear official.`,
    });
  } else if (PHISHING_PATH_WORDS.test(fullPathAndQuery) && flags.length > 0) {
    flags.push({
      code: 'SENSITIVE_PATH_COMBINATION',
      label: 'Credential or verification path on an unverified domain',
      weight: 15,
      explanation:
        'The URL path points toward a login, KYC, refund, or verification endpoint alongside other structural warning signs.',
    });
  }

  // 10. Unusually long URL
  if (urlLength > 120) {
    flags.push({
      code: 'VERY_LONG_URL',
      label: `Unusually long URL (${urlLength} characters)`,
      weight: 15,
      explanation:
        'Very long URLs are frequently used to push the true domain off-screen on mobile phones or pack tracking and redirect parameters.',
    });
  } else if (urlLength > 75) {
    flags.push({
      code: 'LONG_URL',
      label: `Elevated URL length (${urlLength} characters)`,
      weight: 10,
      explanation:
        'Long query strings or paths can hide redirect destinations; inspect the root domain before trusting it.',
    });
  }

  // 11. HTTP instead of HTTPS
  if (hadExplicitScheme && scheme === 'http') {
    flags.push({
      code: 'INSECURE_HTTP',
      label: 'Unencrypted HTTP connection (not HTTPS)',
      weight: 15,
      explanation:
        'This link uses unencrypted HTTP instead of HTTPS. Legitimate login, banking, and payment portals require HTTPS.',
    });
  }

  const rawScore = flags.reduce((sum, f) => sum + f.weight, 0);
  const urlRiskScore = Math.min(100, rawScore);

  let safetyNote =
    'ScamShield inspected this link statically and did not open or fetch the destination.';
  if (isHttps && urlRiskScore >= 30) {
    safetyNote =
      'Important: This URL uses HTTPS, which only encrypts traffic in transit—it does NOT prove the website is legitimate or safe.';
  } else if (isHttps && urlRiskScore === 0) {
    safetyNote =
      'No structural red flags were detected in the URL format. Remember that HTTPS alone does not guarantee safety—always verify the sender.';
  } else if (!hadExplicitScheme) {
    safetyNote =
      'No protocol (http:// or https://) was provided; ScamShield inspected the domain structure without visiting it.';
  }

  return {
    originalUrl: rawInput,
    normalizedUrl: parsed.href,
    valid: true,
    scheme: hadExplicitScheme ? scheme : 'unspecified',
    hostname,
    registrableDomain,
    subdomainPart,
    port: parsed.port,
    pathSummary: parsed.pathname === '/' ? '/' : parsed.pathname,
    isHttps,
    isShortener,
    isIpAddress: ipDetected,
    subdomainCount,
    urlLength,
    suspectedBrand,
    officialDomains,
    flags,
    urlRiskScore,
    safetyNote,
  };
}
