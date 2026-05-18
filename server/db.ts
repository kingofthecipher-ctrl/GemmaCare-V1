/**
 * GemmaCare — Database adapter
 *
 * Automatically picks the right backend:
 *   • MySQL  — when DATABASE_URL is set in .env (production)
 *   • SQLite — when DATABASE_URL is empty (local dev, demo, Kaggle)
 *
 * SQLite creates gemmacare.db automatically in the project root — zero setup.
 */

import { ENV } from "./_core/env";

// ── SQLite path (always available, zero config) ───────────────────────────────
import * as sqlite from "./db.sqlite";

// ── MySQL path (production) ───────────────────────────────────────────────────
import { eq, desc } from "drizzle-orm";
import { drizzle as drizzleMysql } from "drizzle-orm/mysql2";
import {
  InsertUser, users, triageRecords, TriageRecord, InsertTriageRecord,
  sessionHistory, SessionHistory, InsertSessionHistory,
} from "../drizzle/schema";

let _mysqlDb: ReturnType<typeof drizzleMysql> | null = null;

async function getMysqlDb() {
  if (!_mysqlDb && ENV.databaseUrl) {
    try {
      _mysqlDb = drizzleMysql(ENV.databaseUrl);
    } catch (error) {
      console.warn("[Database] MySQL connection failed:", error);
      _mysqlDb = null;
    }
  }
  return _mysqlDb;
}

function usingSQLite(): boolean {
  return !ENV.databaseUrl;
}

if (usingSQLite()) {
  console.log("[Database] No DATABASE_URL — using local SQLite (gemmacare.db) ✅");
} else {
  console.log("[Database] Using MySQL:", ENV.databaseUrl.replace(/:\/\/[^@]+@/, "://<credentials>@"));
}

// ── Unified API — same interface regardless of backend ────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (usingSQLite()) return sqlite.upsertUser(user);

  const db = await getMysqlDb();
  if (!db) { console.warn("[Database] MySQL unavailable, skip upsertUser"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  if (usingSQLite()) return sqlite.getUserByOpenId(openId);
  const db = await getMysqlDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function createTriageRecord(
  userId: number,
  data: Omit<InsertTriageRecord, "userId">,
): Promise<TriageRecord> {
  if (usingSQLite()) return sqlite.createTriageRecord(userId, data) as unknown as TriageRecord;
  const db = await getMysqlDb();
  if (!db) throw new Error("[Database] MySQL unavailable");

  const result = await db.insert(triageRecords).values({ userId, ...data });
  const recordId = result[0].insertId as number;
  const record = await db.select().from(triageRecords).where(eq(triageRecords.id, recordId)).limit(1);
  return record[0];
}

export async function getTriageRecordById(id: number): Promise<TriageRecord | undefined> {
  if (usingSQLite()) return sqlite.getTriageRecordById(id) as unknown as Promise<TriageRecord | undefined>;
  const db = await getMysqlDb();
  if (!db) return undefined;
  const result = await db.select().from(triageRecords).where(eq(triageRecords.id, id)).limit(1);
  return result[0];
}

export async function getUserTriageRecords(userId: number, limit = 50): Promise<TriageRecord[]> {
  if (usingSQLite()) return sqlite.getUserTriageRecords(userId, limit) as unknown as Promise<TriageRecord[]>;
  const db = await getMysqlDb();
  if (!db) return [];
  return await db.select().from(triageRecords).where(eq(triageRecords.userId, userId)).orderBy(desc(triageRecords.createdAt)).limit(limit);
}

export async function createSessionHistory(
  userId: number,
  triageRecordId: number,
  data: Omit<InsertSessionHistory, "userId" | "triageRecordId">,
): Promise<SessionHistory> {
  if (usingSQLite()) return sqlite.createSessionHistory(userId, triageRecordId, data) as unknown as SessionHistory;
  const db = await getMysqlDb();
  if (!db) throw new Error("[Database] MySQL unavailable");

  const result = await db.insert(sessionHistory).values({ userId, triageRecordId, ...data });
  const historyId = result[0].insertId as number;
  const history = await db.select().from(sessionHistory).where(eq(sessionHistory.id, historyId)).limit(1);
  return history[0];
}

export async function getUserSessionHistory(userId: number, limit = 100): Promise<SessionHistory[]> {
  if (usingSQLite()) return sqlite.getUserSessionHistory(userId, limit) as unknown as Promise<SessionHistory[]>;
  const db = await getMysqlDb();
  if (!db) return [];
  return await db.select().from(sessionHistory).where(eq(sessionHistory.userId, userId)).orderBy(desc(sessionHistory.createdAt)).limit(limit);
}

// Re-export types
export type * from "../drizzle/schema";
export * from "../shared/_core/errors";
export const COOKIE_NAME    = "app_session_id";
export const ONE_YEAR_MS    = 1000 * 60 * 60 * 24 * 365;
export const AXIOS_TIMEOUT_MS = 30_000;
export const UNAUTHED_ERR_MSG = "Please login (10001)";
export const NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";
