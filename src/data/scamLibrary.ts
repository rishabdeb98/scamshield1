import type { ScamLibraryExample } from '../types/scamshield';

export const SCAM_LIBRARY_EXAMPLES: ScamLibraryExample[] = [
  // A. BANKING SCAMS (4)
  {
    id: 'bank-sbi-kyc',
    title: 'Fake SBI KYC Update',
    category: 'Banking',
    categoryDisplay: 'Banking Phishing',
    riskLevel: 'CRITICAL',
    channel: 'sms',
    sampleMessage:
      'Dear Customer, your SBI account will be blocked today due to pending KYC. Complete your KYC immediately using this link: http://sbi-kyc-update.example.com/verify',
    description:
      'Threatens immediate account freeze unless you submit KYC and net-banking details on a lookalike domain.',
    explanation:
      'Fraudsters impersonate State Bank of India and manufacture fear of an imminent account block so victims rush to click an unverified link without checking the sender or domain.',
    redFlags: [
      'Urgency and pressure tactics ("will be blocked today", "immediately").',
      'Banking brand impersonation (SBI).',
      'Threat of account suspension.',
      'Suspicious external domain over unencrypted HTTP.',
      'Attempt to manipulate the recipient into clicking a link.',
    ],
    attackTechnique: 'Brand impersonation and credential-harvesting phishing.',
    howItWorks:
      'The link opens a cloned banking login screen requesting your username, password, ATM PIN, and OTP. Once entered, attackers immediately register a new mobile banking device or transfer funds.',
    protectionAdvice: [
      'Never share OTPs or net-banking passwords.',
      'Never enter banking credentials on unverified websites.',
      'Verify KYC status inside the official YONO SBI app or by visiting your bank branch.',
      'Report suspicious SMS senders via the Chakshu portal or 1930.',
    ],
    relatedIds: ['bank-account-suspension', 'bank-credit-card-verify', 'gov-pan-verification'],
    addedAt: '2026-11-20',
    isRecent: true,
  },
  {
    id: 'bank-account-suspension',
    title: 'Bank Account Suspension Threat',
    category: 'Banking',
    categoryDisplay: 'Banking Scams',
    riskLevel: 'HIGH',
    channel: 'sms',
    sampleMessage:
      'URGENT: Your HDFC Bank account has been temporarily suspended for security review. Re-activate within 2 hours at http://hdfc-secure-login.example.in/unlock',
    description:
      'Pressures recipients with a 2-hour countdown before permanent suspension unless they unlock their account online.',
    explanation:
      'Uses an artificial 2-hour deadline to short-circuit careful inspection of the link domain and sender ID.',
    redFlags: [
      'Countdown pressure ("within 2 hours").',
      'Fake account suspension claim.',
      'Non-official domain mimicking HDFC Bank.',
      'Unencrypted HTTP link.',
    ],
    attackTechnique: 'Urgency-driven phishing and session hijacking.',
    howItWorks:
      'Victims are directed to a fake "unlock account" page that collects customer ID, password, and DOB, followed by an OTP prompt to authorize a fraudulent transfer.',
    protectionAdvice: [
      'Log in directly through your official HDFC MobileBanking app instead of tapping SMS links.',
      'Check that the domain ends strictly with the bank’s official domain before entering any credential.',
      'Call the customer care number printed on the back of your debit card if unsure.',
    ],
    relatedIds: ['bank-sbi-kyc', 'bank-suspicious-txn-alert', 'phish-social-verification'],
    addedAt: '2026-11-18',
  },
  {
    id: 'bank-credit-card-verify',
    title: 'Fake Credit Card Verification',
    category: 'Banking',
    categoryDisplay: 'Banking Scams',
    riskLevel: 'HIGH',
    channel: 'whatsapp',
    sampleMessage:
      'ICICI Card Services: Your credit card reward points worth Rs. 8,400 expire tonight. Verify your card CVV and OTP at https://icici-cards-reward.example.com/redeem',
    description:
      'Promises expiring credit card reward points to trick users into entering their card number, CVV, and OTP.',
    explanation:
      'Combines reward urgency ("expire tonight") with direct requests for sensitive card details and OTPs.',
    redFlags: [
      'Requests CVV and OTP on an external webpage.',
      'Artificial expiration deadline ("expire tonight").',
      'Lookalike domain unrelated to ICICI Bank.',
    ],
    attackTechnique: 'Reward-lure phishing and card credential harvesting.',
    howItWorks:
      'Once the victim enters their 16-digit card number, expiry, CVV, and the OTP sent by the real bank for an attacker-initiated purchase, the transaction completes immediately.',
    protectionAdvice: [
      'Banks never ask for your CVV or OTP to redeem reward points.',
      'Redeem rewards strictly inside your bank’s official mobile app.',
      'Enable international and online transaction limits on your credit card.',
    ],
    relatedIds: ['bank-sbi-kyc', 'upi-cashback-offer', 'bank-suspicious-txn-alert'],
    addedAt: '2026-11-15',
  },
  {
    id: 'bank-suspicious-txn-alert',
    title: 'Suspicious Banking Transaction Alert',
    category: 'Banking',
    categoryDisplay: 'Banking Scams',
    riskLevel: 'HIGH',
    channel: 'sms',
    sampleMessage:
      'Alert: Rs. 49,500 debited from your Axis Bank account via NEFT. If you did not authorize this, click immediately to cancel and refund: http://axis-dispute-desk.example.com/cancel',
    description:
      'Sends a fabricated high-value debit alert with a fake "click to cancel" link to capture login and OTP details.',
    explanation:
      'Unlike genuine bank SMS alerts—which mask account numbers and instruct you to call an official helpline—scammers attach a clickable cancellation link.',
    redFlags: [
      'Urgent large debit claim designed to cause panic.',
      'Includes an unverified cancellation URL.',
      'Promises instant refund via a third-party link.',
    ],
    attackTechnique: 'Panic-induced phishing ("reverse-alert" trap).',
    howItWorks:
      'Shocked by the fake Rs. 49,500 debit, the user taps the "cancel" link and enters banking credentials and an OTP, inadvertently authorizing a real transfer.',
    protectionAdvice: [
      'Check your actual balance inside your official banking app first.',
      'Remember that genuine transaction alerts do not include external "click to cancel" web links.',
      'Report unauthorized activity only through official banking helplines.',
    ],
    relatedIds: ['bank-account-suspension', 'bank-sbi-kyc', 'upi-collect-request'],
    addedAt: '2026-11-14',
  },

  // B. UPI AND PAYMENT SCAMS (4)
  {
    id: 'upi-collect-request',
    title: 'Fake UPI Collect Request',
    category: 'UPI',
    categoryDisplay: 'UPI & Payment Scams',
    riskLevel: 'CRITICAL',
    channel: 'whatsapp',
    sampleMessage:
      'Hi, I am sending Rs. 12,000 advance for your OLX sofa listing. Approve the UPI collect request and enter your UPI PIN to receive money immediately: http://upi-receive-pay.example.in/claim',
    description:
      'Tricks sellers into approving a payment-out collect request by claiming an OTP or UPI PIN is needed to receive money.',
    explanation:
      'Exploits a common misconception about UPI: entering your UPI PIN ALWAYS sends money out of your account—it is never required to receive funds.',
    redFlags: [
      'Claims you must enter your UPI PIN to "receive" money.',
      'Uses an external link or collect request from an unknown buyer.',
      'Rushes the seller with "immediately" urgency.',
    ],
    attackTechnique: 'Payment-direction inversion and UPI social engineering.',
    howItWorks:
      'The scammer poses as an eager marketplace buyer and sends a UPI collect request instead of a transfer. When the victim enters their UPI PIN thinking they are accepting payment, funds are debited.',
    protectionAdvice: [
      'Never enter your UPI PIN to receive money—PIN is only for sending money.',
      'Decline unexpected UPI collect requests from strangers immediately.',
      'Verify incoming payments solely by checking your bank balance or transaction history.',
    ],
    relatedIds: ['upi-qr-scan', 'upi-screenshot-claim', 'upi-cashback-offer'],
    addedAt: '2026-11-20',
    isRecent: true,
  },
  {
    id: 'upi-screenshot-claim',
    title: 'Fake Payment Received Screenshot Claim',
    category: 'UPI',
    categoryDisplay: 'UPI & Payment Scams',
    riskLevel: 'MEDIUM',
    channel: 'whatsapp',
    sampleMessage:
      'Brother I just transferred Rs. 4,500 by mistake to your number! See screenshot attached, please urgently refund Rs. 4,500 back to +91-98000-00101 right now.',
    description:
      'Sends a forged UPI confirmation SMS or edited screenshot claiming an accidental transfer and demands an immediate refund.',
    explanation:
      'Fraudsters spoof payment-received SMS messages from regular 10-digit numbers or send doctored screenshots without any actual bank credit.',
    redFlags: [
      'Pressures you to refund money "right now" without verifying bank balance.',
      'Relies on a screenshot or non-bank SMS instead of actual account credit.',
      'Redirects refund to a different mobile number.',
    ],
    attackTechnique: 'Spoofed payment confirmation and social engineering.',
    howItWorks:
      'Before the victim opens their banking app to check their real balance, the scammer pleads urgency and convinces them to transfer money back.',
    protectionAdvice: [
      'Always open your official UPI or banking app and verify the settled balance—never trust screenshots or SMS alerts alone.',
      'If a genuine mistake occurred, tell the sender to raise a dispute through their own bank.',
    ],
    relatedIds: ['upi-collect-request', 'upi-cashback-offer', 'bank-suspicious-txn-alert'],
    addedAt: '2026-11-12',
  },
  {
    id: 'upi-qr-scan',
    title: 'QR Code Payment Scam',
    category: 'UPI',
    categoryDisplay: 'UPI & Payment Scams',
    riskLevel: 'HIGH',
    channel: 'whatsapp',
    sampleMessage:
      'Army canteen order confirmed. Scan this QR code in your GPay/PhonePe app and enter your UPI PIN to receive the Rs. 15,000 advance payment immediately.',
    description:
      'Asks sellers or shopkeepers to scan a QR code and enter their UPI PIN to "receive" an advance or refund.',
    explanation:
      'Scanning a QR code and entering a UPI PIN initiates an outgoing payment from your bank account.',
    redFlags: [
      'Asks you to scan a QR code to receive money.',
      'Instructs you to enter your UPI PIN.',
      'Uses trusted personas (e.g., defence personnel) to build false credibility.',
    ],
    attackTechnique: 'QR payment inversion and authority impersonation.',
    howItWorks:
      'The QR code encodes a payment request to the fraudster’s UPI ID. Entering the PIN transfers money from the victim to the scammer.',
    protectionAdvice: [
      'Scanning a QR code and entering a UPI PIN only debits money—never credits it.',
      'Share your own UPI ID or QR code only if you want someone to pay you, and never enter your PIN to accept funds.',
    ],
    relatedIds: ['upi-collect-request', 'upi-cashback-offer', 'upi-screenshot-claim'],
    addedAt: '2026-11-16',
  },
  {
    id: 'upi-cashback-offer',
    title: 'Fake Cashback Offer',
    category: 'UPI',
    categoryDisplay: 'UPI & Payment Scams',
    riskLevel: 'HIGH',
    channel: 'sms',
    sampleMessage:
      'Congratulations! You unlocked Rs. 2,500 UPI cashback reward! Claim your prize today by verifying your UPI PIN at http://upi-cashback-claim.example.com/reward',
    description:
      'Lures users with a fake cashback scratch card or reward that requires submitting UPI details or approving a collect link.',
    explanation:
      'Legitimate UPI cashback credits automatically inside the app and never requires visiting an external website or entering a PIN.',
    redFlags: [
      'Unsolicited cashback reward claim.',
      'External link on an unverified domain.',
      'Requests UPI PIN verification to claim reward.',
    ],
    attackTechnique: 'Reward bait and UPI credential phishing.',
    howItWorks:
      'Tapping the link either opens a UPI payment intent pre-filled with a debit amount or harvests banking credentials on a fake claim portal.',
    protectionAdvice: [
      'Check cashback offers strictly inside the official Rewards tab of your UPI app.',
      'Never click external cashback links or enter your PIN to claim a reward.',
    ],
    relatedIds: ['upi-collect-request', 'fin-lottery-winner', 'bank-credit-card-verify'],
    addedAt: '2026-11-11',
  },

  // C. GOVERNMENT IMPERSONATION (4)
  {
    id: 'gov-aadhaar-update',
    title: 'Fake Aadhaar Update',
    category: 'Government',
    categoryDisplay: 'Government Impersonation',
    riskLevel: 'HIGH',
    channel: 'sms',
    sampleMessage:
      'UIDAI Notice: Your Aadhaar biometrics are outdated and will be deactivated today. Update Aadhaar details immediately and pay Rs. 50 fee at http://aadhaar-update-portal.example.in',
    description:
      'Threatens Aadhaar deactivation unless you submit personal details and pay a fee on an unofficial website.',
    explanation:
      'Scammers impersonate UIDAI to harvest Aadhaar numbers, linked mobile numbers, and card/UPI payment details.',
    redFlags: [
      'Claims Aadhaar will be deactivated today.',
      'Requests an online fee on a non-.gov.in domain.',
      'Uses urgent threat language.',
    ],
    attackTechnique: 'Government agency impersonation and PII harvesting.',
    howItWorks:
      'The fake portal collects Aadhaar numbers, demographic details, and payment credentials, which can be abused for identity theft or unauthorized SIM/account misuse.',
    protectionAdvice: [
      'Official UIDAI services exist only on uidai.gov.in or myaadhaar.uidai.gov.in.',
      'UIDAI does not threaten same-day deactivation via SMS links.',
      'Never upload identity documents to third-party portals.',
    ],
    relatedIds: ['gov-pan-verification', 'gov-digital-arrest', 'gov-subsidy-claim'],
    addedAt: '2026-11-17',
  },
  {
    id: 'gov-pan-verification',
    title: 'Fake PAN Card Verification',
    category: 'Government',
    categoryDisplay: 'Government Impersonation',
    riskLevel: 'HIGH',
    channel: 'sms',
    sampleMessage:
      'Income Tax Department Alert: Your PAN card is flagged for mismatch and your bank account will be frozen. Verify PAN and OTP immediately: http://incometax-pan-verify.example.com',
    description:
      'Claims your PAN is invalid and threatens bank account freeze to steal banking logins and OTPs.',
    explanation:
      'Combines fear of tax penalties and frozen bank accounts with a lookalike domain that is not a `.gov.in` site.',
    redFlags: [
      'Threatens immediate bank account freeze.',
      'Non-government domain (.example.com instead of .gov.in).',
      'Asks for OTP verification through an SMS link.',
    ],
    attackTechnique: 'Tax authority impersonation and phishing.',
    howItWorks:
      'Victims enter PAN, DOB, bank account, and OTP on the spoofed portal, allowing attackers to compromise linked banking accounts.',
    protectionAdvice: [
      'Official Income Tax e-filing services use incometax.gov.in only.',
      'Check PAN-Aadhaar status directly by typing the official `.gov.in` URL into your browser.',
    ],
    relatedIds: ['gov-aadhaar-update', 'bank-sbi-kyc', 'gov-digital-arrest'],
    addedAt: '2026-11-13',
  },
  {
    id: 'gov-digital-arrest',
    title: 'Digital Arrest Threat',
    category: 'Government',
    categoryDisplay: 'Government Impersonation',
    riskLevel: 'CRITICAL',
    channel: 'whatsapp',
    sampleMessage:
      'TRAI & CBI Cyber Crime Cell Notice: A parcel with illegal items and an arrest warrant has been linked to your Aadhaar. Do not inform anyone—stay on video call for digital arrest verification and transfer security deposit immediately.',
    description:
      'Coerces victims into staying on video calls and transferring money under fake "digital arrest" orders from CBI, TRAI, or Police.',
    explanation:
      'There is NO legal provision for "digital arrest" in India. Law enforcement never conducts interrogations or collects bail/security deposits over WhatsApp/Skype video calls.',
    redFlags: [
      'Mentions "digital arrest", "arrest warrant", or "stay on video call".',
      'Impersonates CBI, TRAI, Police, or Customs.',
      'Demands secrecy ("do not inform anyone") and immediate money transfer.',
    ],
    attackTechnique: 'Psychological coercion, authority impersonation, and extortion.',
    howItWorks:
      'Scammers wear fake uniforms on video calls, show forged warrant PDFs, isolate the victim emotionally, and coerce them into transferring savings to "clear" their name.',
    protectionAdvice: [
      'Hang up immediately—"digital arrest" does not exist under Indian law.',
      'Never transfer money to verify your innocence or clear a warrant.',
      'Discuss the call with family and report immediately on cybercrime.gov.in or 1930.',
    ],
    relatedIds: ['gov-aadhaar-update', 'delivery-customs-clearance', 'gov-pan-verification'],
    addedAt: '2026-11-20',
    isRecent: true,
  },
  {
    id: 'gov-subsidy-claim',
    title: 'Fake Government Subsidy',
    category: 'Government',
    categoryDisplay: 'Government Impersonation',
    riskLevel: 'MEDIUM',
    channel: 'whatsapp',
    sampleMessage:
      'PM Citizen Welfare Scheme: You are approved for Rs. 6,000 direct subsidy! Submit bank details and a Rs. 99 processing fee before midnight at http://pm-subsidy-apply.example.org',
    description:
      'Uses fake government welfare or subsidy grants to collect personal bank details and upfront registration fees.',
    explanation:
      'Genuine government Direct Benefit Transfer (DBT) schemes do not ask citizens to pay processing fees on unofficial `.org` or `.com` links.',
    redFlags: [
      'Asks for a Rs. 99 processing fee to receive a government grant.',
      'Hosted on an unofficial domain rather than `.gov.in`.',
      'Midnight deadline pressure.',
    ],
    attackTechnique: 'Welfare grant bait and advance-fee fraud.',
    howItWorks:
      'Forwards across WhatsApp groups promise instant cash subsidies while collecting small fees and sensitive bank/Aadhaar numbers from thousands of users.',
    protectionAdvice: [
      'Verify government schemes strictly on official `.gov.in` portals.',
      'Never pay a fee to receive a government subsidy.',
    ],
    relatedIds: ['gov-aadhaar-update', 'upi-cashback-offer', 'fin-lottery-winner'],
    addedAt: '2026-11-09',
  },

  // D. DELIVERY AND COURIER SCAMS (3)
  {
    id: 'delivery-parcel-fee',
    title: 'Fake Parcel Delivery Fee',
    category: 'Delivery',
    categoryDisplay: 'Delivery & Courier Scams',
    riskLevel: 'HIGH',
    channel: 'sms',
    sampleMessage:
      'India Post Notice: Your package is on hold due to incomplete address. Pay Rs. 25 redelivery fee immediately to avoid return: http://indiapost-redelivery.example.com/pay',
    description:
      'Requests a small redelivery fee (Rs. 15–50) via SMS link to harvest card or UPI details.',
    explanation:
      'The tiny fee looks harmless, lowering the victim’s guard—yet entering card details and an OTP on the fake form lets attackers drain much larger amounts.',
    redFlags: [
      'Small upfront redelivery fee request.',
      'Fake India Post domain instead of indiapost.gov.in.',
      'Urgent threat that parcel will be returned.',
    ],
    attackTechnique: 'Low-fee smishing lure for card/OTP capture.',
    howItWorks:
      'Once the victim types their debit/credit card number for the Rs. 25 charge, the scammer triggers a high-value transaction and tricks the victim into submitting the OTP.',
    protectionAdvice: [
      'Track parcels directly on the official courier website using your order tracking ID.',
      'Never pay small "redelivery fees" through SMS links.',
    ],
    relatedIds: ['delivery-customs-clearance', 'delivery-address-verify', 'bank-credit-card-verify'],
    addedAt: '2026-11-19',
    isRecent: true,
  },
  {
    id: 'delivery-customs-clearance',
    title: 'Customs Clearance Payment Scam',
    category: 'Delivery',
    categoryDisplay: 'Delivery & Courier Scams',
    riskLevel: 'HIGH',
    channel: 'whatsapp',
    sampleMessage:
      'DHL Customs Alert: Your international parcel is held by Customs Department for unpaid clearance duty of Rs. 18,500. Pay immediately or face legal action: http://dhl-customs-pay.example.com',
    description:
      'Claims an international gift or parcel is stuck at customs and demands urgent clearance fees.',
    explanation:
      'Often paired with romance or online-friendship scams where someone claims to have sent expensive gifts requiring sudden customs payment.',
    redFlags: [
      'Unexpected international parcel with large customs duty.',
      'Threatens legal action if unpaid.',
      'Payment link on a non-official domain.',
    ],
    attackTechnique: 'Advance-fee courier impersonation.',
    howItWorks:
      'Victims pay repeated "customs", "anti-money laundering", and "insurance" fees for a parcel that never existed.',
    protectionAdvice: [
      'Verify any customs notice directly with the official courier helpline.',
      'Legitimate customs duties are never collected via personal WhatsApp accounts or third-party links.',
    ],
    relatedIds: ['delivery-parcel-fee', 'gov-digital-arrest', 'delivery-address-verify'],
    addedAt: '2026-11-10',
  },
  {
    id: 'delivery-address-verify',
    title: 'Fake Address Verification Message',
    category: 'Delivery',
    categoryDisplay: 'Delivery & Courier Scams',
    riskLevel: 'MEDIUM',
    channel: 'sms',
    sampleMessage:
      'Courier Update: Unable to deliver your parcel due to incomplete shipping address. Update your delivery address within 12 hours at http://parcel-address-confirm.example.in',
    description:
      'Uses vague "incomplete address" wording without a real tracking ID to direct recipients to a phishing link.',
    explanation:
      'Because almost everyone expects a package occasionally, generic courier messages achieve high click rates.',
    redFlags: [
      'No genuine courier name or valid order reference.',
      'Urgent 12-hour deadline.',
      'Suspicious address-update link.',
    ],
    attackTechnique: 'Generic smishing lure.',
    howItWorks:
      'The link asks for address confirmation followed by a "re-dispatch verification fee" that harvests card credentials.',
    protectionAdvice: [
      'Check the e-commerce app (Amazon, Flipkart, etc.) where you placed your order—genuine delivery updates appear there.',
      'Ignore generic SMS links lacking an order ID.',
    ],
    relatedIds: ['delivery-parcel-fee', 'delivery-customs-clearance', 'phish-social-verification'],
    addedAt: '2026-11-08',
  },

  // E. JOB AND FINANCIAL SCAMS (4)
  {
    id: 'job-wfh-task',
    title: 'Fake Work-from-Home Job',
    category: 'Job',
    categoryDisplay: 'Job & Financial Scams',
    riskLevel: 'HIGH',
    channel: 'whatsapp',
    sampleMessage:
      'Part-time job offer! Earn Rs. 3,000 to Rs. 8,000 per day working from home with no experience needed—just like YouTube videos and earn guaranteed daily income. Message our HR manager on WhatsApp: http://hr-task-work.example.com',
    description:
      'Promises effortless daily income for liking videos or rating hotels, pulling victims into prepaid "task" scams.',
    explanation:
      'Task scams start by paying small amounts (Rs. 150–300) to build trust, then require "merchant prepaid deposits" that lock victims out of larger sums.',
    redFlags: [
      'Unrealistic pay for trivial tasks ("earn Rs. 8,000 per day").',
      'No experience or interview required.',
      'Recruits via unsolicited WhatsApp or Telegram messages.',
    ],
    attackTechnique: 'Task-based advance-fee fraud.',
    howItWorks:
      'After initial small payouts, scammers assign "VIP tasks" requiring victims to deposit Rs. 10,000–2,00,000, refusing withdrawals until more money is deposited.',
    protectionAdvice: [
      'Legitimate employers never require you to deposit money to earn salary.',
      'Treat unsolicited WhatsApp/Telegram part-time task offers as scams.',
    ],
    relatedIds: ['job-registration-fee', 'fin-guaranteed-returns', 'upi-cashback-offer'],
    addedAt: '2026-11-19',
    isRecent: true,
  },
  {
    id: 'job-registration-fee',
    title: 'Registration Fee Job Scam',
    category: 'Job',
    categoryDisplay: 'Job & Financial Scams',
    riskLevel: 'HIGH',
    channel: 'email',
    sampleMessage:
      'Congratulations! You are shortlisted for Senior Operations Associate (Salary Rs. 65,000/month). Pay refundable Rs. 1,950 registration and laptop security fee today to confirm offer letter: http://career-offer-desk.example.in/pay',
    description:
      'Sends fake interview shortlists or offer letters demanding a "refundable" registration or laptop deposit.',
    explanation:
      'Targets job seekers by impersonating well-known IT or corporate HR departments and demanding upfront fees before onboarding.',
    redFlags: [
      'Demands upfront registration or security fee for a job offer.',
      'Urgent same-day payment deadline.',
      'Unofficial domain instead of the employer’s verified careers site.',
    ],
    attackTechnique: 'Employment impersonation and advance-fee fraud.',
    howItWorks:
      'Scammers collect resumes from public job boards, issue realistic-looking PDF offer letters, and disappear once the "registration" and "document verification" fees are paid.',
    protectionAdvice: [
      'Genuine companies never charge candidates a registration or laptop deposit fee.',
      'Verify interview emails by checking the sender domain and official company career portal.',
    ],
    relatedIds: ['job-wfh-task', 'fin-guaranteed-returns', 'gov-subsidy-claim'],
    addedAt: '2026-11-07',
  },
  {
    id: 'fin-lottery-winner',
    title: 'Fake Lottery Winner',
    category: 'Financial',
    categoryDisplay: 'Job & Financial Scams',
    riskLevel: 'CRITICAL',
    channel: 'whatsapp',
    sampleMessage:
      'Congratulations! You have won Rs. 25,00,000 in the KBC International Lucky Winner Draw! Claim your prize within 24 hours by paying a small processing fee and sharing OTP at http://kbc-prize-claim.example.com',
    description:
      'Claims you won a massive lottery or game-show draw you never entered, demanding tax/processing fees first.',
    explanation:
      'You cannot win a lottery or lucky draw you never participated in. Any demand to pay upfront charges to unlock prize money is fraudulent.',
    redFlags: [
      'Unexpected lottery or lucky winner claim.',
      'Demands processing fee and OTP to release prize.',
      '24-hour expiration pressure.',
      'Suspicious external claim link.',
    ],
    attackTechnique: 'Advance-fee lottery fraud and credential harvesting.',
    howItWorks:
      'Victims who pay the initial "processing fee" are repeatedly asked for "GST", "RBI clearance", and "bank transfer charges" without ever receiving any prize.',
    protectionAdvice: [
      'Never pay money to claim a prize or lottery win.',
      'Block unknown WhatsApp numbers claiming KBC or international draw winnings.',
    ],
    relatedIds: ['upi-cashback-offer', 'fin-guaranteed-returns', 'gov-subsidy-claim'],
    addedAt: '2026-11-06',
  },
  {
    id: 'fin-guaranteed-returns',
    title: 'Investment Return Guarantee Scam',
    category: 'Financial',
    categoryDisplay: 'Job & Financial Scams',
    riskLevel: 'MEDIUM',
    channel: 'social',
    sampleMessage:
      'Join our VIP Stock & Crypto Trading Group! Guaranteed 40% weekly returns with zero risk. Transfer minimum Rs. 10,000 today to double your capital in 10 days: http://vip-wealth-returns.example.com',
    description:
      'Promises guaranteed high returns with zero risk through fake trading apps or Telegram/WhatsApp investment groups.',
    explanation:
      'No legitimate SEBI-registered investment offers guaranteed 40% weekly profits or zero-risk doubling schemes.',
    redFlags: [
      'Promises "guaranteed" high returns and "zero risk".',
      'Recruits through social media / VIP chat groups.',
      'Urgency to transfer funds today.',
    ],
    attackTechnique: 'Ponzi / fake trading platform fraud.',
    howItWorks:
      'Victims download a fake trading dashboard showing fabricated profits. When they try to withdraw, the platform demands heavy "withdrawal taxes" and then shuts down.',
    protectionAdvice: [
      'Verify any investment advisor’s SEBI registration number independently.',
      'Be skeptical of any promise of guaranteed or doubled returns.',
    ],
    relatedIds: ['job-wfh-task', 'fin-lottery-winner', 'upi-collect-request'],
    addedAt: '2026-11-05',
  },

  // F. GENERAL PHISHING (1)
  {
    id: 'phish-social-verification',
    title: 'Fake Social Media Account Verification',
    category: 'Phishing',
    categoryDisplay: 'General Phishing',
    riskLevel: 'HIGH',
    channel: 'email',
    sampleMessage:
      'Security Warning: Copyright infringement detected on your Instagram account. Your profile will be permanently deleted within 24 hours unless you verify your password and login details at http://meta-appeal-verify.example.com/login',
    description:
      'Threatens sudden social media account deletion for fake copyright claims to steal your login and 2FA codes.',
    explanation:
      'Targets creators, businesses, and everyday users by impersonating platform trust & safety teams.',
    redFlags: [
      'Threatens permanent deletion within 24 hours.',
      'Asks for password and login verification on a third-party domain.',
      'Impersonates platform security/copyright notices.',
    ],
    attackTechnique: 'Account takeover phishing.',
    howItWorks:
      'Once credentials and 2FA codes are entered on the cloned appeal page, attackers change the account’s email and phone number and message the victim’s contacts to run payment scams.',
    protectionAdvice: [
      'Check account notices solely inside the official app’s Settings -> Account Status or Security emails log.',
      'Use an authenticator app for 2FA and never enter your password on links sent via DM or email.',
    ],
    relatedIds: ['bank-account-suspension', 'bank-sbi-kyc', 'delivery-address-verify'],
    addedAt: '2026-11-16',
  },
];
