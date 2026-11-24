import { Resolver } from 'node:dns/promises';

/**
 * - ok: the domain has mail servers.
 * - no-mail: the domain does not exist, has no MX or declares it accepts no mail (null MX).
 * - unavailable: DNS could not answer now (timeout, network): not the user's fault.
 */
export type DomainCheck = 'ok' | 'no-mail' | 'unavailable';

export interface EmailDomainChecker {
  check(email: string): Promise<DomainCheck>;
}

/** Answers that prove the domain cannot receive mail (vs. a transient DNS failure). */
const NO_MAIL_CODES = new Set(['ENOTFOUND', 'ENODATA', 'ENONAME', 'ENOTIMP', 'EBADNAME']);

/** Real check with dns.promises.resolveMx: rejects "@gmial.com"-style typos and invented domains. */
export class DnsEmailDomainChecker implements EmailDomainChecker {
  // Short timeouts: the user is waiting on the register form.
  private readonly resolver = new Resolver({ timeout: 3000, tries: 2 });

  async check(email: string): Promise<DomainCheck> {
    const domain = email.slice(email.lastIndexOf('@') + 1);
    try {
      const records = await this.resolver.resolveMx(domain);
      // RFC 7505 "null MX" (exchange "." / ""): the domain explicitly accepts no email.
      return records.some((record) => record.exchange !== '' && record.exchange !== '.') ? 'ok' : 'no-mail';
    } catch (error) {
      const code = error instanceof Error && 'code' in error ? String(error.code) : '';
      return NO_MAIL_CODES.has(code) ? 'no-mail' : 'unavailable';
    }
  }
}
