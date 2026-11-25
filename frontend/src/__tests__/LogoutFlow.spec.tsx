import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Outlet, Route, Routes, useNavigate } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AppHeader } from '../components/layout/AppHeader.tsx';
import { logoutAccount, type PublicAccountDTO } from '../features/auth/api/auth.api.ts';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute.tsx';
import { AuthProvider } from '../features/auth/context/AuthContext.tsx';
import { LoginPage } from '../pages/LoginPage.tsx';

afterEach(() => {
  cleanup();
});

const AUTHENTICATED_USER: PublicAccountDTO = {
  id: '11111111-1111-4111-8111-111111111111',
  email: 'jessica@valimenta.com',
};

function LoginWithBackSimulation() {
  const navigate = useNavigate();
  return (
    <div>
      <LoginPage />
      <button type="button" onClick={() => navigate('/alimentos')}>
        Simular Voltar para Alimentos
      </button>
    </div>
  );
}

function renderAuthenticatedApp(logoutFn?: () => Promise<{ message: string }>) {
  return render(
    <AuthProvider initialAccount={AUTHENTICATED_USER} skipInitialCheck logoutFn={logoutFn}>
      <MemoryRouter initialEntries={['/alimentos']}>
        <Routes>
          <Route path="/login" element={<LoginWithBackSimulation />} />
          <Route element={<ProtectedRoute />}>
            <Route
              element={
                <div>
                  <AppHeader />
                  <Outlet />
                </div>
              }
            >
              <Route
                path="/alimentos"
                element={
                  <main>
                    <h1>Minha Despensa</h1>
                    <p>Item privado da conta: Leite Integral</p>
                  </main>
                }
              />
            </Route>
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}

describe('AppHeader & AuthContext.logout — US04 Fazer Logout (Issue #30)', () => {
  it('Cenário 1: ao clicar em "Sair", deve acionar o endpoint de logout, limpar o estado autenticado em memória e redirecionar para /login (RN17, RNF06)', async () => {
    const logoutMock = vi.fn(async () => ({
      message: 'Sessão encerrada com sucesso.',
    }));

    renderAuthenticatedApp(logoutMock);

    expect(screen.getByText('jessica@valimenta.com')).toBeDefined();
    expect(screen.getByText('Item privado da conta: Leite Integral')).toBeDefined();

    fireEvent.click(screen.getByRole('button', { name: /sair/i }));

    await waitFor(() => {
      expect(logoutMock).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /entrar no valimenta/i })).toBeDefined();
    });

    // Verifica que nenhum dado da conta anterior permanece renderizado na tela (RN17)
    expect(screen.queryByText('jessica@valimenta.com')).toBeNull();
    expect(screen.queryByText('Item privado da conta: Leite Integral')).toBeNull();
  });

  it('Cenário 2: após o logout, deve impedir o retorno às telas protegidas ao tentar voltar para /alimentos, exigindo nova autenticação', async () => {
    const logoutMock = vi.fn(async () => ({
      message: 'Sessão encerrada com sucesso.',
    }));

    renderAuthenticatedApp(logoutMock);

    fireEvent.click(screen.getByRole('button', { name: /sair/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /entrar no valimenta/i })).toBeDefined();
    });

    // Tenta navegar novamente para a rota protegida /alimentos após o logout
    fireEvent.click(screen.getByRole('button', { name: /simular voltar para alimentos/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /entrar no valimenta/i })).toBeDefined();
    });
    expect(screen.queryByText('Item privado da conta: Leite Integral')).toBeNull();
  });

  it('logoutAccount deve enviar requisição POST para /api/auth/logout com credentials: "include" (RNF06)', async () => {
    const fakeFetch = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        message: 'Sessão encerrada com sucesso.',
      }),
    })) as unknown as typeof fetch;

    const result = await logoutAccount(fakeFetch);
    expect(result.message).toBe('Sessão encerrada com sucesso.');
    expect(fakeFetch).toHaveBeenCalledWith(
      'http://localhost:3333/api/auth/logout',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
  });
});
