import type { SampleMessage } from '../../src/types/scamshield.ts';

export const DEMO_SAMPLES: SampleMessage[] = [
  {
    id: 'fake-bank-kyc',
    title: 'Fake Bank KYC Suspension',
    channel: 'sms',
    expectedRisk: 'CRITICAL',
    categoryLabel: 'Financial Impersonation',
    content:
      'URGENT: Your HDFC Bank account will be suspended today due to pending KYC verification. Verify your KYC immediately using this link: http://hdfc-kyc-update.xyz/verify-account',
  },
  {
    id: 'fake-lottery-winner',
    title: 'Fake Lottery Winner Claim',
    channel: 'whatsapp',
    expectedRisk: 'CRITICAL',
    categoryLabel: 'Prize & Advance-Fee Scam',
    content:
      'Congratulations! You have won $250,000 in the International Digital Draw! Claim your prize within 24 hours by paying a small processing fee at https://bit.ly/claim-prize-now99',
  },
  {
    id: 'fake-delivery-hold',
    title: 'Fake Delivery Address Hold',
    channel: 'sms',
    expectedRisk: 'CRITICAL',
    categoryLabel: 'Smishing / Delivery Trap',
    content:
      'FedEx Notice: Your package is on hold due to an incomplete shipping address. Reschedule delivery immediately and pay a redelivery fee: https://fedex-track-parcel.top/reschedule',
  },
  {
    id: 'fake-job-offer',
    title: 'Fake Part-Time Job Offer',
    channel: 'whatsapp',
    expectedRisk: 'HIGH',
    categoryLabel: 'Recruitment / Task Scam',
    content:
      'Part-time job offer! Earn $350 per day working from home with no experience needed—just like YouTube videos and earn guaranteed daily income. Message our HR manager on WhatsApp: https://tinyurl.com/hr-task-apply',
  },
  {
    id: 'suspicious-otp-request',
    title: 'Suspicious OTP Harvesting',
    channel: 'sms',
    expectedRisk: 'CRITICAL',
    categoryLabel: 'Credential Harvesting',
    content:
      'Security Alert from PayPal: Unusual payment detected. Reply with your 6-digit OTP immediately or enter your password at https://paypa1-secure-login.com/confirm to prevent account lock.',
  },
  {
    id: 'legit-bank-txn',
    title: 'Legitimate Bank Transaction Alert',
    channel: 'sms',
    expectedRisk: 'LOW',
    categoryLabel: 'Legitimate Financial Alert',
    content:
      'Rs. 480.00 debited from A/C XX4912 on 20-Nov via UPI Ref 432510982112. Available bal: Rs. 14,210.50. Do not share OTP or PIN with anyone. If you did not make this transaction, call official helpline 1800-202-6161.',
  },
  {
    id: 'normal-whatsapp',
    title: 'Normal Personal WhatsApp',
    channel: 'whatsapp',
    expectedRisk: 'LOW',
    categoryLabel: 'Personal Conversation',
    content:
      'Hey! Are we still meeting at the library at 4 PM to practice our hackathon demo slides? Let me know if I should bring the HDMI adapter.',
  },
  {
    id: 'legit-delivery-update',
    title: 'Legitimate Delivery Update',
    channel: 'sms',
    expectedRisk: 'LOW',
    categoryLabel: 'Legitimate Courier Update',
    content:
      'Your Amazon package (Tracking ID: AMZ94827104) is out for delivery and arriving today before 7 PM. Share delivery PIN at doorstep only upon receiving the parcel.',
  },
];
