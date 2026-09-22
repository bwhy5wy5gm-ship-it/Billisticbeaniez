import { Resend } from "resend";

const TEAM_NAME = "Billistic Beaniez FIRST Lego League Team";
const TEAM_EMAIL = "Billistic Beaniez <onboarding@resend.dev>";
const ADMIN_EMAIL = "info@billisticbeaniez.com";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(apiKey);
  }
  return _resend;
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
  const resend = getResend();

  await resend.emails.send({
    from: TEAM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Contact from ${name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });

  await resend.emails.send({
    from: TEAM_EMAIL,
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
  requestId,
}: {
  name: string;
  email: string;
  reason: string;
  requestId: string;
}) {
  const resend = getResend();

  await resend.emails.send({
    from: TEAM_EMAIL,
    to: ADMIN_EMAIL,
    subject: `New Admin Signup Request from ${name}`,
    html: `
      <h2>New Admin Signup Request</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><a href="${process.env.NEXTAUTH_URL}/admin/approvals">Review Request</a></p>
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
  const resend = getResend();

  await resend.emails.send({
    from: TEAM_EMAIL,
    to: email,
    subject: `Your Admin Account Has Been Approved!`,
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your admin account has been approved. You can now log in to the admin dashboard.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/login">Log In Now</a></p>
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
  const resend = getResend();

  await resend.emails.send({
    from: TEAM_EMAIL,
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
