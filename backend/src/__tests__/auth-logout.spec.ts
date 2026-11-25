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

describe('POST /api/auth/logout — US04 Fazer Logout (Issue #29)', () => {
  it('Cenário 1 e 2: deve encerrar a sessão revogando o cookie HttpOnly e bloquear acesso subsequente a rotas protegidas (RN17, RNF06)', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const app = await buildApp({ accountRepository });

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'jessica@valimenta.com',
        senha: 'senhaSegura123',
      },
    });
    expect(registerResponse.statusCode).toBe(201);
    const activeCookie = registerResponse.cookies.find((c) => c.name === SESSION_COOKIE_NAME);
    expect(activeCookie?.value).toBeTruthy();

    // Confirma que a sessão está autenticada antes do logout
    const meBeforeLogout = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      cookies: {
        [SESSION_COOKIE_NAME]: activeCookie?.value ?? '',
      },
    });
    expect(meBeforeLogout.statusCode).toBe(200);

    // Executa logout
    const logoutResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
      cookies: {
        [SESSION_COOKIE_NAME]: activeCookie?.value ?? '',
      },
    });

    expect(logoutResponse.statusCode).toBe(200);
    expect(logoutResponse.json()).toEqual({
      message: 'Sessão encerrada com sucesso.',
    });

    const clearedCookie = logoutResponse.cookies.find((c) => c.name === SESSION_COOKIE_NAME);
    expect(clearedCookie).toBeDefined();
    expect(clearedCookie?.value).toBe('');
    expect(clearedCookie?.httpOnly).toBe(true);
    expect(clearedCookie?.path).toBe('/');
    expect(clearedCookie?.sameSite).toBe('Lax');

    // Simula o navegador enviando o cookie limpo após logout
    const meAfterLogout = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      cookies: {
        [SESSION_COOKIE_NAME]: clearedCookie?.value ?? '',
      },
    });
    expect(meAfterLogout.statusCode).toBe(401);
    expect(meAfterLogout.json()).toEqual({
      code: 'UNAUTHORIZED',
      message: 'Não autenticado.',
    });

    await app.close();
  });

  it('Cenário 3 (RNF01): deve preservar integralmente os dados da conta no banco após logout e permitir novo login com as mesmas credenciais', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const app = await buildApp({ accountRepository });

    const registerResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'persistencia@valimenta.com',
        senha: 'senhaSegura123',
      },
    });
    const createdAccount = registerResponse.json<{ conta: { id: string; email: string } }>().conta;

    const logoutResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/logout',
    });
    expect(logoutResponse.statusCode).toBe(200);

    // Realiza novo login após o logout
    const reloginResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email: 'persistencia@valimenta.com',
        senha: 'senhaSegura123',
      },
    });

    expect(reloginResponse.statusCode).toBe(200);
    expect(reloginResponse.json()).toEqual({
      conta: createdAccount,
    });

    await app.close();
  });
});
