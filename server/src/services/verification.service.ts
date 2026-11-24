import { createHash, randomBytes } from 'node:crypto';
import { LIMITS } from '@gym/shared';
import type { UserRepository, VerificationTicket } from '../repositories/user.repository.js';
import type { EmailSender } from './email.service.js';

const TOKEN_FORMAT = /^[0-9a-f]{64}$/;
const sha256 = (value: string): string => createHash('sha256').update(value).digest('hex');
const escapeHtml = (value: string): string =>
  value.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c] ?? c);

/**
 * Email confirmation: 32 random bytes (hex) go in the link; only their SHA-256 is stored,
 * so a leaked database cannot be used to confirm accounts. Links expire after 24 h and
 * work once.
 */
export class EmailVerificationService {
  private readonly users: UserRepository;
  private readonly sender: EmailSender;
  private readonly appUrl: string;

  constructor(users: UserRepository, sender: EmailSender, appUrl: string) {
    this.users = users;
    this.sender = sender;
    this.appUrl = appUrl.replace(/\/+$/, '');
  }

  /** A fresh token (for the email) and what the database keeps of it. */
  newTicket(): { token: string; ticket: VerificationTicket } {
    const token = randomBytes(32).toString('hex');
    const expiresAt = Date.now() + LIMITS.VERIFICATION_TTL_HOURS * 3600 * 1000;
    return { token, ticket: { tokenHash: sha256(token), expiresAt } };
  }

  /** Sends the confirmation email. Never throws: false = could not be sent (logged). */
  async send(user: { name: string; email: string }, token: string): Promise<boolean> {
    const link = `${this.appUrl}/api/auth/verify-email?token=${token}`;
    const name = escapeHtml(user.name);
    try {
      await this.sender.send({
        to: user.email,
        subject: 'Confirma tu correo en AuraWorkout',
        text: `Hola ${user.name}:\n\nConfirma tu correo para activar tu cuenta de AuraWorkout:\n${link}\n\nEl enlace caduca en ${LIMITS.VERIFICATION_TTL_HOURS} horas. Si no has creado esta cuenta, ignora este mensaje.`,
        html: `<p>Hola ${name}:</p><p>Confirma tu correo para activar tu cuenta de <strong>AuraWorkout</strong>:</p>
<p><a href="${link}" style="display:inline-block;padding:10px 18px;background:#4d7c0f;color:#fff;border-radius:8px;text-decoration:none;font-weight:600">Confirmar mi correo</a></p>
<p style="color:#64748b;font-size:13px">El enlace caduca en ${LIMITS.VERIFICATION_TTL_HOURS} horas. Si no has creado esta cuenta, ignora este mensaje.</p>`,
      });
      return true;
    } catch (error) {
      console.error(`Could not send the confirmation email: ${error instanceof Error ? error.message : String(error)}`);
      return false;
    }
  }

  /** Confirms the account owning this token, if valid and not expired. */
  async confirm(token: string): Promise<boolean> {
    if (!TOKEN_FORMAT.test(token)) return false;
    return this.users.confirmEmail(sha256(token), Date.now());
  }

  /**
   * New link for an unverified account. Silent on purpose (same answer whether the
   * account exists, is verified or not) and not awaited by the caller, so neither the
   * response nor its timing reveals which emails / usernames are registered.
   */
  async resend(identifier: string): Promise<void> {
    const user = await this.users.findByIdentifier(identifier);
    if (!user || user.emailVerified) return;
    const { token, ticket } = this.newTicket();
    await this.users.setVerification(user.id, ticket);
    await this.send(user, token);
  }
}
