import { Resend } from "resend";

const TEAM_NAME = "Billistic Beaniez FIRST Lego League Team";
const EMAIL_FROM =
  process.env.EMAIL_FROM || "Billistic Beaniez <info@billisticbeaniez.com>";
export const ADMIN_TO = process.env.ADMIN_EMAIL || "info@billisticbeaniez.com";
const SITE_URL =
  process.env.VERCEL_ENV === "production"
    ? "https://www.billisticbeaniez.com"
    : process.env.NEXTAUTH_URL || "https://www.billisticbeaniez.com";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(apiKey);
  }
  return _resend;
}

async function deliver({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });
  if (error) {
    throw new Error(`Resend ${error.name}: ${error.message}`);
  }
}

export async function sendContactEmail({
  name,
  email,
  message,
}: {
  name: string;
  email: string;
  message: string;
}) {
  await deliver({
    to: ADMIN_TO,
    subject: `New Contact from ${name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });

  await deliver({
    to: email,
    subject: `Thank you for contacting ${TEAM_NAME}!`,
    html: `
      <h2>Thank you, ${name}!</h2>
      <p>We received your message and will get back to you soon.</p>
      <p>Your message: "${message}"</p>
      <br/>
      <p>Best regards,<br/>${TEAM_NAME}</p>
    `,
  });
}

export async function sendAdminSignupRequest({
  name,
  email,
  reason,
}: {
  name: string;
  email: string;
  reason: string;
  requestId: string;
}) {
  await deliver({
    to: ADMIN_TO,
    subject: `New Admin Signup Request from ${name}`,
    html: `
      <h2>New Admin Signup Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><a href="${SITE_URL}/admin/approvals">Review Request</a></p>
    `,
  });
}

export async function sendAdminApprovedEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  await deliver({
    to: email,
    subject: `Your Admin Account Has Been Approved!`,
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your admin account has been approved. You can now log in to the admin dashboard.</p>
      <p><a href="${SITE_URL}/login">Log In Now</a></p>
      <br/>
      <p>Best regards,<br/>${TEAM_NAME}</p>
    `,
  });
}

export async function sendAdminDeniedEmail({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  await deliver({
    to: email,
    subject: `Admin Signup Request Update`,
    html: `
      <h2>Hello, ${name}</h2>
      <p>Unfortunately, your admin signup request has been denied at this time.</p>
      <p>If you believe this is an error, please contact us.</p>
      <br/>
      <p>Best regards,<br/>${TEAM_NAME}</p>
    `,
  });
}
