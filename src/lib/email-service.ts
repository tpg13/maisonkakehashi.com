export const RECIPIENT_EMAIL = "contact@maisonkakehashi.com";

// Web3Forms Access Key: can be set via VITE_WEB3FORMS_KEY env or replaced here
export const WEB3FORMS_KEY = (import.meta as any).env?.VITE_WEB3FORMS_KEY || "";

export interface InquiryPayload {
  name: string;
  email: string;
  phone?: string;
  link?: string;
  service?: string;
  slot?: string;
  message?: string;
}

export interface SendResult {
  success: boolean;
  provider?: string;
  mailtoUrl: string;
  formattedBody: string;
  errorMessage?: string;
}

export function buildMailtoUrl(payload: InquiryPayload, subjectPrefix = "Maison Kakehashi Inquiry"): { url: string; bodyText: string; subject: string } {
  const subject = `${subjectPrefix} from ${payload.name} [${payload.service || payload.slot || "Direct Inquiry"}]`;
  const lines = [
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone: ${payload.phone}` : null,
    payload.link ? `Property Link: ${payload.link}` : null,
    payload.service ? `Requested Service: ${payload.service}` : null,
    payload.slot ? `Selected Slot: ${payload.slot}` : null,
    "",
    "Message:",
    payload.message || "(No additional message)",
    "",
    `Sent at: ${new Date().toLocaleString()}`,
    `Recipient: ${RECIPIENT_EMAIL}`,
  ].filter((l): l is string => l !== null);

  const bodyText = lines.join("\n");
  const url = `mailto:${RECIPIENT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  return { url, bodyText, subject };
}

export async function sendInquiry(payload: InquiryPayload, subjectPrefix = "Maison Kakehashi Inquiry"): Promise<SendResult> {
  const { url: mailtoUrl, bodyText, subject } = buildMailtoUrl(payload, subjectPrefix);

  // 1. If Web3Forms Access Key is configured, use Web3Forms API
  if (WEB3FORMS_KEY) {
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          subject,
          from_name: payload.name,
          email: payload.email,
          name: payload.name,
          phone: payload.phone || "Not specified",
          service: payload.service || "N/A",
          link: payload.link || "N/A",
          slot: payload.slot || "N/A",
          message: payload.message || "N/A",
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.success) {
        return { success: true, provider: "web3forms", mailtoUrl, formattedBody: bodyText };
      }
    } catch (e) {
      console.warn("Web3Forms delivery failed:", e);
    }
  }

  // 2. Fallback: FormSubmit.io
  try {
    const fd = new URLSearchParams();
    fd.append("name", payload.name);
    fd.append("email", payload.email);
    fd.append("_replyto", payload.email);
    fd.append("_subject", subject);
    fd.append("message", bodyText);

    const origin = typeof window !== "undefined" && window.location?.origin ? window.location.origin : "https://www.maisonkakehashi.com";
    const res = await fetch(`https://formsubmit.io/send/${RECIPIENT_EMAIL}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Referer": origin,
      },
      body: fd.toString(),
    });

    if (res.ok) {
      return { success: true, provider: "formsubmit.io", mailtoUrl, formattedBody: bodyText };
    }
  } catch (e) {
    console.warn("FormSubmit.io fallback failed:", e);
  }

  // 3. Fallback when online providers are unreachable or unconfigured
  return {
    success: false,
    mailtoUrl,
    formattedBody: bodyText,
    errorMessage: "Auto-forwarding service pending. Please use the direct email button below.",
  };
}
