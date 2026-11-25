import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { UnauthorizedError } from '../../domain/errors.js';

const jwtPayloadSchema = z.object({
  contaId: z.string().uuid(),
  email: z.string().email(),
});

/**
 * Guardião de Autenticação e Isolamento Multi-tenant (RN17, RNF06):
 * Valida o JWT extraído exclusivamente do Cookie HttpOnly `valimenta_token`
 * e injeta `request.user = { contaId, email }`.
 */
export async function requireAuth(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
  try {
    await request.jwtVerify({ onlyCookie: true });

    const parsed = jwtPayloadSchema.safeParse(request.user);
    if (!parsed.success) {
      throw new UnauthorizedError('Não autenticado.');
    }

    request.user = {
      contaId: parsed.data.contaId,
      email: parsed.data.email,
    };
  } catch {
    throw new UnauthorizedError('Não autenticado.');
  }
}
