/**
 * SQLite schema — mirrors schema.ts exactly but uses SQLite column types.
 * Used automatically when DATABASE_URL is not set (local dev / demo mode).
 * The database file is created at ./gemmacare.db on first run.
 */
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const users = sqliteTable("users", {
  id:           integer("id").primaryKey({ autoIncrement: true }),
  openId:       text("openId").notNull().unique(),
  name:         text("name"),
  email:        text("email"),
  loginMethod:  text("loginMethod"),
  role:         text("role", { enum: ["user", "admin"] }).default("user").notNull(),
  createdAt:    text("createdAt").default(sql`(datetime('now'))`).notNull(),
  updatedAt:    text("updatedAt").default(sql`(datetime('now'))`).notNull(),
  lastSignedIn: text("lastSignedIn").default(sql`(datetime('now'))`).notNull(),
});

export type User       = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const triageRecords = sqliteTable("triageRecords", {
  id:                 integer("id").primaryKey({ autoIncrement: true }),
  userId:             integer("userId").notNull(),
  chiefComplaint:     text("chiefComplaint").notNull(),
  symptomList:        text("symptomList").notNull(),       // JSON array as string
  urgencyLevel:       integer("urgencyLevel").notNull(),   // 1-5
  medicationFound:    text("medicationFound"),
  recommendedAction:  text("recommendedAction").notNull(),
  patientLanguage:    text("patientLanguage").notNull(),   // ISO 639-1
  exportLanguage:     text("exportLanguage").default("en").notNull(),
  confidence:         integer("confidence").notNull(),     // 0-100
  audioTranscript:    text("audioTranscript"),
  audioMedication:    text("audioMedication"),
  imageMedication:    text("imageMedication"),
  audioImageMatch:    integer("audioImageMatch").default(1).notNull(), // 1=match 0=mismatch
  verificationWarning: text("verificationWarning"),
  patientInstructions: text("patientInstructions"),
  audioFileKey:       text("audioFileKey"),
  imageFileKey:       text("imageFileKey"),
  createdAt:          text("createdAt").default(sql`(datetime('now'))`).notNull(),
  updatedAt:          text("updatedAt").default(sql`(datetime('now'))`).notNull(),
});

export type TriageRecord       = typeof triageRecords.$inferSelect;
export type InsertTriageRecord = typeof triageRecords.$inferInsert;

export const sessionHistory = sqliteTable("sessionHistory", {
  id:                integer("id").primaryKey({ autoIncrement: true }),
  userId:            integer("userId").notNull(),
  triageRecordId:    integer("triageRecordId").notNull(),
  sessionStartedAt:  text("sessionStartedAt").default(sql`(datetime('now'))`).notNull(),
  sessionEndedAt:    text("sessionEndedAt"),
  detectedLanguage:  text("detectedLanguage").notNull(),
  urgencyLevel:      integer("urgencyLevel").notNull(),
  chiefComplaint:    text("chiefComplaint").notNull(),
  createdAt:         text("createdAt").default(sql`(datetime('now'))`).notNull(),
});

export type SessionHistory       = typeof sessionHistory.$inferSelect;
export type InsertSessionHistory = typeof sessionHistory.$inferInsert;
