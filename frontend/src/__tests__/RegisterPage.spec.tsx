import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  ApiError,
  registerAccount,
  type PublicAccountDTO,
  type RegisterAccountInput,
} from '../features/auth/api/auth.api.ts';
import { RegisterPage } from '../pages/RegisterPage.tsx';

afterEach(() => {
  cleanup();
});

function renderRegisterFlow(
  registerFn?: (input: RegisterAccountInput) => Promise<{ conta: PublicAccountDTO }>,
) {
  return render(
    <MemoryRouter initialEntries={['/cadastro']}>
      <Routes>
        <Route path="/cadastro" element={<RegisterPage registerFn={registerFn} />} />
        <Route
          path="/alimentos"
          element={
            <main>
              <h1>Minha Despensa</h1>
              <p>Nenhum alimento cadastrado no momento.</p>
            </main>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('RegisterPage & RegisterForm — US01 Criar Conta (Issue #26)', () => {
  it('Cenário 1 e 5: deve submeter dados válidos, autenticar e redirecionar para /alimentos exibindo a lista vazia (RN17)', async () => {
    const registerMock = vi.fn(async (input: RegisterAccountInput) => ({
      conta: {
        id: '11111111-1111-4111-8111-111111111111',
        email: input.email,
      },
    }));

    renderRegisterFlow(registerMock);

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: '  Novo@Valimenta.com ' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'senhaSegura123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      expect(registerMock).toHaveBeenCalledWith({
        email: 'novo@valimenta.com',
        senha: 'senhaSegura123',
      });
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /minha despensa/i })).toBeDefined();
      expect(screen.getByText(/nenhum alimento cadastrado no momento\./i)).toBeDefined();
    });
  });

  it('Cenário 2 (RN18): deve exibir alerta acessível "Este e-mail já está em uso." quando a API retornar HTTP 409', async () => {
    const registerMock = vi.fn(async () => {
      throw new ApiError('Este e-mail já está em uso.', 409, 'EMAIL_ALREADY_IN_USE');
    });

    renderRegisterFlow(registerMock);

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'usuario@teste.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'senhaSegura123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    await waitFor(() => {
      const alert = screen.getByRole('alert');
      expect(alert.textContent).toContain('Este e-mail já está em uso.');
    });
  });

  it('Cenário 3: deve bloquear o envio e exibir "Informe um endereço de e-mail válido." para formato incorreto', async () => {
    const registerMock = vi.fn();
    renderRegisterFlow(registerMock);

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'email-invalido' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: 'senhaSegura123' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(registerMock).not.toHaveBeenCalled();
    expect(screen.getByText('Informe um endereço de e-mail válido.')).toBeDefined();
  });

  it('Cenário 4 (RN19): deve bloquear o envio e exibir "A senha deve conter no mínimo 8 caracteres." para senha curta', async () => {
    const registerMock = vi.fn();
    renderRegisterFlow(registerMock);

    fireEvent.change(screen.getByLabelText(/e-mail/i), {
      target: { value: 'valido@teste.com' },
    });
    fireEvent.change(screen.getByLabelText(/senha/i), {
      target: { value: '1234567' },
    });
    fireEvent.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(registerMock).not.toHaveBeenCalled();
    expect(screen.getByText('A senha deve conter no mínimo 8 caracteres.')).toBeDefined();
  });

  it('registerAccount deve enviar requisição POST com credentials: "include" para receber o cookie HttpOnly', async () => {
    const fakeFetch = vi.fn(async () => ({
      ok: true,
      status: 201,
      json: async () => ({
        conta: { id: '11111111-1111-4111-8111-111111111111', email: 'a@b.com' },
      }),
    })) as unknown as typeof fetch;

    const result = await registerAccount({ email: 'a@b.com', senha: '12345678' }, fakeFetch);
    expect(result.conta.email).toBe('a@b.com');
    expect(fakeFetch).toHaveBeenCalledWith(
      'http://localhost:3333/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        credentials: 'include',
      }),
    );
  });
});
