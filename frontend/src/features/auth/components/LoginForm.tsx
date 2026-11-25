import { useState, type FormEvent } from 'react';
import { AlertCircle, LogIn } from 'lucide-react';
import {
  ApiError,
  loginAccount,
  type LoginAccountInput,
  type PublicAccountDTO,
} from '../api/auth.api.ts';

export interface LoginFormProps {
  onSuccess?: (conta: PublicAccountDTO) => void;
  loginFn?: (input: LoginAccountInput) => Promise<{ conta: PublicAccountDTO }>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function LoginForm({ onSuccess, loginFn = loginAccount }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [senhaError, setSenhaError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function validateFields(): boolean {
    let valid = true;
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !EMAIL_REGEX.test(trimmedEmail)) {
      setEmailError('Informe um endereço de e-mail válido.');
      valid = false;
    } else {
      setEmailError(null);
    }

    if (!senha) {
      setSenhaError('A senha é obrigatória.');
      valid = false;
    } else {
      setSenhaError(null);
    }

    return valid;
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setApiError(null);

    if (!validateFields()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await loginFn({
        email: email.trim().toLowerCase(),
        senha,
      });
      onSuccess?.(response.conta);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError('E-mail ou senha incorretos.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Formulário de login"
      className="w-full max-w-md space-y-5 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      {apiError && (
        <div
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2.5 rounded-lg border border-red-300 bg-red-50 p-3.5 text-sm text-red-900"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-700" aria-hidden="true" />
          <span>{apiError}</span>
        </div>
      )}

      <div className="space-y-1.5">
        <label htmlFor="login-email" className="block text-sm font-medium text-slate-800">
          E-mail
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (emailError) setEmailError(null);
          }}
          aria-invalid={emailError ? 'true' : 'false'}
          aria-describedby={emailError ? 'login-email-error' : undefined}
          placeholder="seu@email.com"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
        />
        {emailError && (
          <p
            id="login-email-error"
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-red-700"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{emailError}</span>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="login-password" className="block text-sm font-medium text-slate-800">
          Senha
        </label>
        <input
          id="login-password"
          name="senha"
          type="password"
          autoComplete="current-password"
          required
          value={senha}
          onChange={(e) => {
            setSenha(e.target.value);
            if (senhaError) setSenhaError(null);
          }}
          aria-invalid={senhaError ? 'true' : 'false'}
          aria-describedby={senhaError ? 'login-password-error' : undefined}
          placeholder="Sua senha"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
        />
        {senhaError && (
          <p
            id="login-password-error"
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-red-700"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{senhaError}</span>
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-emerald-800 focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2 focus:outline-none disabled:opacity-60"
      >
        <LogIn className="h-4 w-4" aria-hidden="true" />
        <span>{isSubmitting ? 'Entrando...' : 'Entrar'}</span>
      </button>
    </form>
  );
}
