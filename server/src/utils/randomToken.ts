import crypto from "crypto";

/** URL-safe random token for email verification / password reset / invites. */
export const randomToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

export const minutesFromNow = (mins: number) =>
  new Date(Date.now() + mins * 60 * 1000);

export const daysFromNow = (days: number) =>
  new Date(Date.now() + days * 24 * 60 * 60 * 1000);
