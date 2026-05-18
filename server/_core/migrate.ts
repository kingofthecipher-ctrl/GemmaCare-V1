import { drizzle } from "drizzle-orm/mysql2";
import { migrate } from "drizzle-orm/mysql2/migrator";
import mysql from "mysql2/promise";
import path from "path";

export async function runMigrations() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    console.warn("[Migrate] DATABASE_URL not set — skipping migrations");
    return;
  }

  const connection = await mysql.createConnection(url);
  const db = drizzle(connection);

  // Migrations folder is at /app/drizzle in production (copied by Dockerfile)
  const migrationsFolder = path.join(process.cwd(), "drizzle");

  console.log(`[Migrate] Running migrations from ${migrationsFolder}`);
  await migrate(db, { migrationsFolder });

  await connection.end();
}
