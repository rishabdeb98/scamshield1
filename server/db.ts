import crypto from 'node:crypto';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import type {
  AnalysisMode,
  AnalysisResult,
  AwarenessProgress,
  HistoryItem,
  MessageChannel,
  RiskLevel,
  ScamLibraryCategory,
} from '../src/types/scamshield.ts';

const DB_PATH = path.resolve(process.cwd(), 'scamshield.db');
const MAX_HISTORY_PER_SESSION = 250;

const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA foreign_keys = ON;');
db.exec('PRAGMA busy_timeout = 3000;');

const existingSchema = db
  .prepare("SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'analysis_history'")
  .get() as { sql?: string } | undefined;

if (!existingSchema) {
  db.exec(`
    CREATE TABLE analysis_history (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      mode TEXT NOT NULL CHECK (mode IN ('message', 'url')),
      channel TEXT NOT NULL,
      redacted_preview TEXT NOT NULL,
      score INTEGER NOT NULL,
      classification TEXT NOT NULL CHECK (classification IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      summary TEXT NOT NULL,
      indicator_count INTEGER NOT NULL,
      result_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE INDEX idx_history_session_created
      ON analysis_history (session_id, created_at DESC);
  `);
} else if (existingSchema.sql && !existingSchema.sql.includes("'CRITICAL'")) {
  db.exec(`
    BEGIN TRANSACTION;
    CREATE TABLE analysis_history_new (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      mode TEXT NOT NULL CHECK (mode IN ('message', 'url')),
      channel TEXT NOT NULL,
      redacted_preview TEXT NOT NULL,
      score INTEGER NOT NULL,
      classification TEXT NOT NULL CHECK (classification IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
      summary TEXT NOT NULL,
      indicator_count INTEGER NOT NULL,
      result_json TEXT NOT NULL,
      created_at TEXT NOT NULL
    );
    INSERT INTO analysis_history_new
      SELECT id, session_id, mode, channel, redacted_preview, score, classification, summary, indicator_count, result_json, created_at
      FROM analysis_history;
    DROP TABLE analysis_history;
    ALTER TABLE analysis_history_new RENAME TO analysis_history;
    CREATE INDEX IF NOT EXISTS idx_history_session_created
      ON analysis_history (session_id, created_at DESC);
    COMMIT;
  `);
}

db.exec(`
  CREATE TABLE IF NOT EXISTS awareness_activity (
    session_id TEXT PRIMARY KEY,
    explored_examples_json TEXT NOT NULL,
    explored_categories_json TEXT NOT NULL,
    quiz_attempts INTEGER NOT NULL DEFAULT 0,
    best_quiz_score INTEGER,
    last_quiz_score INTEGER,
    updated_at TEXT NOT NULL
  );
`);

function safeJsonParse<T>(raw: string, fallback: T): T {
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function runInTransaction<T>(fn: () => T): T {
  db.exec('BEGIN IMMEDIATE;');
  try {
    const outcome = fn();
    db.exec('COMMIT;');
    return outcome;
  } catch (err) {
    db.exec('ROLLBACK;');
    throw err;
  }
}

const insertStmt = db.prepare(`
  INSERT INTO analysis_history (
    id, session_id, mode, channel, redacted_preview, score,
    classification, summary, indicator_count, result_json, created_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const pruneSessionStmt = db.prepare(`
  DELETE FROM analysis_history
  WHERE session_id = ?
    AND id NOT IN (
      SELECT id FROM analysis_history
      WHERE session_id = ?
      ORDER BY created_at DESC
      LIMIT ?
    )
`);

const listBySessionStmt = db.prepare(`
  SELECT
    id, mode, channel, redacted_preview, score, classification,
    summary, indicator_count, result_json, created_at
  FROM analysis_history
  WHERE session_id = ?
  ORDER BY created_at DESC
  LIMIT ?
`);

const deleteOneStmt = db.prepare(`
  DELETE FROM analysis_history
  WHERE id = ? AND session_id = ?
`);

const deleteAllStmt = db.prepare(`
  DELETE FROM analysis_history
  WHERE session_id = ?
`);

interface HistoryRow {
  id: string;
  mode: AnalysisMode;
  channel: MessageChannel;
  redacted_preview: string;
  score: number;
  classification: RiskLevel;
  summary: string;
  indicator_count: number;
  result_json: string;
  created_at: string;
}

export function saveHistoryRecord(sessionId: string, result: AnalysisResult): string {
  const id = crypto.randomUUID();
  const storedResult: AnalysisResult = {
    ...result,
    id,
    savedToHistory: true,
  };

  return runInTransaction(() => {
    insertStmt.run(
      id,
      sessionId,
      result.mode,
      result.channel ?? 'auto',
      result.redactedPreview,
      result.score,
      result.classification,
      result.summary,
      result.indicators.length,
      JSON.stringify(storedResult),
      result.analyzedAt,
    );
    pruneSessionStmt.run(sessionId, sessionId, MAX_HISTORY_PER_SESSION);
    return id;
  });
}

export function listHistoryForSession(sessionId: string): HistoryItem[] {
  const rows = listBySessionStmt.all(sessionId, MAX_HISTORY_PER_SESSION) as unknown as HistoryRow[];
  return rows.map((row) => {
    const fallbackResult: AnalysisResult = {
      id: row.id,
      mode: row.mode,
      channel: row.channel,
      score: row.score,
      classification: row.classification,
      summary: row.summary,
      indicators: [],
      urls: [],
      recommendations: [],
      contextNotes: [],
      analyzedAt: row.created_at,
      characterCount: 0,
      savedToHistory: true,
      redactedPreview: row.redacted_preview,
    };
    return {
      id: row.id,
      mode: row.mode,
      channel: row.channel,
      redactedPreview: row.redacted_preview,
      score: row.score,
      classification: row.classification,
      summary: row.summary,
      indicatorCount: row.indicator_count,
      result: safeJsonParse<AnalysisResult>(row.result_json, fallbackResult),
      createdAt: row.created_at,
    };
  });
}

export function deleteHistoryEntry(sessionId: string, entryId: string): boolean {
  const info = deleteOneStmt.run(entryId, sessionId);
  return info.changes > 0;
}

export function clearSessionHistory(sessionId: string): number {
  const info = deleteAllStmt.run(sessionId);
  return Number(info.changes);
}

const getAwarenessStmt = db.prepare(`
  SELECT
    explored_examples_json,
    explored_categories_json,
    quiz_attempts,
    best_quiz_score,
    last_quiz_score
  FROM awareness_activity
  WHERE session_id = ?
`);

const upsertAwarenessStmt = db.prepare(`
  INSERT INTO awareness_activity (
    session_id,
    explored_examples_json,
    explored_categories_json,
    quiz_attempts,
    best_quiz_score,
    last_quiz_score,
    updated_at
  ) VALUES (?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(session_id) DO UPDATE SET
    explored_examples_json = excluded.explored_examples_json,
    explored_categories_json = excluded.explored_categories_json,
    quiz_attempts = excluded.quiz_attempts,
    best_quiz_score = excluded.best_quiz_score,
    last_quiz_score = excluded.last_quiz_score,
    updated_at = excluded.updated_at
`);

interface AwarenessRow {
  explored_examples_json: string;
  explored_categories_json: string;
  quiz_attempts: number;
  best_quiz_score: number | null;
  last_quiz_score: number | null;
}

export function getAwarenessProgress(sessionId: string): AwarenessProgress {
  const row = getAwarenessStmt.get(sessionId) as unknown as AwarenessRow | undefined;
  if (!row) {
    return {
      exploredExampleIds: [],
      exploredCategories: [],
      quizAttempts: 0,
      bestQuizScore: null,
      lastQuizScore: null,
    };
  }
  return {
    exploredExampleIds: safeJsonParse<string[]>(row.explored_examples_json, []),
    exploredCategories: safeJsonParse<ScamLibraryCategory[]>(row.explored_categories_json, []),
    quizAttempts: row.quiz_attempts,
    bestQuizScore: row.best_quiz_score,
    lastQuizScore: row.last_quiz_score,
  };
}

export function recordExampleExplored(
  sessionId: string,
  exampleId: string,
  category: ScamLibraryCategory,
): AwarenessProgress {
  return runInTransaction(() => {
    const current = getAwarenessProgress(sessionId);
    const exampleSet = new Set(current.exploredExampleIds);
    exampleSet.add(exampleId);

    const categorySet = new Set(current.exploredCategories);
    categorySet.add(category);

    const updated: AwarenessProgress = {
      ...current,
      exploredExampleIds: Array.from(exampleSet),
      exploredCategories: Array.from(categorySet),
    };

    upsertAwarenessStmt.run(
      sessionId,
      JSON.stringify(updated.exploredExampleIds),
      JSON.stringify(updated.exploredCategories),
      updated.quizAttempts,
      updated.bestQuizScore,
      updated.lastQuizScore,
      new Date().toISOString(),
    );

    return updated;
  });
}

export function recordQuizAttempt(sessionId: string, score: number): AwarenessProgress {
  return runInTransaction(() => {
    const current = getAwarenessProgress(sessionId);
    const boundedScore = Math.max(0, Math.min(100, Math.round(score)));
    const bestQuizScore =
      current.bestQuizScore === null ? boundedScore : Math.max(current.bestQuizScore, boundedScore);

    const updated: AwarenessProgress = {
      ...current,
      quizAttempts: current.quizAttempts + 1,
      bestQuizScore,
      lastQuizScore: boundedScore,
    };

    upsertAwarenessStmt.run(
      sessionId,
      JSON.stringify(updated.exploredExampleIds),
      JSON.stringify(updated.exploredCategories),
      updated.quizAttempts,
      updated.bestQuizScore,
      updated.lastQuizScore,
      new Date().toISOString(),
    );

    return updated;
  });
}
