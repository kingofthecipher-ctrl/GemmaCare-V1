/**
 * storageProxy.ts
 *
 * File storage proxy — not used in local/Docker deployments.
 * GemmaCare stores all media as base64 in the DB.
 *
 * GemmaCare stores all media as base64 in the DB. If you need S3/GCS
 * object storage, wire it in here.
 */
import type { Express } from "express";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function registerStorageProxy(_app: Express): void {
  // no-op — local deployment has no external storage proxy
}
