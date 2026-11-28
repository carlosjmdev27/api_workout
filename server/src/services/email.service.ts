import type { EmailSenderIdentity } from '../config/email-from.js';

export interface EmailMessage {
  to: string;
  /** Recipient's display name (optional). */
  toName?: string;
  subject: string;
  /** Already escaped by the caller (user data inside it is HTML-escaped). */
  html: string;
  text: string;
}

export interface EmailSender {
  /** Throws if the message could not be handed to the provider. */
  send(message: EmailMessage): Promise<void>;
}

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const TIMEOUT_MS = 10_000;

/**
 * Brevo transactional email, HTTP API v3 (no SDK: one fetch call, no extra dependency).
 * Works with a verified single sender (e.g. a Gmail address), no own domain needed.
 */
export class BrevoEmailSender implements EmailSender {
  private readonly apiKey: string;
  private readonly sender: EmailSenderIdentity;
  private readonly url: string;

  /** `url` is only overridden by tests (a local fake server). */
  constructor(apiKey: string, sender: EmailSenderIdentity, url: string = BREVO_URL) {
    this.apiKey = apiKey;
    this.sender = sender;
    this.url = url;
  }

  async send(message: EmailMessage): Promise<void> {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: { 'api-key': this.apiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        sender: this.sender,
        to: [message.toName ? { email: message.to, name: message.toName } : { email: message.to }],
        subject: message.subject,
        htmlContent: message.html,
        textContent: message.text,
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
    if (!response.ok) {
      // Brevo's error body ({ code, message }) says why (e.g. sender not verified); it never contains the key.
      const detail = await response.text().catch(() => '');
      throw new Error(`Brevo answered ${response.status}: ${detail.slice(0, 300)}`);
    }
  }
}

/** Without BREVO_API_KEY (development / Docker): the email, link included, goes to the server log. */
export class ConsoleEmailSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    console.log(`[email] To: ${message.to} | ${message.subject}\n${message.text}`);
  }
}
