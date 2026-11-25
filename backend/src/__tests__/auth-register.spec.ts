import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
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

describe('POST /api/auth/register — US01 Criar Conta (Issue #25)', () => {
  it('Cenário 1: deve criar nova conta com senha criptografada via bcrypt, omitir senhaHash e emitir cookie HttpOnly de login automático (RNF01, RNF06)', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const app = await buildApp({ accountRepository });

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: '  NovoUsuario@Valimenta.com ',
        senha: 'senhaSegura123',
      },
    });

    expect(response.statusCode).toBe(201);
    const body = response.json<{ conta: { id: string; email: string; senhaHash?: string } }>();
    expect(body.conta.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
    expect(body.conta.email).toBe('novousuario@valimenta.com');
    expect(body.conta.senhaHash).toBeUndefined();

    // Verifica que o hash bcrypt foi persistido e não a senha em texto puro (RNF06)
    const saved = await accountRepository.findByEmail('novousuario@valimenta.com');
    expect(saved).not.toBeNull();
    expect(saved?.senhaHash).not.toBe('senhaSegura123');
    const hashMatches = await bcrypt.compare('senhaSegura123', saved?.senhaHash ?? '');
    expect(hashMatches).toBe(true);

    // Verifica emissão do cookie HttpOnly valimenta_token (Login automático)
    const setCookieHeader = String(response.headers['set-cookie']);
    expect(setCookieHeader).toContain(`${SESSION_COOKIE_NAME}=`);
    expect(setCookieHeader).toContain('HttpOnly');

    await app.close();
  });

  it('Cenário 2 (RN18): deve bloquear tentativa de cadastro com e-mail já existente (case-insensitive) retornando HTTP 409 e "Este e-mail já está em uso."', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const app = await buildApp({ accountRepository });

    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'usuario@teste.com',
        senha: 'senhaValida123',
      },
    });

    const duplicateResponse = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: '  USUARIO@TESTE.COM ',
        senha: 'outraSenhaValida123',
      },
    });

    expect(duplicateResponse.statusCode).toBe(409);
    expect(duplicateResponse.json()).toEqual({
      code: 'EMAIL_ALREADY_IN_USE',
      message: 'Este e-mail já está em uso.',
    });

    await app.close();
  });

  it('Cenário 3: deve bloquear e-mail com formato inválido retornando HTTP 400 e "Informe um endereço de e-mail válido."', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const app = await buildApp({ accountRepository });

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'email-sem-arroba-e-dominio',
        senha: 'senhaValida123',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json<{ message: string }>().message).toBe(
      'Informe um endereço de e-mail válido.',
    );

    await app.close();
  });

  it('Cenário 4 (RN19): deve bloquear senha com menos de 8 caracteres retornando HTTP 400 e "A senha deve conter no mínimo 8 caracteres."', async () => {
    const accountRepository = new InMemoryAccountRepository();
    const app = await buildApp({ accountRepository });

    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: 'valido@teste.com',
        senha: '1234567',
      },
    });

    expect(response.statusCode).toBe(400);
    expect(response.json<{ message: string }>().message).toBe(
      'A senha deve conter no mínimo 8 caracteres.',
    );

    await app.close();
  });
});
