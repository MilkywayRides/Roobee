import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: "Auth System <noreply@yourdomain.com>",
    to: email,
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Reset Your Password</h1>
        <p style="color: #666;">You requested to reset your password. Click the button below to reset it:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Reset Password
          </a>
        </div>
        <p style="color: #666;">Or copy and paste this link in your browser:</p>
        <p style="color: #666; word-break: break-all;">${resetUrl}</p>
        <p style="color: #666;">This link will expire in 24 hours.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
}

export async function sendVerificationEmail(email: string, otp: string) {
  await resend.emails.send({
    from: "Auth System <noreply@yourdomain.com>",
    to: email,
    subject: "Verify Your Email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #333; text-align: center;">Verify Your Email</h1>
        <p style="color: #666;">Your verification code is:</p>
        <div style="text-align: center; margin: 30px 0;">
          <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; display: inline-block;">
            <span style="font-size: 24px; font-weight: bold; letter-spacing: 5px;">${otp}</span>
          </div>
        </div>
        <p style="color: #666;">This code will expire in 10 minutes.</p>
        <p style="color: #666;">If you didn't request this, please ignore this email.</p>
      </div>
    `,
  });
} 