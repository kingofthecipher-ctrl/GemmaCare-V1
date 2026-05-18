/**
 * SQLite database adapter for GemmaCare.
 * 
 * Automatically creates gemmacare.db in the project root on first run.
 * No configuration needed — just works with zero setup.
 * 
 * Used when DATABASE_URL is not set (local dev / demo / Kaggle notebook).
 * Production deployments use the MySQL adapter in db.ts.
 */

import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { eq, desc } from "drizzle-orm";
import { join } from "path";
import {
  users, triageRecords, sessionHistory,
  type User, type InsertUser,
  type TriageRecord, type InsertTriageRecord,
  type SessionHistory, type InsertSessionHistory,
} from "../drizzle/schema.sqlite";

const DB_PATH = join(process.cwd(), "gemmacare.db");

let _sqlite: Database.Database | null = null;
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (_db) return _db;

  console.log(`[SQLite] Creating local database at ${DB_PATH}`);
  _sqlite = new Database(DB_PATH);

  // Enable WAL mode for better concurrent read performance
  _sqlite.pragma("journal_mode = WAL");
  _sqlite.pragma("foreign_keys = ON");

  _db = drizzle(_sqlite, { schema: { users, triageRecords, sessionHistory } });

  // Auto-create tables on first run
  _sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id           INTEGER PRIMARY KEY AUTOINCREMENT,
      openId       TEXT NOT NULL UNIQUE,
      name         TEXT,
      email        TEXT,
      loginMethod  TEXT,
      role         TEXT NOT NULL DEFAULT 'user',
      createdAt    TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt    TEXT NOT NULL DEFAULT (datetime('now')),
      lastSignedIn TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS triageRecords (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      userId              INTEGER NOT NULL,
      chiefComplaint      TEXT NOT NULL,
      symptomList         TEXT NOT NULL,
      urgencyLevel        INTEGER NOT NULL,
      medicationFound     TEXT,
      recommendedAction   TEXT NOT NULL,
      patientLanguage     TEXT NOT NULL,
      exportLanguage      TEXT NOT NULL DEFAULT 'en',
      confidence          INTEGER NOT NULL,
      audioTranscript     TEXT,
      audioMedication     TEXT,
      imageMedication     TEXT,
      audioImageMatch     INTEGER NOT NULL DEFAULT 1,
      verificationWarning TEXT,
      patientInstructions TEXT,
      audioFileKey        TEXT,
      imageFileKey        TEXT,
      createdAt           TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt           TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS sessionHistory (
      id               INTEGER PRIMARY KEY AUTOINCREMENT,
      userId           INTEGER NOT NULL,
      triageRecordId   INTEGER NOT NULL,
      sessionStartedAt TEXT NOT NULL DEFAULT (datetime('now')),
      sessionEndedAt   TEXT,
      detectedLanguage TEXT NOT NULL,
      urgencyLevel     INTEGER NOT NULL,
      chiefComplaint   TEXT NOT NULL,
      createdAt        TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  console.log("[SQLite] ✅ Database ready");
  return _db;
}

// ── User operations ──────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required");
  const db = getDb();
  
  // SQLite upsert
  _sqlite!.prepare(`
    INSERT INTO users (openId, name, email, loginMethod, role, lastSignedIn)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(openId) DO UPDATE SET
      name         = excluded.name,
      email        = excluded.email,
      loginMethod  = excluded.loginMethod,
      role         = excluded.role,
      lastSignedIn = datetime('now'),
      updatedAt    = datetime('now')
  `).run(
    user.openId,
    user.name ?? null,
    user.email ?? null,
    user.loginMethod ?? null,
    user.role ?? "user",
  );
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  const db = getDb();
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

// ── Triage record operations ──────────────────────────────────────────────────

export async function createTriageRecord(
  userId: number,
  data: Omit<InsertTriageRecord, "userId">,
): Promise<TriageRecord> {
  const db = getDb();
  const result = await db.insert(triageRecords).values({ userId, ...data }).returning();
  return result[0];
}

export async function getTriageRecordById(id: number): Promise<TriageRecord | undefined> {
  const db = getDb();
  const result = await db.select().from(triageRecords).where(eq(triageRecords.id, id)).limit(1);
  return result[0];
}

export async function getUserTriageRecords(userId: number, limit = 50): Promise<TriageRecord[]> {
  const db = getDb();
  return await db
    .select()
    .from(triageRecords)
    .where(eq(triageRecords.userId, userId))
    .orderBy(desc(triageRecords.createdAt))
    .limit(limit);
}

// ── Session history operations ─────────────────────────────────────────────

export async function createSessionHistory(
  userId: number,
  triageRecordId: number,
  data: Omit<InsertSessionHistory, "userId" | "triageRecordId">,
): Promise<SessionHistory> {
  const db = getDb();
  const result = await db
    .insert(sessionHistory)
    .values({ userId, triageRecordId, ...data })
    .returning();
  return result[0];
}

export async function getUserSessionHistory(userId: number, limit = 100): Promise<SessionHistory[]> {
  const db = getDb();
  return await db
    .select()
    .from(sessionHistory)
    .where(eq(sessionHistory.userId, userId))
    .orderBy(desc(sessionHistory.createdAt))
    .limit(limit);
}
