import { siteOrigin } from "./site";

export function emailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY?.trim();
}

export async function sendLoginEmail(email: string, url: string): Promise<void> {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) return;
  const from = process.env.EMAIL_FROM?.trim() || "Whenever <onboarding@resend.dev>";
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [email],
      subject: "Sign in to Whenever",
      html: `<p>Open your albums, credits, and photographs.</p><p><a href="${url}">Sign in</a></p><p>This link lasts an hour.</p>`,
      text: `Sign in to Whenever: ${url}`,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Could not send the sign-in email.");
  }
}

export function loginUrl(token: string): string {
  return `${siteOrigin()}/api/auth/callback?token=${token}`;
}
