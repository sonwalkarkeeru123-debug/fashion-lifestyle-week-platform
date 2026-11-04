import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

export interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  from?: string;
  replyTo?: string;
}

export async function sendEmail(params: SendEmailParams) {
  if (!resend) {
    console.warn("Resend not configured. Email would be sent to:", params.to);
    console.warn("Subject:", params.subject);
    return { id: "mock-" + Date.now(), success: true, mock: true };
  }

  const from =
    params.from ||
    `${process.env.RESEND_FROM_NAME || "Fashion Week"} <${process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev"}>`;

  try {
    const result = await resend.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
      replyTo: params.replyTo,
    });

    if (result.error) {
      console.error("Resend error:", result.error);
      return { success: false, error: result.error };
    }

    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("Email send failed:", error);
    return { success: false, error };
  }
}

export function personalizeTemplate(
  template: string,
  vars: Record<string, string | undefined>
): string {
  let result = template;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "gi");
    result = result.replace(regex, value || "");
  }
  return result;
}
