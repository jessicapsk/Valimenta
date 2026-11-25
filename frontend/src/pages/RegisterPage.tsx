import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../features/auth/components/RegisterForm.tsx';
import { useAuth } from '../features/auth/context/AuthContext.tsx';
import type { PublicAccountDTO, RegisterAccountInput } from '../features/auth/api/auth.api.ts';

export interface RegisterPageProps {
  onAccountCreated?: (conta: PublicAccountDTO) => void;
  registerFn?: (input: RegisterAccountInput) => Promise<{ conta: PublicAccountDTO }>;
}

export function RegisterPage({ onAccountCreated, registerFn }: RegisterPageProps) {
  const navigate = useNavigate();
  const { setAuthenticatedAccount } = useAuth();

  function handleSuccess(conta: PublicAccountDTO) {
    setAuthenticatedAccount(conta);
    onAccountCreated?.(conta);
    navigate('/alimentos', { replace: true });
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-4 py-8">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Criar conta no Valimenta</h1>
        <p className="mt-1.5 text-sm text-slate-600">
          Gerencie a validade dos seus alimentos em um espaço privado e seguro
        </p>
      </div>

      <RegisterForm onSuccess={handleSuccess} registerFn={registerFn} />

      <p className="mt-6 text-center text-sm text-slate-600">
        Já possui uma conta?{' '}
        <Link
          to="/login"
          className="font-semibold text-emerald-700 underline hover:text-emerald-800"
        >
          Fazer login
        </Link>
      </p>
    </main>
  );
}
