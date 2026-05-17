export interface SendEmailOptions {
  binding: SendEmail;
  from: string;
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = ({
  binding,
  from,
  to,
  subject,
  html,
}: SendEmailOptions) => binding.send({ from, html, subject, to });

export const sendOtpEmail = ({
  binding,
  from,
  to,
  otp,
  type,
}: {
  binding: SendEmail;
  from: string;
  to: string;
  otp: string;
  type: string;
}) => {
  const subjects: Record<string, string> = {
    "change-email": "Confirm your new email",
    "email-verification": "Verify your email",
    "forget-password": "Reset your password",
    "sign-in": "Your sign-in code",
  };

  return sendEmail({
    binding,
    from,
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 24px;">
        <h2 style="margin: 0 0 8px;">${subjects[type]}</h2>
        <p style="color: #666; margin: 0 0 24px;">Enter this code to continue:</p>
        <div style="font-size: 32px; font-weight: bold; letter-spacing: 0.3em; text-align: center; padding: 16px; background: #f4f4f5; border-radius: 8px;">
          ${otp}
        </div>
        <p style="color: #999; font-size: 13px; margin-top: 24px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
      </div>
    `,
    subject: subjects[type] ?? "Your verification code",
    to,
  });
};
