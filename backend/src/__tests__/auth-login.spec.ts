import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { buildApp } from '../app.js';
import type {
  AccountRecord,
  CreateAccountData,
  IAccountRepository,
} from '../modules/auth/account.repository.js';
import { SESSION_COOKIE_NAME } from '../modules/auth/session.manager.js';

class InMemoryAccountRepository implements IAccountRepository {
  public readonly accounts = new Map<string, AccountRecord>();

  public async findByEmail(email: string): Promise<AccountRecord | null> {
    for (const acc of this.accounts.values()) {
      if (acc.email === email) {
        return acc;
      }
    }
    return null;
  }

  public async findById(id: string): Promise<AccountRecord | null> {
    return this.accounts.get(id) ?? null;
  }

  public async create(data: CreateAccountData): Promise<AccountRecord> {
    const record: AccountRecord = {
      id: randomUUID(),
      email: data.email,
      senhaHash: data.senhaHash,
      criadoEm: new Date(),
    };
    this.accounts.set(record.id, record);
    return record;
  }
}

describe('POST /api/auth/login & GET /api/auth/me — US02 Fazer Login (Issue #27)', () => {
  it('Cenário 1 e 4: deve autenticar credenciais válidas (HTTP 200), emitir cookie HttpOnly e retornar dados isolados em GET /api/auth/me (RN17, RNF06)', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const app = await buildApp({ accountRepository });

    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'jessica@valimenta.com',
        senha: 'senhaCorreta123',
      },
    });

    const loginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: '  JESSICA@Valimenta.com ',
        senha: 'senhaCorreta123',
      },
    });

    expect(loginResponse.statusCode).toBe(200);
    const loginBody = loginResponse.json<{
      conta: { id: string; email: string; senhaHash?: string };
    }>();
    expect(loginBody.conta.email).toBe('jessica@valimenta.com');
    expect(loginBody.conta.senhaHash).toBeUndefined();

    const sessionCookie = loginResponse.cookies.find((c) => c.name === SESSION_COOKIE_NAME);
    expect(sessionCookie).toBeDefined();
    expect(sessionCookie?.httpOnly).toBe(true);

    const meResponse = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      cookies: {
        [SESSION_COOKIE_NAME]: sessionCookie?.value ?? '',
      },
    });

    expect(meResponse.statusCode).toBe(200);
    expect(meResponse.json()).toEqual({
      conta: {
        id: loginBody.conta.id,
        email: 'jessica@valimenta.com',
      },
    });

    await app.close();
  });

  it('Cenário 2 (Senha incorreta): deve rejeitar com HTTP 401 e mensagem neutra "E-mail ou senha incorretos." (RNF06)', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const app = await buildApp({ accountRepository });

    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'jessica@valimenta.com',
        senha: 'senhaCorreta123',
      },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'jessica@valimenta.com',
        senha: 'senhaErrada999',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      code: 'INVALID_CREDENTIALS',
      message: 'E-mail ou senha incorretos.',
    });
    expect(response.headers['set-cookie']).toBeUndefined();

    await app.close();
  });

  it('Cenário 2 (E-mail não cadastrado): deve rejeitar com HTTP 401 e exatamente a mesma mensagem neutra "E-mail ou senha incorretos." (RNF06)', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const app = await buildApp({ accountRepository });

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'inexistente@valimenta.com',
        senha: 'qualquerSenha123',
      },
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      code: 'INVALID_CREDENTIALS',
      message: 'E-mail ou senha incorretos.',
    });
    expect(response.headers['set-cookie']).toBeUndefined();

    await app.close();
  });

  it('Cenário 3: deve bloquear login com campos obrigatórios em branco retornando HTTP 400', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const app = await buildApp({ accountRepository });

    const emptyPasswordResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'jessica@valimenta.com',
        senha: '',
      },
    });

    expect(emptyPasswordResponse.statusCode).toBe(400);
    expect(emptyPasswordResponse.json<{ message: string }>().message).toBe(
      'A senha é obrigatória.',
    );

    await app.close();
  });

  it('Cenário 5: deve bloquear acesso a GET /api/auth/me sem autenticação com HTTP 401 (RNF06)', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const app = await buildApp({ accountRepository });

    const response = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
    });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Não autenticado.',
    });

    await app.close();
  });
});
