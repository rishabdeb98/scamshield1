export interface OfficialHelplineResource {
  id: 'helpline-1930' | 'portal-cybercrime' | 'police-112' | 'cert-in';
  title: string;
  badgeLabel: string;
  primaryContact: string;
  purpose: string;
  distinctionNote: string;
  telHref?: string;
  websiteUrl?: string;
  email?: string;
  tollFreeNumber?: string;
  tollFreeHref?: string;
  actionLabel: string;
}

export interface EmergencyStep {
  stepNumber: number;
  title: string;
  detail: string;
}

export interface EverydayGuidelineCard {
  id: string;
  title: string;
  summary: string;
  dos: string[];
  donts: string[];
}

export interface CommonIndianScamCard {
  id: string;
  title: string;
  howItWorks: string;
  warningSigns: string[];
  howToProtect: string;
  libraryExampleId?: string;
}

export interface SecurityChecklistItem {
  id: string;
  label: string;
}

export interface DailySafetyTip {
  id: string;
  topic: string;
  tip: string;
}

export const OFFICIAL_REPORTING_RESOURCES: OfficialHelplineResource[] = [
  {
    id: 'helpline-1930',
    title: 'National Cyber Crime Helpline',
    badgeLabel: 'Financial Cyber Fraud',
    primaryContact: '1930',
    purpose:
      'Report financial cyber fraud and seek immediate assistance to flag fraudulent transfers.',
    distinctionNote:
      'Dedicated consumer helpline for financial cyber fraud. Report financial fraud as quickly as possible.',
    telHref: 'tel:1930',
    actionLabel: 'Call 1930',
  },
  {
    id: 'portal-cybercrime',
    title: 'National Cyber Crime Reporting Portal',
    badgeLabel: 'Online Reporting Portal',
    primaryContact: 'https://cybercrime.gov.in',
    purpose: 'Report cybercrime incidents, online financial fraud, and digital harassment online.',
    distinctionNote:
      'Official Government of India web portal for filing and tracking formal cybercrime complaints.',
    websiteUrl: 'https://cybercrime.gov.in',
    actionLabel: 'Open Official Portal',
  },
  {
    id: 'police-112',
    title: 'Emergency Police Helpline',
    badgeLabel: 'Immediate Police Assistance',
    primaryContact: '112',
    purpose: 'Immediate police, fire, or medical assistance in urgent physical or safety emergencies.',
    distinctionNote:
      'General emergency police response number—distinct from the 1930 financial cybercrime helpline.',
    telHref: 'tel:112',
    actionLabel: 'Call 112',
  },
  {
    id: 'cert-in',
    title: 'CERT-In (Indian Computer Emergency Response Team)',
    badgeLabel: 'Technical Incident Response',
    primaryContact: 'https://www.cert-in.org.in',
    purpose:
      'Handles national cybersecurity incident response, vulnerability coordination, and technical reporting.',
    distinctionNote:
      'Technical cybersecurity incident response organisation—not a replacement for the 1930 consumer cybercrime helpline.',
    websiteUrl: 'https://www.cert-in.org.in',
    email: 'incident@cert-in.org.in',
    tollFreeNumber: '1800-11-4949',
    tollFreeHref: 'tel:1800-11-4949',
    actionLabel: 'Visit CERT-In',
  },
];

export const EMERGENCY_SCAM_STEPS: EmergencyStep[] = [
  {
    stepNumber: 1,
    title: 'Contact 1930 immediately if money has been lost',
    detail:
      'Call the National Cyber Crime Helpline (1930) right away when money has been lost through cyber fraud.',
  },
  {
    stepNumber: 2,
    title: 'Report via the official cybercrime portal',
    detail:
      'Submit a detailed complaint on https://cybercrime.gov.in with transaction details and fraudster contacts.',
  },
  {
    stepNumber: 3,
    title: 'Alert your bank or payment service provider',
    detail:
      'Contact your bank, card issuer, or UPI app support immediately through their official helpline to report the fraudulent transaction and request assistance.',
  },
  {
    stepNumber: 4,
    title: 'Block or secure compromised payment access',
    detail:
      'Block or freeze affected debit/credit cards, UPI access, net-banking logins, or accounts as appropriate.',
  },
  {
    stepNumber: 5,
    title: 'Change compromised passwords from a trusted device',
    detail:
      'Update passwords for email, banking, and social accounts from a clean, trusted device—not a phone with suspicious apps installed.',
  },
  {
    stepNumber: 6,
    title: 'Enable two-factor authentication (2FA)',
    detail:
      'Turn on authenticator-app or hardware-backed 2FA across email, financial, and social media accounts.',
  },
  {
    stepNumber: 7,
    title: 'Preserve all digital evidence',
    detail:
      'Save screenshots, transaction IDs, UTR numbers, UPI IDs, phone numbers, emails, URLs, and exact timestamps.',
  },
  {
    stepNumber: 8,
    title: 'Do not delete messages or call records',
    detail:
      'Keep SMS threads, WhatsApp chats, call logs, and emails intact for investigators and bank dispute teams.',
  },
  {
    stepNumber: 9,
    title: 'Beware of advance-fee recovery scams',
    detail:
      'Never pay anyone on social media, WhatsApp, or email claiming they can "recover" stolen money for an upfront fee.',
  },
];

export const EVERYDAY_GUIDELINES: EverydayGuidelineCard[] = [
  {
    id: 'password-security',
    title: 'Password Security',
    summary: 'Strong, unique credentials prevent one data breach from unlocking all your accounts.',
    dos: [
      'Use strong, unique passwords for every important account.',
      'Use a trusted password manager to store long passphrases.',
    ],
    donts: [
      'Avoid reusing the same password across banking, email, and shopping sites.',
      'Never share passwords or OTPs with anyone.',
    ],
  },
  {
    id: 'upi-payments',
    title: 'UPI and Digital Payments',
    summary: 'Understanding how UPI PINs and collect requests work stops most payment inversion scams.',
    dos: [
      'Enter your UPI PIN only when you intend to send money.',
      'Verify the recipient’s registered name and exact amount before paying.',
    ],
    donts: [
      'Never enter your UPI PIN to receive money—receiving funds never requires a PIN.',
      'Never approve an unknown collect request or scan an unknown QR code to receive money.',
    ],
  },
  {
    id: 'sms-whatsapp',
    title: 'SMS and WhatsApp Safety',
    summary: 'Pause before reacting to urgent messages claiming account freezes or sudden prizes.',
    dos: [
      'Verify unusual requests independently through official apps or verified numbers.',
      'Be cautious with unexpected links and unknown file attachments (.apk, .pdf, .zip).',
    ],
    donts: [
      'Never blindly trust messages claiming your bank account will be blocked today.',
      'Do not click suspicious links or forward unverified financial or government messages.',
    ],
  },
  {
    id: 'banking-security',
    title: 'Banking Security',
    summary: 'Combine active alerts with official-channel habits to spot unauthorized access quickly.',
    dos: [
      'Enable SMS and email transaction alerts for all bank accounts and cards.',
      'Regularly review account activity and contact your bank only via its official app or website.',
    ],
    donts: [
      'Never disclose your OTP, CVV, ATM/UPI PIN, or net-banking password.',
      'Do not call phone numbers sent inside unverified SMS or search-engine ad snippets.',
    ],
  },
  {
    id: 'social-media',
    title: 'Social Media Safety',
    summary: 'Attackers hijack social accounts to scam your friends and contacts in your name.',
    dos: [
      'Enable two-factor authentication (2FA) on every social platform.',
      'Check account security alerts inside the official app’s settings rather than email links.',
    ],
    donts: [
      'Avoid sharing sensitive personal details (phone, DOB, travel, IDs) publicly.',
      'Do not accept suspicious login prompts, appeal links, or impersonation messages.',
    ],
  },
  {
    id: 'device-wifi',
    title: 'Device and Wi-Fi Security',
    summary: 'Basic device hygiene blocks malicious sideloaded apps and network snooping.',
    dos: [
      'Keep your OS and apps updated and download apps only from official stores.',
      'Use a strong device screen lock and review app permissions periodically.',
    ],
    donts: [
      'Avoid banking or sensitive logins on unknown public Wi-Fi networks.',
      'Never install unknown APK files shared over WhatsApp, SMS, or Telegram.',
    ],
  },
  {
    id: 'jobs-shopping',
    title: 'Job and Online Shopping Scams',
    summary: 'Upfront fees and guaranteed-profit offers are classic signatures of advance-fee fraud.',
    dos: [
      'Verify sellers, company career pages, and websites independently before paying.',
      'Confirm investment advisors against official SEBI registrations.',
    ],
    donts: [
      'Do not pay registration, training, or laptop fees for suspicious job offers.',
      'Never trust guaranteed-return schemes or advance-payment demands from unverified contacts.',
    ],
  },
];

export const COMMON_INDIAN_SCAMS: CommonIndianScamCard[] = [
  {
    id: 'scam-bank-kyc',
    title: 'Fake Bank KYC Update',
    howItWorks:
      'Messages impersonating banks warn your account will freeze unless you update KYC through a lookalike link that steals net-banking logins and OTPs.',
    warningSigns: [
      'Same-day suspension threats ("blocked tonight")',
      'Non-official domain over SMS or WhatsApp',
    ],
    howToProtect: 'Update KYC strictly inside your bank’s official mobile app or branch.',
    libraryExampleId: 'bank-sbi-kyc',
  },
  {
    id: 'scam-upi-collect',
    title: 'UPI Collect Request Scam',
    howItWorks:
      'Fraudsters pose as buyers and send a UPI collect request or QR code, claiming you must enter your UPI PIN to receive payment.',
    warningSigns: [
      'Asks for UPI PIN or QR scan to receive money',
      'Marketplace buyer rushing payment confirmation',
    ],
    howToProtect: 'Decline unknown collect requests; never enter a UPI PIN to receive funds.',
    libraryExampleId: 'upi-collect-request',
  },
  {
    id: 'scam-digital-arrest',
    title: 'Digital Arrest Scam',
    howItWorks:
      'Callers impersonate Police, CBI, TRAI, or Customs on video calls, claim an arrest warrant exists, and coerce victims into transferring "security deposits".',
    warningSigns: [
      'Demands staying on video call under "digital arrest"',
      'Orders secrecy from family and immediate transfers',
    ],
    howToProtect: '"Digital arrest" has no basis in law—hang up and report on 1930 or cybercrime.gov.in.',
    libraryExampleId: 'gov-digital-arrest',
  },
  {
    id: 'scam-electricity-bill',
    title: 'Fake Electricity Disconnection Message',
    howItWorks:
      'SMS or WhatsApp alerts claim power will be cut tonight due to an unpaid bill and ask you to call a mobile number or install a remote app.',
    warningSigns: [
      'Personal 10-digit mobile number listed as "electricity officer"',
      'Threatens power cut within hours',
    ],
    howToProtect: 'Verify bill status only on your electricity provider’s official app or portal.',
  },
  {
    id: 'scam-courier-customs',
    title: 'Fake Courier and Customs Fee',
    howItWorks:
      'Alerts claim a parcel is held for incomplete address or unpaid customs duty, directing victims to pay a small redelivery fee or large clearance sum.',
    warningSigns: [
      'Requests Rs. 15–50 redelivery fee via SMS link',
      'Unexpected international customs duty threats',
    ],
    howToProtect: 'Track parcels strictly on the courier’s official website using your tracking ID.',
    libraryExampleId: 'delivery-customs-clearance',
  },
  {
    id: 'scam-gov-subsidy',
    title: 'Fake Government Subsidy',
    howItWorks:
      'Forwards promise cash welfare subsidies or schemes in exchange for bank details and a "processing fee" on unofficial domains.',
    warningSigns: [
      'Asks for a fee to claim a government grant',
      'Website does not end in .gov.in',
    ],
    howToProtect: 'Check welfare schemes solely on verified .gov.in government portals.',
    libraryExampleId: 'gov-subsidy-claim',
  },
  {
    id: 'scam-wfh-job',
    title: 'Fake Work-from-Home Job',
    howItWorks:
      'Unsolicited messages offer high daily pay for liking videos or rating hotels, then demand prepaid "task deposits" before locking withdrawals.',
    warningSigns: [
      'High daily income with zero experience required',
      'Recruitment via WhatsApp or Telegram tasks',
    ],
    howToProtect: 'Never deposit money or pay "registration fees" to unlock job earnings.',
    libraryExampleId: 'job-wfh-task',
  },
  {
    id: 'scam-lottery-reward',
    title: 'Lottery and Reward Scam',
    howItWorks:
      'Messages announce you won a lucky draw, KBC prize, or cashback jackpot and demand taxes, processing fees, or OTP verification.',
    warningSigns: [
      'Prize from a draw you never entered',
      'Upfront fee or OTP requested to release winnings',
    ],
    howToProtect: 'Ignore unexpected prize messages and never pay to claim a reward.',
    libraryExampleId: 'fin-lottery-winner',
  },
  {
    id: 'scam-sim-blocking',
    title: 'SIM Card Blocking Threat',
    howItWorks:
      'Fraudsters warn your mobile number or SIM will be disconnected within hours for KYC mismatch or illegal activity unless you verify or pay immediately.',
    warningSigns: [
      'Automated or urgent warning of SIM deactivation today',
      'Asks for Aadhaar, OTP, or remote app installation',
    ],
    howToProtect: 'Verify SIM status directly through your telecom operator’s official app or store.',
  },
  {
    id: 'scam-investment-trading',
    title: 'Fake Investment and Trading Scheme',
    howItWorks:
      'Social media ads and VIP chat groups promise guaranteed weekly returns using cloned trading apps that block withdrawals with fake "tax" demands.',
    warningSigns: [
      'Promises guaranteed high returns with zero risk',
      'Downloads trading app via APK instead of official stores',
    ],
    howToProtect: 'Verify broker/advisor SEBI registration independently before investing.',
    libraryExampleId: 'fin-guaranteed-returns',
  },
  {
    id: 'scam-social-takeover',
    title: 'Social Media Account Takeover',
    howItWorks:
      'Fake copyright or verification warnings trick users into entering passwords and 2FA codes so attackers hijack accounts and message contacts for money.',
    warningSigns: [
      'Threatens 24-hour account deletion for copyright violation',
      'Appeal link hosted outside the official platform domain',
    ],
    howToProtect: 'Check security notices inside official app settings and use app-based 2FA.',
    libraryExampleId: 'phish-social-verification',
  },
  {
    id: 'scam-screen-sharing',
    title: 'Screen-Sharing and Remote Access App Scam',
    howItWorks:
      'Fake support callers instruct victims to install screen-sharing or remote-control apps so they can watch OTPs, banking screens, and PINs directly.',
    warningSigns: [
      'Caller insists you install a remote support app for a "refund" or "KYC"',
      'Asks you to open your banking or UPI app while sharing screen',
    ],
    howToProtect: 'Never install screen-sharing apps or grant remote access at an unknown caller’s request.',
  },
];

export const SECURITY_CHECKLIST_ITEMS: SecurityChecklistItem[] = [
  { id: 'unique-passwords', label: 'I use unique passwords for important accounts.' },
  { id: 'two-factor-auth', label: 'I have enabled two-factor authentication.' },
  { id: 'never-share-otp', label: 'I never share OTPs or UPI PINs.' },
  { id: 'verify-links', label: 'I verify links before opening them.' },
  { id: 'updates-enabled', label: 'I keep my phone and applications updated.' },
  { id: 'check-payment-details', label: 'I check payment details before confirming transactions.' },
  { id: 'avoid-unknown-apks', label: 'I avoid unknown APK files and applications.' },
  { id: 'know-reporting', label: 'I know how to report cybercrime.' },
];

export const DAILY_SAFETY_TIPS: DailySafetyTip[] = [
  {
    id: 'tip-upi-pin',
    topic: 'UPI Safety',
    tip: 'You never need to enter your UPI PIN or scan a QR code to receive money. Entering a UPI PIN always authorizes an outgoing payment.',
  },
  {
    id: 'tip-digital-arrest',
    topic: 'Impersonation Awareness',
    tip: 'Indian law enforcement agencies never place citizens under "digital arrest" over WhatsApp or video calls, and never demand money to clear a case.',
  },
  {
    id: 'tip-domain-check',
    topic: 'Link Inspection',
    tip: 'Read the domain right before the first single slash (/). Official Indian government portals end in .gov.in or .nic.in—not .com, .xyz, or .top.',
  },
  {
    id: 'tip-otp-hygiene',
    topic: 'OTP & Credential Hygiene',
    tip: 'Genuine bank alerts remind you never to share OTPs or PINs. Anyone claiming they need an OTP to "cancel" a transaction or "credit" a refund is attempting fraud.',
  },
  {
    id: 'tip-apk-risk',
    topic: 'App Safety',
    tip: 'Avoid installing .apk files sent over WhatsApp, SMS, or Telegram—even if the sender claims to be a bank, courier, or electricity board.',
  },
  {
    id: 'tip-1930-speed',
    topic: 'Rapid Fraud Reporting',
    tip: 'If money is lost to cyber fraud, call 1930 and file on cybercrime.gov.in as quickly as possible while preserving screenshots, UTR numbers, and URLs.',
  },
  {
    id: 'tip-2fa',
    topic: 'Account Protection',
    tip: 'Enabling app-based two-factor authentication (2FA) on your primary email and social accounts stops most password-theft takeovers.',
  },
];

export function getDailySafetyTipIndex(date: Date = new Date()): number {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const epochDays = Math.floor(Date.UTC(year, month, day) / 86_400_000);
  return Math.abs(epochDays) % DAILY_SAFETY_TIPS.length;
}
