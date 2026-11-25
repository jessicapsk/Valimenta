import { Link, useNavigate } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm.tsx';
import { useAuth } from '../features/auth/context/AuthContext.tsx';
import type { LoginAccountInput, PublicAccountDTO } from '../features/auth/api/auth.api.ts';

export interface LoginPageProps {
  onLoginSuccess?: (conta: PublicAccountDTO) => void;
  loginFn?: (input: LoginAccountInput) => Promise<{ conta: PublicAccountDTO }>;
}

export function LoginPage({ onLoginSuccess, loginFn }: LoginPageProps) {
  const navigate = useNavigate();
  const { setAuthenticatedAccount } = useAuth();

  function handleSuccess(conta: PublicAccountDTO) {
    setAuthenticatedAccount(conta);
    onLoginSuccess?.(conta);
    navigate('/alimentos', { replace: true });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Entrar no Valimenta</h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Acesse sua despensa e acompanhe a validade dos seus alimentos
        </p>
      </div>

      <LoginForm onSuccess={handleSuccess} loginFn={loginFn} />

      <p className="mt-6 text-center text-sm text-slate-600">
        Ainda não possui uma conta?{' '}
        <Link
          to="/cadastro"
          className="font-semibold text-emerald-700 underline hover:text-emerald-800"
        >
          Criar conta
        </Link>
      </p>
    </main>
  );
}
