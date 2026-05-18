/**
 * notification.ts
 *
 * Push notification service — not used in local/Docker deployments.
 * Replace with your own email/SMS provider here if needed.
 *
 * notifyOwner currently logs to console. Replace with your own email/SMS/push
 * provider here if needed.
 */

export async function notifyOwner(message: {
  title?: string;
  body: string;
  [key: string]: unknown;
}): Promise<boolean> {
  console.log(`[Notification] ${message.title ?? "GemmaCare"}: ${message.body}`);
  return true;
}
