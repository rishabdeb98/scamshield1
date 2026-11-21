import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import express, { type NextFunction, type Request, type Response } from 'express';
import {
  clearSessionHistory,
  deleteHistoryEntry,
  getAwarenessProgress,
  listHistoryForSession,
  recordExampleExplored,
  recordQuizAttempt,
  saveHistoryRecord,
} from './server/db.ts';
import { runMessageAnalysis, runUrlAnalysis } from './server/detection/engine.ts';
import { DEMO_SAMPLES } from './server/detection/samples.ts';
import type { MessageChannel, ScamLibraryCategory } from './src/types/scamshield.ts';

dotenv.config();

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';
const SESSION_COOKIE_NAME = 'scamshield_sid';
const SESSION_SECRET =
  process.env.SESSION_SECRET && process.env.SESSION_SECRET.length >= 16
    ? process.env.SESSION_SECRET
    : crypto.randomBytes(32).toString('hex');

const VALID_CHANNELS = new Set<MessageChannel>(['auto', 'sms', 'whatsapp', 'email', 'social']);
const VALID_LIBRARY_CATEGORIES = new Set<ScamLibraryCategory>([
  'Banking',
  'UPI',
  'Government',
  'Delivery',
  'Job',
  'Financial',
  'Phishing',
]);
const MAX_MESSAGE_LENGTH = 5000;
const MAX_URL_LENGTH = 2048;

export interface CreateAppOptions {
  maxMutationsPerMinute?: number;
}

function signSessionId(sid: string): string {
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(sid).digest('base64url');
  return `${sid}.${sig}`;
}

function verifySignedSessionId(cookieValue: string | undefined): string | null {
  if (!cookieValue) return null;
  const dotIdx = cookieValue.indexOf('.');
  if (dotIdx <= 0) return null;
  const sid = cookieValue.slice(0, dotIdx);
  const sig = cookieValue.slice(dotIdx + 1);
  if (!/^[a-f0-9]{32}$/.test(sid) || !sig) return null;

  const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(sid).digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expectedBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return null;
  return sid;
}

function parseCookies(cookieHeader: string | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  if (!cookieHeader) return result;
  for (const part of cookieHeader.split(';')) {
    const eqIdx = part.indexOf('=');
    if (eqIdx > 0) {
      const key = part.slice(0, eqIdx).trim();
      const val = part.slice(eqIdx + 1).trim();
      if (key) {
        try {
          result[key] = decodeURIComponent(val);
        } catch {
          result[key] = val;
        }
      }
    }
  }
  return result;
}

function extractBearerToken(authHeader: string | undefined): string | undefined {
  if (!authHeader) return undefined;
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  return match ? match[1].trim() : undefined;
}

function isHttpsRequest(req: Request): boolean {
  if (req.secure) return true;
  const forwardedProto = String(req.headers['x-forwarded-proto'] || '').toLowerCase();
  if (forwardedProto.includes('https')) return true;
  const origin = String(req.headers.origin || '').toLowerCase();
  if (origin.startsWith('https://')) return true;
  const referer = String(req.headers.referer || '').toLowerCase();
  if (referer.startsWith('https://')) return true;
  return process.env.FORCE_SECURE_COOKIE === 'true';
}

function ensureSession(req: Request, res: Response): { sessionId: string; sessionToken: string } {
  const bearerToken = extractBearerToken(req.headers.authorization);
  const bearerSid = verifySignedSessionId(bearerToken);
  if (bearerSid && bearerToken) {
    return { sessionId: bearerSid, sessionToken: bearerToken };
  }

  const cookies = parseCookies(req.headers.cookie);
  const cookieVal = cookies[SESSION_COOKIE_NAME];
  const existingSid = verifySignedSessionId(cookieVal);
  if (existingSid && cookieVal) {
    return { sessionId: existingSid, sessionToken: cookieVal };
  }

  const newSid = crypto.randomBytes(16).toString('hex');
  const signed = signSessionId(newSid);
  const isHttps = isHttpsRequest(req);

  const cookieParts = [
    `${SESSION_COOKIE_NAME}=${encodeURIComponent(signed)}`,
    'Path=/',
    'HttpOnly',
    `Max-Age=${60 * 60 * 24 * 14}`,
  ];
  if (isHttps) {
    cookieParts.push('Secure', 'SameSite=None', 'Partitioned');
  } else {
    cookieParts.push('SameSite=Lax');
  }

  res.setHeader('Set-Cookie', cookieParts.join('; '));
  return { sessionId: newSid, sessionToken: signed };
}

function verifyCsrfAndOrigin(req: Request, res: Response, next: NextFunction): void {
  const xRequestedWith = req.headers['x-requested-with'];
  const origin = req.headers.origin;
  const host = (req.headers['x-forwarded-host'] || req.headers.host || '') as string;

  if (origin && host) {
    try {
      const originHost = new URL(origin).host;
      if (originHost !== host) {
        res.status(403).json({ error: 'Cross-origin request rejected.' });
        return;
      }
    } catch {
      res.status(403).json({ error: 'Invalid Origin header.' });
      return;
    }
  }

  if (xRequestedWith !== 'ScamShield') {
    res.status(403).json({ error: 'Missing required anti-CSRF request header.' });
    return;
  }

  next();
}

function createSlidingRateLimiter(maxPerMinute: number) {
  const windowMs = 60_000;
  const hits = new Map<string, number[]>();

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const bearerSid = verifySignedSessionId(extractBearerToken(req.headers.authorization));
    const key = bearerSid || req.ip || 'unknown';

    if (hits.size > 5000) {
      for (const [entryKey, timestamps] of hits.entries()) {
        if (timestamps.length === 0 || now - timestamps[timestamps.length - 1] > windowMs) {
          hits.delete(entryKey);
        }
      }
    }

    const recent = (hits.get(key) ?? []).filter((ts) => now - ts < windowMs);
    if (recent.length >= maxPerMinute) {
      const oldest = recent[0] ?? now;
      const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
      res.setHeader('Retry-After', String(retryAfterSec));
      res.status(429).json({
        error: 'Rate limit exceeded. Please wait a moment before running more scans.',
      });
      return;
    }

    recent.push(now);
    hits.set(key, recent);
    next();
  };
}

export async function createApp(options: CreateAppOptions = {}) {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1);

  const maxMutations = options.maxMutationsPerMinute ?? 60;
  const rateLimitMutations = createSlidingRateLimiter(maxMutations);

  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'no-referrer');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    res.setHeader('X-Permitted-Cross-Domain-Policies', 'none');
    next();
  });

  app.use(express.json({ limit: '32kb' }));

  app.use((err: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (err instanceof SyntaxError && 'status' in err) {
      res.status(400).json({ error: 'Invalid JSON request body.' });
      return;
    }
    next(err);
  });

  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.get('/api/samples', (_req, res) => {
    res.json({ samples: DEMO_SAMPLES });
  });

  app.post('/api/analyze/message', verifyCsrfAndOrigin, rateLimitMutations, (req, res) => {
    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body.message !== 'string') {
      res.status(400).json({ error: 'Please provide a valid text message to analyse.' });
      return;
    }

    const trimmed = body.message.trim();
    if (!trimmed) {
      res.status(400).json({ error: 'Message cannot be empty.' });
      return;
    }

    if (trimmed.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({
        error: `Message exceeds the maximum allowed length of ${MAX_MESSAGE_LENGTH} characters.`,
      });
      return;
    }

    const rawChannel = typeof body.channel === 'string' ? body.channel : 'auto';
    const channel: MessageChannel = VALID_CHANNELS.has(rawChannel as MessageChannel)
      ? (rawChannel as MessageChannel)
      : 'auto';

    const saveToHistory = body.saveToHistory !== false;
    const { sessionId, sessionToken } = ensureSession(req, res);
    const result = runMessageAnalysis({ text: trimmed, channel, saveToHistory });

    if (saveToHistory) {
      const id = saveHistoryRecord(sessionId, result);
      result.id = id;
    }

    res.json({ result, sessionToken });
  });

  app.post('/api/analyze/url', verifyCsrfAndOrigin, rateLimitMutations, (req, res) => {
    const body = req.body as Record<string, unknown> | undefined;
    if (!body || typeof body.url !== 'string') {
      res.status(400).json({ error: 'Please provide a URL string to check.' });
      return;
    }

    const trimmed = body.url.trim();
    if (!trimmed) {
      res.status(400).json({ error: 'URL input cannot be empty.' });
      return;
    }

    if (trimmed.length > MAX_URL_LENGTH) {
      res.status(400).json({
        error: `URL exceeds the maximum allowed length of ${MAX_URL_LENGTH} characters.`,
      });
      return;
    }

    const saveToHistory = body.saveToHistory !== false;
    const { sessionId, sessionToken } = ensureSession(req, res);
    const result = runUrlAnalysis({ url: trimmed, saveToHistory });

    if (saveToHistory) {
      const id = saveHistoryRecord(sessionId, result);
      result.id = id;
    }

    res.json({ result, sessionToken });
  });

  app.get('/api/history', (req, res) => {
    const { sessionId, sessionToken } = ensureSession(req, res);
    const items = listHistoryForSession(sessionId);
    res.json({ items, sessionToken });
  });

  app.delete('/api/history/:id', verifyCsrfAndOrigin, rateLimitMutations, (req, res) => {
    const { sessionId, sessionToken } = ensureSession(req, res);
    const entryId = req.params.id;
    if (!entryId || entryId.length > 64 || !/^[a-z0-9-]+$/i.test(entryId)) {
      res.status(400).json({ error: 'Invalid history entry ID.' });
      return;
    }

    const deleted = deleteHistoryEntry(sessionId, entryId);
    if (!deleted) {
      res.status(404).json({ error: 'History item not found for your session.' });
      return;
    }
    res.json({ deleted: true, sessionToken });
  });

  app.delete('/api/history', verifyCsrfAndOrigin, rateLimitMutations, (req, res) => {
    const { sessionId, sessionToken } = ensureSession(req, res);
    const deletedCount = clearSessionHistory(sessionId);
    res.json({ cleared: true, deletedCount, sessionToken });
  });

  app.get('/api/awareness', (req, res) => {
    const { sessionId, sessionToken } = ensureSession(req, res);
    const progress = getAwarenessProgress(sessionId);
    res.json({ progress, sessionToken });
  });

  app.post('/api/awareness/example', verifyCsrfAndOrigin, rateLimitMutations, (req, res) => {
    const body = req.body as Record<string, unknown> | undefined;
    const exampleId = typeof body?.exampleId === 'string' ? body.exampleId.trim() : '';
    const category = typeof body?.category === 'string' ? body.category.trim() : '';

    if (!exampleId || exampleId.length > 64 || !/^[a-z0-9-]+$/i.test(exampleId)) {
      res.status(400).json({ error: 'Invalid scam library example ID.' });
      return;
    }
    if (!VALID_LIBRARY_CATEGORIES.has(category as ScamLibraryCategory)) {
      res.status(400).json({ error: 'Invalid scam library category.' });
      return;
    }

    const { sessionId, sessionToken } = ensureSession(req, res);
    const progress = recordExampleExplored(
      sessionId,
      exampleId,
      category as ScamLibraryCategory,
    );
    res.json({ progress, sessionToken });
  });

  app.post('/api/awareness/quiz', verifyCsrfAndOrigin, rateLimitMutations, (req, res) => {
    const body = req.body as Record<string, unknown> | undefined;
    const score = typeof body?.score === 'number' ? body.score : Number.NaN;
    if (!Number.isFinite(score) || score < 0 || score > 100) {
      res.status(400).json({ error: 'Quiz score must be a number between 0 and 100.' });
      return;
    }

    const { sessionId, sessionToken } = ensureSession(req, res);
    const progress = recordQuizAttempt(sessionId, score);
    res.json({ progress, sessionToken });
  });

  app.use('/api/*', (_req, res) => {
    res.status(404).json({ error: 'API endpoint not found.' });
  });

  if (!IS_PROD) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Application build not found.');
      }
    });
  }

  return app;
}

const isMainModule =
  typeof process !== 'undefined' &&
  process.argv[1] &&
  path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname);

if (isMainModule) {
  createApp().then((app) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`ScamShield server running on http://0.0.0.0:${PORT}`);
    });
  });
}
