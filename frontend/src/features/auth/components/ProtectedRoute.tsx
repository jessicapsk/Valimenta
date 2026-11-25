import type { ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';

export interface ProtectedRouteProps {
  children?: ReactNode;
}

/**
 * Guardião de Rotas Protegidas (US02 Cenário 5 / RN17 / RNF06):
 * Bloqueia visitantes não autenticados e redireciona para /login.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { conta, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        role="status"
        aria-live="polite"
        className="flex min-h-screen items-center justify-center p-4 text-sm text-slate-600"
      >
        Verificando sessão...
      </div>
    );
  }

  if (!conta) {
    return <Navigate to="/login" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
}
