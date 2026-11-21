import type { QuizQuestion } from '../types/scamshield';

export const AWARENESS_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'quiz-1',
    channel: 'SMS',
    message:
      'Dear Customer, your SBI YONO access will be blocked today. Update your PAN and KYC immediately at http://sbi-kyc-help.example.com to avoid suspension.',
    correctAnswer: 'scam',
    category: 'Banking Phishing',
    explanation:
      'Banks do not threaten same-day account suspension via SMS links or host KYC portals on unofficial domains.',
    indicators: [
      'Same-day suspension threat ("blocked today", "immediately")',
      'Unofficial HTTP domain mimicking SBI',
      'Requests KYC/PAN verification via external link',
    ],
    safetyRecommendation:
      'Open the official YONO SBI app directly or visit your branch to check KYC status.',
  },
  {
    id: 'quiz-2',
    channel: 'SMS',
    message:
      'Rs. 620.00 debited from A/C XX8310 on 20-Nov-26 via UPI Ref 432609184520. Avl Bal: Rs. 18,450.25. Do not share OTP/PIN with anyone. Not you? Call 1800-000-0199.',
    correctAnswer: 'genuine',
    category: 'Legitimate Bank Alert',
    explanation:
      'This is a standard informational transaction alert: the account number is masked (XX8310), there are zero clickable links, and it reminds you not to share your OTP or PIN.',
    indicators: [
      'Masked account identifier and transaction reference',
      'Zero clickable links or credential prompts',
      'Protective "Do not share OTP/PIN" security reminder',
    ],
    safetyRecommendation:
      'Verify any unfamiliar debit inside your official bank app rather than assuming every bank SMS is a scam.',
  },
  {
    id: 'quiz-3',
    channel: 'WhatsApp',
    message:
      'Hi, I am buying your study table. I sent a UPI collect request for Rs. 4,500—please tap Accept and enter your UPI PIN to receive the money in your bank account.',
    correctAnswer: 'scam',
    category: 'UPI Fraud',
    explanation:
      'Entering your UPI PIN always sends money OUT of your bank account. You never enter a PIN or accept a collect request to receive funds.',
    indicators: [
      'Asks you to accept a collect request and enter UPI PIN to "receive" money',
      'Common marketplace buyer payment-inversion trick',
    ],
    safetyRecommendation:
      'Decline the collect request immediately and never enter your UPI PIN to receive a payment.',
  },
  {
    id: 'quiz-4',
    channel: 'SMS',
    message:
      'Your parcel (Order #ORD-748291) is out for delivery today before 6 PM. Please share the 4-digit delivery PIN at your doorstep only after receiving the package.',
    correctAnswer: 'genuine',
    category: 'Legitimate Delivery Update',
    explanation:
      'E-commerce couriers commonly use a doorstep delivery PIN to confirm handoff. Notice there are no payment demands, no urgent threats, and no external links.',
    indicators: [
      'Specific order reference with zero external links',
      'No redelivery fee or card details requested',
      'Doorstep verification occurs only upon physical handoff',
    ],
    safetyRecommendation:
      'Give the delivery PIN only to the delivery agent standing at your door with your parcel—never over a phone call ahead of time.',
  },
  {
    id: 'quiz-5',
    channel: 'WhatsApp',
    message:
      'TRAI & CBI Cyber Cell Alert: Your Aadhaar was used in money laundering. An arrest warrant is active. Stay on WhatsApp video call for digital arrest verification and do not tell anyone.',
    correctAnswer: 'scam',
    category: 'Digital Arrest Scam',
    explanation:
      '"Digital arrest" does not exist in law. Police, CBI, and TRAI never conduct interrogations over video calls or ask citizens to isolate themselves.',
    indicators: [
      'Uses "digital arrest" and fake warrant coercion',
      'Impersonates TRAI and CBI together',
      'Orders secrecy ("do not tell anyone")',
    ],
    safetyRecommendation:
      'End the call immediately, speak with family, and report the number at cybercrime.gov.in or 1930.',
  },
  {
    id: 'quiz-6',
    channel: 'Email',
    message:
      'Reminder: Your 6-digit login verification code is 482910. This code expires in 10 minutes. Never share this code with anyone, including support staff. If you did not request this, change your password in account settings.',
    correctAnswer: 'genuine',
    category: 'Legitimate 2FA Notification',
    explanation:
      'Legitimate two-factor authentication messages deliver a time-limited code, explicitly warn you never to share it, and contain no external phishing links.',
    indicators: [
      'Explicitly tells you never to share the code',
      'Directs you to your own account settings without a suspicious link',
    ],
    safetyRecommendation:
      'If you did not try to sign in, ignore the code and update your password directly on the official service.',
  },
  {
    id: 'quiz-7',
    channel: 'SMS',
    message:
      'India Post: Your parcel could not be delivered due to incomplete address. Pay Rs. 25 re-delivery fee within 12 hours at http://indiapost-parcel-fee.example.com',
    correctAnswer: 'scam',
    category: 'Delivery Smishing',
    explanation:
      'Requests for tiny "redelivery fees" on unofficial domains are designed to capture your debit/credit card details and trigger large unauthorized charges.',
    indicators: [
      'Requests Rs. 25 redelivery fee via SMS link',
      'Domain does not match indiapost.gov.in',
      '12-hour deadline pressure',
    ],
    safetyRecommendation:
      'Track parcels directly on the official courier website using your tracking number.',
  },
  {
    id: 'quiz-8',
    channel: 'WhatsApp',
    message:
      'Part-time remote opportunity! Earn Rs. 5,000 daily by rating hotels and liking videos. Zero experience needed. Message our HR desk on WhatsApp to claim your first task bonus.',
    correctAnswer: 'scam',
    category: 'Fake Job / Task Scam',
    explanation:
      'Unsolicited high-paying "like and rate" offers on messaging apps are classic task scams that eventually demand prepaid deposits before blocking withdrawals.',
    indicators: [
      'Unrealistic daily pay for trivial online clicks',
      'No interview or qualifications required',
      'Off-platform WhatsApp/Telegram recruitment',
    ],
    safetyRecommendation:
      'Never pay deposits or "recharge" accounts to unlock task earnings.',
  },
  {
    id: 'quiz-9',
    channel: 'Email',
    message:
      'College Placement Cell: Final-year project demo schedule has been updated on the internal campus portal. Please bring your student ID card for the 2:00 PM lab slot.',
    correctAnswer: 'genuine',
    category: 'Routine Informational Notice',
    explanation:
      'This is an ordinary informational announcement with no external links, no urgency threats, and no requests for money, OTPs, or passwords.',
    indicators: [
      'No links, payment prompts, or credential requests',
      'Contextual routine campus communication',
    ],
    safetyRecommendation:
      'Routine notices without links or sensitive requests are typically safe, though you can always confirm schedules on your official portal.',
  },
  {
    id: 'quiz-10',
    channel: 'SMS',
    message:
      'Income Tax Alert: Your PAN card has a KYC mismatch. Pay Rs. 499 penalty or verify net-banking details immediately at http://tax-pan-refund.example.org to avoid account freeze.',
    correctAnswer: 'scam',
    category: 'Government Impersonation',
    explanation:
      'Official Income Tax notices never ask for net-banking logins or penalties via `.example.org` SMS links.',
    indicators: [
      'Threatens immediate account freeze',
      'Impersonates Income Tax Department on an unofficial domain',
      'Asks for payment or net-banking credentials via SMS link',
    ],
    safetyRecommendation:
      'Check tax notices only by logging directly into incometax.gov.in.',
  },
];

export function getQuizRankLabel(score: number): {
  rank: string;
  description: string;
  colorClass: string;
} {
  if (score >= 81) {
    return {
      rank: 'Scam Detective',
      description: 'Strong instinct for distinguishing social-engineering traps from legitimate alerts.',
      colorClass: 'text-emerald-700 dark:text-emerald-400',
    };
  }
  if (score >= 61) {
    return {
      rank: 'Scam Aware',
      description: 'Solid awareness of common digital fraud patterns with only minor blind spots.',
      colorClass: 'text-blue-700 dark:text-blue-400',
    };
  }
  if (score >= 31) {
    return {
      rank: 'Learning to Identify Scams',
      description: 'You spot obvious scams, though subtle context cues and genuine vs. fake alerts need practice.',
      colorClass: 'text-amber-700 dark:text-amber-400',
    };
  }
  return {
    rank: 'Beginner',
    description: 'Explore the Scam Library and Red Flag Knowledge Centre to build stronger defenses.',
    colorClass: 'text-red-700 dark:text-red-400',
  };
}

