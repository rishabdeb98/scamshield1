export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type MessageChannel = 'auto' | 'sms' | 'whatsapp' | 'email' | 'social';

export type AnalysisMode = 'message' | 'url';

export type ActiveView =
  | 'dashboard'
  | 'message-scanner'
  | 'url-scanner'
  | 'scam-library'
  | 'safety-center'
  | 'history'
  | 'settings'
  | 'how-it-works'
  | 'about';

export type ScamLibraryCategory =
  | 'Banking'
  | 'UPI'
  | 'Government'
  | 'Delivery'
  | 'Job'
  | 'Financial'
  | 'Phishing';

export interface IndicatorItem {
  id: string;
  title: string;
  category:
    | 'url'
    | 'credential'
    | 'urgency'
    | 'financial'
    | 'reward'
    | 'impersonation'
    | 'delivery'
    | 'context';
  weight: number;
  severity: 'info' | 'low' | 'medium' | 'high';
  explanation: string;
  evidence?: string;
  matchedSnippets?: string[];
}

export interface HighlightSegment {
  text: string;
  category?: IndicatorItem['category'];
  label?: string;
}

export interface VerifiedBrandHint {
  brand: string;
  officialDomains: string[];
}

export interface UrlFlag {
  code: string;
  label: string;
  weight: number;
  explanation: string;
}

export interface UrlAnalysisDetail {
  originalUrl: string;
  normalizedUrl: string;
  valid: boolean;
  scheme: string;
  hostname: string;
  registrableDomain?: string;
  subdomainPart?: string;
  port: string;
  pathSummary: string;
  isHttps: boolean;
  isShortener: boolean;
  isIpAddress: boolean;
  subdomainCount: number;
  urlLength: number;
  suspectedBrand: string | null;
  officialDomains?: string[];
  flags: UrlFlag[];
  urlRiskScore: number;
  safetyNote: string;
}

export interface AnalysisResult {
  id?: string;
  mode: AnalysisMode;
  channel?: MessageChannel;
  score: number;
  classification: RiskLevel;
  summary: string;
  indicators: IndicatorItem[];
  urls: UrlAnalysisDetail[];
  recommendations: string[];
  contextNotes: string[];
  highlightedSegments?: HighlightSegment[];
  verifiedBrandHints?: VerifiedBrandHint[];
  analyzedAt: string;
  characterCount: number;
  savedToHistory: boolean;
  redactedPreview: string;
}

export interface HistoryItem {
  id: string;
  mode: AnalysisMode;
  channel: MessageChannel;
  redactedPreview: string;
  score: number;
  classification: RiskLevel;
  summary: string;
  indicatorCount: number;
  result: AnalysisResult;
  createdAt: string;
}

export interface SampleMessage {
  id: string;
  title: string;
  channel: MessageChannel;
  expectedRisk: RiskLevel;
  categoryLabel: string;
  content: string;
}

export interface ScamLibraryExample {
  id: string;
  title: string;
  category: ScamLibraryCategory;
  categoryDisplay: string;
  riskLevel: RiskLevel;
  channel: MessageChannel;
  sampleMessage: string;
  description: string;
  explanation: string;
  redFlags: string[];
  attackTechnique: string;
  howItWorks: string;
  protectionAdvice: string[];
  relatedIds: string[];
  addedAt: string;
  isRecent?: boolean;
}

export interface QuizQuestion {
  id: string;
  channel: 'SMS' | 'WhatsApp' | 'Email';
  message: string;
  correctAnswer: 'genuine' | 'scam';
  category: string;
  explanation: string;
  indicators: string[];
  safetyRecommendation: string;
}

export interface RedFlagGuideItem {
  id: string;
  title: string;
  whatItMeans: string;
  whyScammersUseIt: string;
  simpleExample: string;
  howToRecogniseIt: string;
}

export interface AwarenessProgress {
  exploredExampleIds: string[];
  exploredCategories: ScamLibraryCategory[];
  quizAttempts: number;
  bestQuizScore: number | null;
  lastQuizScore: number | null;
}

export interface LibraryTrialContext {
  exampleId: string;
  exampleTitle: string;
  expectedRisk: RiskLevel;
}
