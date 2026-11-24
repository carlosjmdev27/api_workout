export interface EmailMessage {
  to: string;
  subject: string;
  html: string;
  text: string;
}

export interface EmailSender {
  /** Throws if the message could not be handed to the provider. */
  send(message: EmailMessage): Promise<void>;
}

const RESEND_URL = 'https://api.resend.com/emails';

/** Resend HTTP API (no SDK: one fetch call, no extra dependency). */
export class ResendEmailSender implements EmailSender {
  private readonly apiKey: string;
  private readonly from: string;

  constructor(apiKey: string, from: string) {
    this.apiKey = apiKey;
    this.from = from;
  }

  async send(message: EmailMessage): Promise<void> {
    const response = await fetch(RESEND_URL, {
      method: 'POST',
      headers: { Authorization: `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: this.from, ...message, to: [message.to] }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!response.ok) {
      // Resend's error body says why (e.g. unverified sender domain); it never contains the key.
      const detail = await response.text().catch(() => '');
      throw new Error(`Resend answered ${response.status}: ${detail.slice(0, 300)}`);
    }
  }
}

/** Without RESEND_API_KEY (development): the email, link included, goes to the server log. */
export class ConsoleEmailSender implements EmailSender {
  async send(message: EmailMessage): Promise<void> {
    console.log(`[email] To: ${message.to} | ${message.subject}\n${message.text}`);
  }
}
