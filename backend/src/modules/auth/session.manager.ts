import type { FastifyReply } from 'fastify';
import type { AuthenticatedUserPayload } from '../../types/fastify.js';

export const SESSION_COOKIE_NAME = 'valimenta_token';
export const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 dias

export interface SessionCookieOptions {
  readonly isProduction: boolean;
}

/**
 * SessionManager (Modelo C4 Nível 3 — Auth Module):
 * Encapsula a emissão e revogação do token JWT armazenado em Cookie HttpOnly (RNF06).
 */
export class SessionManager {
  private readonly isProduction: boolean;

  constructor(
    options: SessionCookieOptions = { isProduction: process.env.NODE_ENV === 'production' },
  ) {
    this.isProduction = options.isProduction;
  }

  public async issueSessionCookie(
    reply: FastifyReply,
    user: AuthenticatedUserPayload,
    expiresIn: string | number = SESSION_MAX_AGE_SECONDS,
  ): Promise<string> {
    const token = await reply.jwtSign(
      {
        contaId: user.contaId,
        email: user.email,
      },
      { expiresIn },
    );

    reply.setCookie(SESSION_COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: this.isProduction,
      maxAge: typeof expiresIn === 'number' ? expiresIn : SESSION_MAX_AGE_SECONDS,
    });

    return token;
  }

  public clearSessionCookie(reply: FastifyReply): void {
    reply.clearCookie(SESSION_COOKIE_NAME, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: this.isProduction,
    });
  }
}
