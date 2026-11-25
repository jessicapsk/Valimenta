import { useState, type FormEvent } from 'react';
import { AlertCircle, CheckCircle2, UserPlus } from 'lucide-react';
import {
  ApiError,
  registerAccount,
  type PublicAccountDTO,
  type RegisterAccountInput,
} from '../api/auth.api.ts';

export interface RegisterFormProps {
  onSuccess?: (conta: PublicAccountDTO) => void;
  registerFn?: (input: RegisterAccountInput) => Promise<{ conta: PublicAccountDTO }>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function RegisterForm({ onSuccess, registerFn = registerAccount }: RegisterFormProps) {
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

    if (senha.length < 8) {
      setSenhaError('A senha deve conter no mínimo 8 caracteres.');
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
      const response = await registerFn({
        email: email.trim().toLowerCase(),
        senha,
      });
      onSuccess?.(response.conta);
    } catch (error: unknown) {
      if (error instanceof ApiError) {
        setApiError(error.message);
      } else {
        setApiError('Erro inesperado ao criar conta. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-label="Formulário de criação de conta"
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
        <label htmlFor="register-email" className="block text-sm font-medium text-slate-800">
          E-mail
        </label>
        <input
          id="register-email"
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
          aria-describedby={emailError ? 'register-email-error' : undefined}
          placeholder="seu@email.com"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
        />
        {emailError && (
          <p
            id="register-email-error"
            role="alert"
            className="flex items-center gap-1.5 text-xs font-medium text-red-700"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{emailError}</span>
          </p>
        )}
      </div>

      <div className="space-y-1.5">
        <label htmlFor="register-password" className="block text-sm font-medium text-slate-800">
          Senha
        </label>
        <input
          id="register-password"
          name="senha"
          type="password"
          autoComplete="new-password"
          required
          value={senha}
          onChange={(e) => {
            setSenha(e.target.value);
            if (senhaError) setSenhaError(null);
          }}
          aria-invalid={senhaError ? 'true' : 'false'}
          aria-describedby="register-password-hint register-password-error"
          placeholder="Mínimo de 8 caracteres"
          className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:outline-none"
        />
        <p id="register-password-hint" className="flex items-center gap-1 text-xs text-slate-600">
          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-slate-500" aria-hidden="true" />
          <span>Use ao menos 8 caracteres (RN19).</span>
        </p>
        {senhaError && (
          <p
            id="register-password-error"
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
        <UserPlus className="h-4 w-4" aria-hidden="true" />
        <span>{isSubmitting ? 'Criando conta...' : 'Criar conta'}</span>
      </button>
    </form>
  );
}
