import { Resend } from "resend";

let _resend: Resend | null = null;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
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
  await getResend().emails.send({
    from: "FLL Innovation Project <onboarding@resend.dev>",
    to: process.env.ADMIN_EMAIL!,
    subject: `New Contact from ${name}`,
    html: `
      <h2>New Contact Form Submission</h2>
      <p><strong>Name:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Message:</strong></p>
      <p>${message}</p>
    `,
  });

  await getResend().emails.send({
    from: "FLL Innovation Project <onboarding@resend.dev>",
    to: email,
    subject: "Thank you for contacting us!",
    html: `
      <h2>Thank you, ${name}!</h2>
      <p>We received your message and will get back to you soon.</p>
      <p>Your message: "${message}"</p>
      <br/>
      <p>Best regards,<br/>FLL Innovation Project Team</p>
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
  await getResend().emails.send({
    from: "FLL Innovation Project <onboarding@resend.dev>",
    to: process.env.ADMIN_EMAIL!,
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
  await getResend().emails.send({
    from: "FLL Innovation Project <onboarding@resend.dev>",
    to: email,
    subject: "Your Admin Account Has Been Approved!",
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Your admin account has been approved. You can now log in to the admin dashboard.</p>
      <p><a href="${process.env.NEXTAUTH_URL}/login">Log In Now</a></p>
      <br/>
      <p>Best regards,<br/>FLL Innovation Project Team</p>
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
  await getResend().emails.send({
    from: "FLL Innovation Project <onboarding@resend.dev>",
    to: email,
    subject: "Admin Signup Request Update",
    html: `
      <h2>Hello, ${name}</h2>
      <p>Unfortunately, your admin signup request has been denied at this time.</p>
      <p>If you believe this is an error, please contact us.</p>
      <br/>
      <p>Best regards,<br/>FLL Innovation Project Team</p>
    `,
  });
}
