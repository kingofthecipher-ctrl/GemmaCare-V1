import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** OAuth identifier (openId) returned from the local auth session. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * TriageRecord table stores clinical triage data from multimodal analysis.
 * Each record contains extracted clinical information and cross-verification results.
 */
export const triageRecords = mysqlTable("triageRecords", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  
  /* Clinical data */
  chiefComplaint: text("chiefComplaint").notNull(),
  symptomList: text("symptomList").notNull(), /* JSON array stored as string */
  urgencyLevel: int("urgencyLevel").notNull(), /* 1-5 scale */
  medicationFound: varchar("medicationFound", { length: 255 }),
  recommendedAction: text("recommendedAction").notNull(),
  patientLanguage: varchar("patientLanguage", { length: 10 }).notNull(), /* ISO 639-1 code */
  exportLanguage: varchar("exportLanguage", { length: 10 }).default("en").notNull(), /* Language for patient instructions export */
  confidence: int("confidence").notNull(), /* 0-100 percentage */
  
  /* Cross-verification */
  audioTranscript: text("audioTranscript"),
  audioMedication: varchar("audioMedication", { length: 255 }),
  imageMedication: varchar("imageMedication", { length: 255 }),
  audioImageMatch: int("audioImageMatch").default(1).notNull(), /* 1 = match, 0 = mismatch */
  verificationWarning: text("verificationWarning"), /* Warning message if mismatch */
  
  /* Patient instructions */
  patientInstructions: text("patientInstructions"),
  
  /* Metadata */
  audioFileKey: varchar("audioFileKey", { length: 512 }),
  imageFileKey: varchar("imageFileKey", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type TriageRecord = typeof triageRecords.$inferSelect;
export type InsertTriageRecord = typeof triageRecords.$inferInsert;

/**
 * SessionHistory table tracks user sessions and triage interactions.
 * Provides audit trail and historical lookup.
 */
export const sessionHistory = mysqlTable("sessionHistory", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().references(() => users.id),
  triageRecordId: int("triageRecordId").notNull().references(() => triageRecords.id),
  
  /* Session metadata */
  sessionStartedAt: timestamp("sessionStartedAt").defaultNow().notNull(),
  sessionEndedAt: timestamp("sessionEndedAt"),
  
  /* Quick reference fields for filtering */
  detectedLanguage: varchar("detectedLanguage", { length: 10 }).notNull(),
  urgencyLevel: int("urgencyLevel").notNull(),
  chiefComplaint: text("chiefComplaint").notNull(),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type SessionHistory = typeof sessionHistory.$inferSelect;
export type InsertSessionHistory = typeof sessionHistory.$inferInsert;