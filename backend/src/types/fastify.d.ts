import '@fastify/jwt';

export interface AuthenticatedUserPayload {
  contaId: string;
  email: string;
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    payload: AuthenticatedUserPayload;
    user: AuthenticatedUserPayload;
  }
}
