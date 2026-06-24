import nodemailer from "nodemailer";
import { env } from "@/config/env";

/* ------------------------------------------------------------------ *
 * Resend implementation (kept for reference — replaced by Gmail SMTP).
 *
 * import { Resend } from "resend";
 * const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;
 *
 * async function send({ to, subject, html }: SendArgs) {
 *   if (!resend) {
 *     console.log(`[email:dev] To: ${to} | ${subject}\n${html}\n`);
 *     return;
 *   }
 *   try {
 *     await resend.emails.send({ from: env.EMAIL_FROM, to, subject, html });
 *   } catch (err) {
 *     console.error("[email] send failed:", err);
 *   }
 * }
 * ------------------------------------------------------------------ */

// Links point at the frontend, which forwards the token back to the API.
const appUrl = env.CLIENT_ORIGIN.split(",")[0].trim();

// Gmail SMTP transport via nodemailer. Created only when credentials exist;
// otherwise emails are logged so flows stay testable in local dev.
const transporter =
  env.SMTP_USER && env.SMTP_PASS
    ? nodemailer.createTransport({
        host: env.SMTP_HOST,
        port: Number(env.SMTP_PORT),
        secure: Number(env.SMTP_PORT) === 465, // SSL for 465, STARTTLS otherwise
        auth: {
          user: env.SMTP_USER,
          pass: env.SMTP_PASS,
        },
      })
    : null;

type SendArgs = { to: string; subject: string; html: string };

/**
 * Send an email via Gmail SMTP (nodemailer). When SMTP credentials are not
 * configured (local dev), the message is logged instead so flows remain
 * testable without a provider.
 */
async function send({ to, subject, html }: SendArgs) {
  if (!transporter) {
    console.log(`[email:dev] To: ${to} | ${subject}\n${html}\n`);
    return;
  }

  try {
    await transporter.sendMail({ from: env.EMAIL_FROM, to, subject, html });
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}

const wrap = (heading: string, body: string, cta?: { url: string; label: string }) => `
  <div style="font-family:system-ui,sans-serif;max-width:480px;margin:auto">
    <h2 style="color:#111">${heading}</h2>
    <p style="color:#444;line-height:1.5">${body}</p>
    ${
      cta
        ? `<p><a href="${cta.url}" style="display:inline-block;background:#C49A4A;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none">${cta.label}</a></p>
           <p style="color:#888;font-size:12px">Or paste this link: ${cta.url}</p>`
        : ""
    }
  </div>
`;

export const sendVerificationEmail = (to: string, token: string) => {
  const url = `${appUrl}/verify-email?token=${token}`;
  return send({
    to,
    subject: "Verify your Elevoria email",
    html: wrap(
      "Confirm your email",
      "Welcome to Elevoria. Confirm your email address to activate your account.",
      { url, label: "Verify email" },
    ),
  });
};

export const sendPasswordResetEmail = (to: string, token: string) => {
  const url = `${appUrl}/reset-password?token=${token}`;
  return send({
    to,
    subject: "Reset your Elevoria password",
    html: wrap(
      "Reset your password",
      "We received a request to reset your password. This link expires in 1 hour. If you didn't request it, you can ignore this email.",
      { url, label: "Reset password" },
    ),
  });
};

export const sendInviteEmail = (
  to: string,
  workspaceName: string,
  token: string,
) => {
  const url = `${appUrl}/invite?token=${token}`;
  return send({
    to,
    subject: `You've been invited to ${workspaceName} on Elevoria`,
    html: wrap(
      `Join ${workspaceName}`,
      `You've been invited to collaborate in the "${workspaceName}" workspace. This invite expires in 7 days.`,
      { url, label: "Accept invite" },
    ),
  });
};
