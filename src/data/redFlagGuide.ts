import type { RedFlagGuideItem } from '../types/scamshield';

export const RED_FLAG_GUIDE_ITEMS: RedFlagGuideItem[] = [
  {
    id: 'rf-urgency',
    title: 'Urgency and Fear Tactics',
    whatItMeans:
      'Messages claiming your bank account, SIM card, or parcel will be permanently blocked today unless you act within minutes or hours.',
    whyScammersUseIt:
      'Panic stops people from pausing to double-check the sender, read the website address carefully, or ask a family member for a second opinion.',
    simpleExample:
      '"Your account will be suspended within 2 hours unless you complete verification immediately."',
    howToRecogniseIt:
      'Look for countdowns, "final warning" wording, or threats of sudden legal action paired with a link or phone number.',
  },
  {
    id: 'rf-otp-passwords',
    title: 'Requests for OTPs and Passwords',
    whatItMeans:
      'Any message, webpage, or caller asking you to read out, reply with, or type your OTP, UPI PIN, CVV, or net-banking password.',
    whyScammersUseIt:
      'An OTP or UPI PIN is the final lock protecting your bank money. Once you share it, attackers can authorize transactions or take over your account.',
    simpleExample:
      '"Reply with your 6-digit OTP to cancel an unauthorized Rs. 25,000 transaction."',
    howToRecogniseIt:
      'Genuine bank alerts explicitly warn "Do NOT share this OTP with anyone." Anyone asking for your OTP or PIN is trying to access your funds.',
  },
  {
    id: 'rf-suspicious-urls',
    title: 'Suspicious URLs',
    whatItMeans:
      'Web links that use raw IP addresses, URL shorteners, misspelled brand names, extra subdomains, or unfamiliar domain extensions.',
    whyScammersUseIt:
      'Fraudsters cannot use a bank’s real domain, so they register lookalikes or hide the real destination behind shortened links.',
    simpleExample:
      'http://sbi-kyc-update.example.com or https://bit.ly/claim-refund-now',
    howToRecogniseIt:
      'Read the domain right before the first single slash (/). Check for swapped digits (paypa1), extra hyphens, or unencrypted http:// on login pages.',
  },
  {
    id: 'rf-fake-gov',
    title: 'Fake Government Identities',
    whatItMeans:
      'Calls or messages claiming to be from CBI, TRAI, Police, Customs, UIDAI, or the Income Tax Department threatening "digital arrest" or penalties.',
    whyScammersUseIt:
      'Fear of law enforcement or government penalties makes targets comply quickly and keep the call secret from family.',
    simpleExample:
      '"TRAI & CBI Notice: Stay on video call for digital arrest verification and transfer security deposit."',
    howToRecogniseIt:
      'Indian law enforcement never conducts "digital arrests" over video calls, and genuine government portals use official `.gov.in` domains.',
  },
  {
    id: 'rf-advance-payment',
    title: 'Advance Payment Requests',
    whatItMeans:
      'Being asked to pay a small registration fee, customs duty, processing charge, or redelivery fee before receiving a job, parcel, or prize.',
    whyScammersUseIt:
      'Small upfront fees (like Rs. 25 or Rs. 499) seem low-risk, allowing scammers to steal card details or escalate into larger demands.',
    simpleExample:
      '"Pay Rs. 25 redelivery fee to release your held parcel" or "Pay Rs. 1,500 refundable laptop deposit."',
    howToRecogniseIt:
      'Legitimate employers do not charge fees for job offers, and genuine couriers rarely demand card details via random SMS links.',
  },
  {
    id: 'rf-unrealistic-rewards',
    title: 'Unrealistic Financial Rewards',
    whatItMeans:
      'Unexpected lottery wins, cashback jackpots, or work-from-home offers promising thousands of rupees per day for liking videos.',
    whyScammersUseIt:
      'Excitement over easy money lowers skepticism and pulls victims into advance-fee or prepaid task traps.',
    simpleExample:
      '"Earn Rs. 5,000 daily from home with zero experience—message HR on WhatsApp."',
    howToRecogniseIt:
      'If you never entered a draw, you cannot win a lottery. If daily pay sounds disproportionately high for simple clicks, it is a scam.',
  },
  {
    id: 'rf-unverified-payment',
    title: 'Unverified Payment Instructions',
    whatItMeans:
      'Strangers asking you to scan a QR code, approve a UPI collect request, or enter your UPI PIN "to receive money."',
    whyScammersUseIt:
      'Fraudsters exploit confusion between sending and receiving in UPI apps—entering a PIN or scanning a payment QR always debits your account.',
    simpleExample:
      '"Approve this UPI collect request and enter your PIN so my Rs. 10,000 payment credits to you."',
    howToRecogniseIt:
      'Remember one simple rule: you NEVER need to enter a UPI PIN or scan a QR code to receive money into your account.',
  },
  {
    id: 'rf-brand-impersonation',
    title: 'Brand Impersonation',
    whatItMeans:
      'Messages using the name or tone of trusted banks, couriers, e-commerce sites, or social platforms while directing you to unofficial contacts.',
    whyScammersUseIt:
      'People naturally trust names they use every day like SBI, HDFC, FedEx, India Post, or Amazon.',
    simpleExample:
      '"PayPal Security Team: Confirm your password immediately at paypa1-verify.example.com."',
    howToRecogniseIt:
      'Ignore the display name or sender claim and independently open the company’s official app or type its verified website address yourself.',
  },
];
