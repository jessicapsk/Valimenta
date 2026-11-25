import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  fetchCurrentAccount,
  loginAccount,
  type LoginAccountInput,
  type PublicAccountDTO,
} from '../features/auth/api/auth.api.ts';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute.tsx';
import { AuthProvider } from '../features/auth/context/AuthContext.tsx';
import { LoginPage } from '../pages/LoginPage.tsx';

afterEach(() => {
  cleanup();
});

function renderLoginAndProtectedFlow(options?: {
  initialPath?: string;
  initialAccount?: PublicAccountDTO | null;
  loginFn?: (input: LoginAccountInput) => Promise<{ conta: PublicAccountDTO }>;
}) {
  return render(
    <AuthProvider initialAccount={options?.initialAccount ?? null} skipInitialCheck>
      <MemoryRouter initialEntries={[options?.initialPath ?? '/login']}>
        <Routes>
          <Route path="/login" element={<LoginPage loginFn={options?.loginFn} />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="/alimentos"
              element={
                <main>
                  <h1>Minha Despensa</h1>
                  <p>Nenhum alimento cadastrado no momento.</p>
                </main>
              }
            />
            <Route
              path="/historico"
              element={
                <main>
                  <h1>Histórico de Movimentações</h1>
                </main>
              }
            />
            <Route
              path="/desperdicio"
              element={
                <main>
                  <h1>Painel de Desperdício</h1>
                </main>
              }
            />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('LoginPage, AuthContext & ProtectedRoute — US02 Fazer Login (Issue #28)', () => {
  it('Cenário 1: deve autenticar com credenciais válidas, inicializar sessão no AuthContext e redirecionar para /alimentos', async () => {
    const loginMock = vi.fn(async (input: LoginAccountInput) => ({
      conta: {
        id: '11111111-1111-4111-8111-111111111111',
        email: input.email,
      },
    }));

    renderLoginAndProtectedFlow({ loginFn: loginMock });

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: '  Jessica@Valimenta.com ' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'senhaCorreta123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'jessica@valimenta.com',
        senha: 'senhaCorreta123',
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /minha despensa/i })).toBeDefined();
    });
  });

  it('Cenário 2: deve exibir alerta acessível "E-mail ou senha incorretos." quando a API retornar HTTP 401', async () => {
    const loginMock = vi.fn(async () => {
      throw new ApiError('E-mail ou senha incorretos.', 401, 'INVALID_CREDENTIALS');
    });

    renderLoginAndProtectedFlow({ loginFn: loginMock });

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'jessica@valimenta.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'senhaErrada' },
    });
    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('E-mail ou senha incorretos.');
    });
  });

  it('Cenário 3: deve bloquear submissão com campos obrigatórios em branco e sinalizar visualmente os erros', async () => {
    const loginMock = vi.fn();
    renderLoginAndProtectedFlow({ loginFn: loginMock });

    fireEvent.click(screen.getByRole('button', { name: /entrar/i }));

    expect(loginMock).not.toHaveBeenCalled();
    expect(screen.getByText('Informe um endereço de e-mail válido.')).toBeDefined();
    expect(screen.getByText('A senha é obrigatória.')).toBeDefined();
  });

  it('Cenário 5: deve bloquear acesso direto às rotas protegidas (/alimentos, /historico, /desperdicio) sem sessão ativa e redirecionar para /login', async () => {
    renderLoginAndProtectedFlow({
      initialPath: '/alimentos',
      initialAccount: null,
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /entrar no valimenta/i })).toBeDefined();
    });
  });

  it('loginAccount e fetchCurrentAccount devem usar credentials: "include" para operar via cookie HttpOnly (RNF06)', async () => {
    const fakeFetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        conta: { id: '11111111-1111-4111-8111-111111111111', email: 'a@b.com' },
      }),
    })) as unknown as typeof fetch;

    await loginAccount({ email: 'a@b.com', senha: '12345678' }, fakeFetch);
    expect(fakeFetch).toHaveBeenCalledWith(
      'http://localhost:3333/api/auth/login',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );

    await fetchCurrentAccount(fakeFetch);
    expect(fakeFetch).toHaveBeenCalledWith(
      'http://localhost:3333/api/auth/me',
      expect.objectContaining({
        method: 'GET',
        credentials: 'include',
      }),
    );
  });
});
