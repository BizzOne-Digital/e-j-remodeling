import "server-only";
import nodemailer from "nodemailer";

export const isMailConfigured = () => Boolean(process.env.SMTP_HOST && process.env.SMTP_FROM);

/** Plain-text email. Never throws: submissions are already stored when this runs. */
export async function sendMail(to: string | undefined, subject: string, rows: Record<string, string> | string, replyTo?: string) {
  if (!isMailConfigured() || !to) return false;
  try {
    const port = Number(process.env.SMTP_PORT || 587);
    const tx = nodemailer.createTransport({
      host: process.env.SMTP_HOST, port, secure: port === 465, connectionTimeout: 8000, greetingTimeout: 8000, socketTimeout: 15000,
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    });
    const text = typeof rows === "string" ? rows : Object.entries(rows).map(([k, v]) => `${k}: ${v || "-"}`).join("\n");
    await tx.sendMail({ from: process.env.SMTP_FROM, to, replyTo, subject: subject.replace(/[\r\n]+/g, " ").slice(0, 200), text });
    return true;
  } catch (e) {
    console.error("[mail] send failed:", (e as Error).name);
    return false;
  }
}
export const notifyAdmin = (subject: string, rows: Record<string, string>, replyTo?: string) => sendMail(process.env.ADMIN_NOTIFICATION_EMAIL, subject, rows, replyTo);
