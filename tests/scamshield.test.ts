import assert from 'node:assert/strict';
import test from 'node:test';
import { runMessageAnalysis, runUrlAnalysis } from '../server/detection/engine.ts';
import { DEMO_SAMPLES } from '../server/detection/samples.ts';
import { createApp } from '../server.ts';

test('All 8 demo sample messages classify to their expected risk levels', () => {
  assert.equal(DEMO_SAMPLES.length, 8);

  for (const sample of DEMO_SAMPLES) {
    const result = runMessageAnalysis({
      text: sample.content,
      channel: sample.channel,
      saveToHistory: false,
    });
    assert.equal(
      result.classification,
      sample.expectedRisk,
      `Sample "${sample.id}" expected ${sample.expectedRisk} but got ${result.classification} (score=${result.score})`,
    );
    assert.ok(result.recommendations.length > 0, 'Should always provide safety recommendations');
  }
});

test('Legitimate messages containing sensitive words like bank/OTP/delivery remain LOW RISK', () => {
  const bankMsg = runMessageAnalysis({
    text: 'Your bank statement for A/C XX9021 is ready. Never share your OTP or password with anyone.',
    channel: 'sms',
    saveToHistory: false,
  });
  assert.equal(bankMsg.classification, 'LOW');
  assert.ok(bankMsg.score < 30);

  const noLinkMsg = runMessageAnalysis({
    text: 'Hi team, let us meet at 5pm near the main auditorium to rehearse the presentation.',
    channel: 'whatsapp',
    saveToHistory: false,
  });
  assert.equal(noLinkMsg.classification, 'LOW');
  assert.equal(noLinkMsg.score, 0);
});

test('URL analyzer flags IP hosts, shorteners, typosquats, excessive subdomains, and dangerous schemes', () => {
  const ipUrl = runUrlAnalysis({ url: 'http://192.168.10.25/bank/login' });
  assert.ok(ipUrl.score >= 45);
  assert.ok(ipUrl.urls[0]?.isIpAddress);

  const shortUrl = runUrlAnalysis({ url: 'https://bit.ly/3xVerifyKyc' });
  assert.ok(shortUrl.urls[0]?.isShortener);
  assert.ok(shortUrl.urls[0]?.isHttps);
  assert.ok(shortUrl.contextNotes.some((n) => n.toLowerCase().includes('https')));

  const typoUrl = runUrlAnalysis({ url: 'https://paypa1-account-verify.xyz/signin' });
  assert.equal(typoUrl.classification, 'HIGH');
  assert.equal(typoUrl.urls[0]?.suspectedBrand, 'PayPal');

  const subdomainUrl = runUrlAnalysis({
    url: 'https://secure.login.account.verify.example-portal.top/update',
  });
  assert.ok((subdomainUrl.urls[0]?.subdomainCount ?? 0) >= 3);
  assert.ok(subdomainUrl.score >= 30);

  const malformed = runUrlAnalysis({ url: 'not a valid url at all' });
  assert.equal(malformed.urls[0]?.valid, false);
  assert.ok(malformed.indicators.length >= 1);

  const jsScheme = runUrlAnalysis({ url: 'javascript:alert(1)' });
  assert.equal(jsScheme.urls[0]?.valid, false);
  assert.ok(jsScheme.score >= 50);
});

test('API endpoints validate input, isolate SQLite history per session, and respect saveToHistory=false', async () => {
  process.env.NODE_ENV = 'production';
  const app = await createApp();
  const server = app.listen(0);
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // 1. Empty message rejected
    const emptyRes = await fetch(`${baseUrl}/api/analyze/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ScamShield',
      },
      body: JSON.stringify({ message: '   ' }),
    });
    assert.equal(emptyRes.status, 400);

    // 2. Overlong message rejected
    const longRes = await fetch(`${baseUrl}/api/analyze/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ScamShield',
      },
      body: JSON.stringify({ message: 'a'.repeat(5001) }),
    });
    assert.equal(longRes.status, 400);

    // 3. Missing anti-CSRF header rejected
    const csrfRes = await fetch(`${baseUrl}/api/analyze/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'https://example.com' }),
    });
    assert.equal(csrfRes.status, 403);

    // 4. Valid message saved for Session A (with digit redaction)
    const sessionARes = await fetch(`${baseUrl}/api/analyze/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ScamShield',
      },
      body: JSON.stringify({
        message: 'Urgent: verify KYC for account 123456789012 at http://hdfc-kyc-update.xyz/login',
        channel: 'sms',
        saveToHistory: true,
      }),
    });
    assert.equal(sessionARes.status, 200);
    const cookieA = sessionARes.headers.get('set-cookie')?.split(';')[0] ?? '';
    assert.ok(cookieA.includes('scamshield_sid='));
    const sessionAData = (await sessionARes.json()) as { result: { id: string; classification: string; redactedPreview: string } };
    assert.equal(sessionAData.result.classification, 'CRITICAL');
    assert.ok(!sessionAData.result.redactedPreview.includes('123456789012'));

    // 5. Ephemeral scan (saveToHistory: false) is not stored
    const ephemeralRes = await fetch(`${baseUrl}/api/analyze/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ScamShield',
        Cookie: cookieA,
      },
      body: JSON.stringify({
        url: 'http://192.168.1.10/admin',
        saveToHistory: false,
      }),
    });
    assert.equal(ephemeralRes.status, 200);

    const historyARes = await fetch(`${baseUrl}/api/history`, {
      headers: { Cookie: cookieA },
    });
    const historyAData = (await historyARes.json()) as { items: Array<{ id: string }> };
    assert.equal(historyAData.items.length, 1);

    // 6. Session B cannot see or delete Session A's history
    const historyBRes = await fetch(`${baseUrl}/api/history`);
    const cookieB = historyBRes.headers.get('set-cookie')?.split(';')[0] ?? '';
    const historyBData = (await historyBRes.json()) as { items: Array<{ id: string }> };
    assert.equal(historyBData.items.length, 0);

    const crossDeleteRes = await fetch(`${baseUrl}/api/history/${sessionAData.result.id}`, {
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'ScamShield',
        Cookie: cookieB,
      },
    });
    assert.equal(crossDeleteRes.status, 404);

    // 7. Session A can delete its own history
    const deleteOwnRes = await fetch(`${baseUrl}/api/history/${sessionAData.result.id}`, {
      method: 'DELETE',
      headers: {
        'X-Requested-With': 'ScamShield',
        Cookie: cookieA,
      },
    });
    assert.equal(deleteOwnRes.status, 200);

    // 8. Cookieless Bearer session persists searched URLs in SQLite history (iframe-safe)
    const initHistoryRes = await fetch(`${baseUrl}/api/history`);
    const initData = (await initHistoryRes.json()) as { items: unknown[]; sessionToken: string };
    assert.ok(initData.sessionToken);

    const urlCheckRes = await fetch(`${baseUrl}/api/analyze/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ScamShield',
        Authorization: `Bearer ${initData.sessionToken}`,
      },
      body: JSON.stringify({
        url: 'https://bit.ly/suspicious-link-test',
        saveToHistory: true,
      }),
    });
    assert.equal(urlCheckRes.status, 200);

    const bearerHistoryRes = await fetch(`${baseUrl}/api/history`, {
      headers: {
        Authorization: `Bearer ${initData.sessionToken}`,
      },
    });
    const bearerHistoryData = (await bearerHistoryRes.json()) as {
      items: Array<{ mode: string; redactedPreview: string }>;
    };
    assert.equal(bearerHistoryData.items.length, 1);
    assert.equal(bearerHistoryData.items[0]?.mode, 'url');
    assert.ok(bearerHistoryData.items[0]?.redactedPreview.includes('bit.ly/suspicious-link-test'));
  } finally {
    server.closeAllConnections?.();
    server.close();
  }
});

test('UPI fraud, Digital Arrest scams, and dashboard analytics utilities compute accurate counts', async () => {
  const { computeOverviewStats, computeThreatCategories } = await import(
    '../src/utils/analytics.ts'
  );

  const upiScam = runMessageAnalysis({
    text: 'Congratulations! Scan this QR code to receive Rs. 5,000 UPI cashback reward and enter your UPI PIN immediately.',
    channel: 'whatsapp',
    saveToHistory: false,
  });
  assert.ok(upiScam.score >= 30);

  const digitalArrest = runMessageAnalysis({
    text: 'TRAI & CBI Notice: An arrest warrant has been issued. Stay on video call for digital arrest verification immediately.',
    channel: 'whatsapp',
    saveToHistory: false,
  });
  assert.ok(digitalArrest.score >= 30);

  const fakeItems = [
    {
      id: '1',
      mode: 'message' as const,
      channel: 'whatsapp' as const,
      redactedPreview: upiScam.redactedPreview,
      score: upiScam.score,
      classification: upiScam.classification,
      summary: upiScam.summary,
      indicatorCount: upiScam.indicators.length,
      result: upiScam,
      createdAt: new Date().toISOString(),
    },
    {
      id: '2',
      mode: 'message' as const,
      channel: 'whatsapp' as const,
      redactedPreview: digitalArrest.redactedPreview,
      score: digitalArrest.score,
      classification: digitalArrest.classification,
      summary: digitalArrest.summary,
      indicatorCount: digitalArrest.indicators.length,
      result: digitalArrest,
      createdAt: new Date().toISOString(),
    },
  ];

  const stats = computeOverviewStats(fakeItems);
  assert.equal(stats.totalScans, 2);
  assert.equal(stats.threatDetectionRate, 100);

  const categories = computeThreatCategories(fakeItems);
  const upiCat = categories.find((c) => c.name === 'UPI Fraud');
  const arrestCat = categories.find((c) => c.name === 'Digital Arrest Scams');
  assert.ok((upiCat?.count ?? 0) >= 1);
  assert.ok((arrestCat?.count ?? 0) >= 1);
});

test('Scam Library, Awareness Quiz, and Red Flag Knowledge Centre data integrity and safety', async () => {
  const { SCAM_LIBRARY_EXAMPLES } = await import('../src/data/scamLibrary.ts');
  const { AWARENESS_QUIZ_QUESTIONS, getQuizRankLabel } = await import('../src/data/awarenessQuiz.ts');
  const { RED_FLAG_GUIDE_ITEMS } = await import('../src/data/redFlagGuide.ts');

  // At least 20 examples, unique IDs, all 7 categories covered, safe example domains only
  assert.ok(SCAM_LIBRARY_EXAMPLES.length >= 20);
  const ids = new Set(SCAM_LIBRARY_EXAMPLES.map((e) => e.id));
  assert.equal(ids.size, SCAM_LIBRARY_EXAMPLES.length);

  const expectedCategories = [
    'Banking',
    'UPI',
    'Government',
    'Delivery',
    'Job',
    'Financial',
    'Phishing',
  ];
  for (const cat of expectedCategories) {
    assert.ok(
      SCAM_LIBRARY_EXAMPLES.some((e) => e.category === cat),
      `Missing Scam Library category: ${cat}`,
    );
  }

  for (const example of SCAM_LIBRARY_EXAMPLES) {
    assert.ok(example.redFlags.length >= 2);
    assert.ok(example.protectionAdvice.length >= 2);
    assert.ok(example.sampleMessage.trim().length > 20);
    // Ensure any URLs inside educational samples use reserved example.* TLDs only
    const urls = example.sampleMessage.match(/https?:\/\/[^\s]+/gi) ?? [];
    for (const u of urls) {
      assert.ok(
        /example\.(com|in|org)/i.test(u),
        `Example "${example.id}" contains non-example URL: ${u}`,
      );
    }
    // Verify real detection engine processes each example cleanly without crashing
    const engineResult = runMessageAnalysis({
      text: example.sampleMessage,
      channel: example.channel,
      saveToHistory: false,
    });
    assert.ok(engineResult.score >= 0 && engineResult.score <= 100);
    assert.ok(engineResult.recommendations.length > 0);
  }

  // Quiz: 10 questions mixing genuine & scam, plus rank thresholds
  assert.equal(AWARENESS_QUIZ_QUESTIONS.length, 10);
  assert.ok(AWARENESS_QUIZ_QUESTIONS.some((q) => q.correctAnswer === 'genuine'));
  assert.ok(AWARENESS_QUIZ_QUESTIONS.some((q) => q.correctAnswer === 'scam'));
  assert.equal(getQuizRankLabel(20).rank, 'Beginner');
  assert.equal(getQuizRankLabel(50).rank, 'Learning to Identify Scams');
  assert.equal(getQuizRankLabel(70).rank, 'Scam Aware');
  assert.equal(getQuizRankLabel(90).rank, 'Scam Detective');

  // Red Flag Guide: 8 core indicators
  assert.equal(RED_FLAG_GUIDE_ITEMS.length, 8);
});

test('Awareness progress API persists explored examples and quiz scores per session in SQLite', async () => {
  process.env.NODE_ENV = 'production';
  const app = await createApp();
  const server = app.listen(0);
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    // Initialize Session A
    const initRes = await fetch(`${baseUrl}/api/awareness`);
    assert.equal(initRes.status, 200);
    const initData = (await initRes.json()) as {
      progress: { exploredExampleIds: string[]; quizAttempts: number; bestQuizScore: number | null };
      sessionToken: string;
    };
    assert.equal(initData.progress.exploredExampleIds.length, 0);
    assert.equal(initData.progress.quizAttempts, 0);
    assert.equal(initData.progress.bestQuizScore, null);

    // Record explored example for Session A
    const exRes = await fetch(`${baseUrl}/api/awareness/example`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ScamShield',
        Authorization: `Bearer ${initData.sessionToken}`,
      },
      body: JSON.stringify({ exampleId: 'bank-sbi-kyc', category: 'Banking' }),
    });
    assert.equal(exRes.status, 200);
    const exData = (await exRes.json()) as {
      progress: { exploredExampleIds: string[]; exploredCategories: string[] };
    };
    assert.deepEqual(exData.progress.exploredExampleIds, ['bank-sbi-kyc']);
    assert.deepEqual(exData.progress.exploredCategories, ['Banking']);

    // Record two quiz attempts (80 then 60) -> best stays 80, attempts becomes 2
    const q1Res = await fetch(`${baseUrl}/api/awareness/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ScamShield',
        Authorization: `Bearer ${initData.sessionToken}`,
      },
      body: JSON.stringify({ score: 80 }),
    });
    assert.equal(q1Res.status, 200);

    const q2Res = await fetch(`${baseUrl}/api/awareness/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ScamShield',
        Authorization: `Bearer ${initData.sessionToken}`,
      },
      body: JSON.stringify({ score: 60 }),
    });
    assert.equal(q2Res.status, 200);
    const q2Data = (await q2Res.json()) as {
      progress: { quizAttempts: number; bestQuizScore: number; lastQuizScore: number };
    };
    assert.equal(q2Data.progress.quizAttempts, 2);
    assert.equal(q2Data.progress.bestQuizScore, 80);
    assert.equal(q2Data.progress.lastQuizScore, 60);

    // Reject invalid score
    const badQuizRes = await fetch(`${baseUrl}/api/awareness/quiz`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ScamShield',
        Authorization: `Bearer ${initData.sessionToken}`,
      },
      body: JSON.stringify({ score: 150 }),
    });
    assert.equal(badQuizRes.status, 400);

    // Session B starts completely isolated
    const sessionBRes = await fetch(`${baseUrl}/api/awareness`);
    const sessionBData = (await sessionBRes.json()) as {
      progress: { exploredExampleIds: string[]; quizAttempts: number };
    };
    assert.equal(sessionBData.progress.exploredExampleIds.length, 0);
    assert.equal(sessionBData.progress.quizAttempts, 0);
  } finally {
    server.closeAllConnections?.();
    server.close();
  }
});

test('Cyber Safety Center data integrity, verified official reporting contacts, and library links', async () => {
  const {
    OFFICIAL_REPORTING_RESOURCES,
    EMERGENCY_SCAM_STEPS,
    EVERYDAY_GUIDELINES,
    COMMON_INDIAN_SCAMS,
    SECURITY_CHECKLIST_ITEMS,
    DAILY_SAFETY_TIPS,
    getDailySafetyTipIndex,
  } = await import('../src/data/safetyCenter.ts');
  const { SCAM_LIBRARY_EXAMPLES } = await import('../src/data/scamLibrary.ts');

  // Official Indian resources preserved accurately without fake numbers
  assert.equal(OFFICIAL_REPORTING_RESOURCES.length, 4);
  const byId = new Map(OFFICIAL_REPORTING_RESOURCES.map((r) => [r.id, r]));
  assert.equal(byId.get('helpline-1930')?.primaryContact, '1930');
  assert.equal(byId.get('helpline-1930')?.telHref, 'tel:1930');
  assert.equal(byId.get('portal-cybercrime')?.websiteUrl, 'https://cybercrime.gov.in');
  assert.equal(byId.get('police-112')?.primaryContact, '112');
  assert.equal(byId.get('police-112')?.telHref, 'tel:112');
  assert.equal(byId.get('cert-in')?.websiteUrl, 'https://www.cert-in.org.in');
  assert.equal(byId.get('cert-in')?.email, 'incident@cert-in.org.in');
  assert.equal(byId.get('cert-in')?.tollFreeNumber, '1800-11-4949');

  // 9 emergency steps, 7 everyday guideline categories, 12 common scams, 8 checklist items
  assert.equal(EMERGENCY_SCAM_STEPS.length, 9);
  assert.equal(EVERYDAY_GUIDELINES.length, 7);
  for (const guide of EVERYDAY_GUIDELINES) {
    assert.ok(guide.dos.length >= 2);
    assert.ok(guide.donts.length >= 2);
  }

  assert.equal(COMMON_INDIAN_SCAMS.length, 12);
  const libraryIds = new Set(SCAM_LIBRARY_EXAMPLES.map((ex) => ex.id));
  for (const scam of COMMON_INDIAN_SCAMS) {
    if (scam.libraryExampleId) {
      assert.ok(
        libraryIds.has(scam.libraryExampleId),
        `Common scam "${scam.id}" references missing Scam Library example "${scam.libraryExampleId}"`,
      );
    }
  }

  assert.equal(SECURITY_CHECKLIST_ITEMS.length, 8);
  assert.ok(DAILY_SAFETY_TIPS.length >= 5);

  const dayTipIdx = getDailySafetyTipIndex(new Date('2026-11-21T10:00:00Z'));
  assert.ok(dayTipIdx >= 0 && dayTipIdx < DAILY_SAFETY_TIPS.length);
  assert.equal(dayTipIdx, getDailySafetyTipIndex(new Date('2026-11-21T23:59:59Z')));
});

test('Theme utilities expose consistent storage key and valid theme options', async () => {
  const { THEME_STORAGE_KEY, getSavedThemePreference, getInitialTheme } = await import(
    '../src/utils/theme.ts'
  );
  assert.equal(THEME_STORAGE_KEY, 'scamshield_theme');
  // In Node (no window), fallback safely to null / 'light'
  assert.equal(getSavedThemePreference(), null);
  assert.equal(getInitialTheme(), 'light');
});

test('All 20 Scam Library examples, modern Indian threats, X-Ray highlights, and URL anatomy score accurately', async () => {
  const { SCAM_LIBRARY_EXAMPLES } = await import('../src/data/scamLibrary.ts');

  // 1. Zero false negatives across all 20 Scam Library examples
  for (const ex of SCAM_LIBRARY_EXAMPLES) {
    const res = runMessageAnalysis({
      text: ex.sampleMessage,
      channel: ex.channel,
      saveToHistory: false,
    });
    assert.ok(
      res.score >= 30 && res.classification !== 'LOW',
      `Library example "${ex.id}" (${ex.riskLevel}) should not be LOW risk, got ${res.classification} (${res.score})`,
    );
    assert.ok(
      (res.highlightedSegments?.filter((s) => Boolean(s.category)).length ?? 0) >= 1,
      `Library example "${ex.id}" should highlight at least 1 suspicious snippet`,
    );
  }

  // Specific former blind spots now caught accurately
  const regFee = SCAM_LIBRARY_EXAMPLES.find((e) => e.id === 'job-registration-fee')!;
  const regRes = runMessageAnalysis({ text: regFee.sampleMessage, channel: 'email' });
  assert.ok(regRes.score >= 60, `job-registration-fee should score >= 60, got ${regRes.score}`);

  const wfhTask = SCAM_LIBRARY_EXAMPLES.find((e) => e.id === 'job-wfh-task')!;
  const wfhRes = runMessageAnalysis({ text: wfhTask.sampleMessage, channel: 'whatsapp' });
  assert.ok(wfhRes.score >= 60, `job-wfh-task should score >= 60, got ${wfhRes.score}`);

  // 2. Modern threats: electricity disconnection, SIM block, AnyDesk remote access, .apk, zero-width
  const elecScam = runMessageAnalysis({
    text: 'Dear consumer, your electricity power will be disconnected tonight at 9.30 PM from electricity office because previous month bill was not updated. Immediately call 9800012345.',
    channel: 'sms',
  });
  assert.ok(elecScam.score >= 30, `Electricity scam scored ${elecScam.score}`);
  assert.ok(elecScam.indicators.some((i) => i.id === 'utility-sim-threat'));
  // Ensure 10-digit phone number is redacted inside highlightedSegments
  const elecJoined = (elecScam.highlightedSegments ?? []).map((s) => s.text).join('');
  assert.ok(!elecJoined.includes('9800012345'), 'Long digits in X-Ray segments must be redacted');

  const simScam = runMessageAnalysis({
    text: 'Urgent: Your Airtel eSIM will be blocked within 24 hours. Complete verification at http://airtel-esim-kyc.example.com',
    channel: 'sms',
  });
  assert.ok(simScam.score >= 60);
  assert.ok(simScam.verifiedBrandHints?.some((h) => h.brand === 'Airtel'));

  const anydeskScam = runMessageAnalysis({
    text: 'To process your pending refund, download AnyDesk QuickSupport and share the 9-digit access code immediately.',
    channel: 'whatsapp',
  });
  assert.ok(anydeskScam.score >= 60);
  assert.ok(anydeskScam.indicators.some((i) => i.id === 'remote-access-trap'));

  const apkUrl = runUrlAnalysis({ url: 'https://traffic-challan-pay.xyz/Echallan-v2.apk' });
  assert.ok(apkUrl.urls[0]?.flags.some((f) => f.code === 'DANGEROUS_DOWNLOAD'));
  assert.ok(apkUrl.score >= 45);

  const zeroWidthScam = runMessageAnalysis({
    text: 'Urgent: Verify your SBI K\u200BYC immediately at http://sbi-kyc.example.com',
    channel: 'sms',
  });
  assert.ok(zeroWidthScam.indicators.some((i) => i.id === 'zero-width-obfuscation'));
  assert.ok(zeroWidthScam.verifiedBrandHints?.some((h) => h.officialDomains.includes('sbi.co.in')));

  // 3. URL Root-Domain Anatomy fields
  const anatomyUrl = runUrlAnalysis({
    url: 'https://secure.login.account.verify.example-portal.top/update',
  });
  assert.equal(anatomyUrl.urls[0]?.registrableDomain, 'example-portal.top');
  assert.equal(anatomyUrl.urls[0]?.subdomainPart, 'secure.login.account.verify');
});

test('Security hardening: headers, malformed JSON, strict CSRF, rate limit (429), extended PII masking, and SMS/WhatsApp guidance', async () => {
  const { maskSensitiveDigits } = await import('../server/detection/engine.ts');
  const { getRiskBadgeClasses, getRiskLabel } = await import('../src/utils/riskStyles.ts');

  // 1. Extended PII redaction (16-digit card, 12-digit Aadhaar, PAN, +91 phone) without touching official helpline
  const masked = maskSensitiveDigits(
    'Card 4532-1122-3344-5566, Aadhaar 1234 5678 9012, PAN ABCDE1234F, Phone +91-98000-00101, Helpline 1800-202-6161',
  );
  assert.ok(!masked.includes('1122-3344'), 'Card middle digits must be masked');
  assert.ok(!masked.includes('5678'), 'Aadhaar middle digits must be masked');
  assert.ok(!masked.includes('ABCDE1234F'), 'PAN must be masked');
  assert.ok(!masked.includes('00101'), 'Phone trailing/middle digits must be masked');
  assert.ok(masked.includes('1800-202-6161'), 'Official helpline format should stay legible');

  // 2. Channel-specific SMS DLT & WhatsApp context guidance
  const smsRes = runMessageAnalysis({
    text: 'Your HDFC Bank KYC is pending.',
    channel: 'sms',
  });
  assert.ok(smsRes.contextNotes.some((n) => n.includes('DLT')));

  const waRes = runMessageAnalysis({
    text: 'Urgent RBI notice on WhatsApp.',
    channel: 'whatsapp',
  });
  assert.ok(waRes.contextNotes.some((n) => n.includes('WhatsApp Channel Tip')));

  // 3. Shared UI risk style helpers
  for (const level of ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const) {
    assert.ok(getRiskBadgeClasses(level).length > 10);
    assert.ok(getRiskLabel(level).length > 0);
  }

  // 4. Express server security headers, JSON error handling, CSRF, 404, and 429 rate limiting
  process.env.NODE_ENV = 'production';
  const app = await createApp({ maxMutationsPerMinute: 2 });
  const server = app.listen(0);
  const address = server.address();
  assert.ok(address && typeof address === 'object');
  const baseUrl = `http://127.0.0.1:${address.port}`;

  try {
    const healthRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(healthRes.status, 200);
    assert.equal(healthRes.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(healthRes.headers.get('referrer-policy'), 'no-referrer');
    assert.ok(healthRes.headers.get('permissions-policy')?.includes('camera=()'));
    assert.equal(healthRes.headers.get('x-powered-by'), null);

    // Unknown /api/* returns JSON 404
    const notFoundApi = await fetch(`${baseUrl}/api/nonexistent`);
    assert.equal(notFoundApi.status, 404);
    const nfJson = (await notFoundApi.json()) as { error: string };
    assert.ok(nfJson.error);

    // Malformed JSON returns JSON 400
    const badJsonRes = await fetch(`${baseUrl}/api/analyze/message`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ScamShield',
      },
      body: '{"message": broken',
    });
    assert.equal(badJsonRes.status, 400);
    const badJsonBody = (await badJsonRes.json()) as { error: string };
    assert.ok(badJsonBody.error.toLowerCase().includes('json'));

    // Cross-origin Origin header rejected even with X-Requested-With
    const crossOriginRes = await fetch(`${baseUrl}/api/analyze/url`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'ScamShield',
        Origin: 'https://evil-phishing.example',
      },
      body: JSON.stringify({ url: 'https://example.com' }),
    });
    assert.equal(crossOriginRes.status, 403);

    // Rate limit allows 2 mutating calls and returns 429 on 3rd
    const ok1 = await fetch(`${baseUrl}/api/analyze/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'ScamShield' },
      body: JSON.stringify({ url: 'https://example.com', saveToHistory: false }),
    });
    assert.equal(ok1.status, 200);

    const ok2 = await fetch(`${baseUrl}/api/analyze/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'ScamShield' },
      body: JSON.stringify({ url: 'https://example.org', saveToHistory: false }),
    });
    assert.equal(ok2.status, 200);

    const limited = await fetch(`${baseUrl}/api/analyze/url`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'ScamShield' },
      body: JSON.stringify({ url: 'https://example.net', saveToHistory: false }),
    });
    assert.equal(limited.status, 429);
    assert.ok(Number(limited.headers.get('retry-after')) >= 1);
  } finally {
    server.closeAllConnections?.();
    server.close();
  }
});

