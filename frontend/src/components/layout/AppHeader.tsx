import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../features/auth/context/AuthContext.tsx';

/**
 * AppHeader (US04 — Fazer logout / RN17 / RNF03 / RNF04 / RNF06):
 * Cabeçalho responsivo das telas autenticadas com ação explícita de encerramento de sessão,
 * limpeza imediata do estado em memória e substituição do histórico de navegação.
 */
export function AppHeader() {
  const { conta, logout } = useAuth();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }
    setIsLoggingOut(true);
    try {
      await logout();
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <header className="w-full border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-6">
          <Link to="/alimentos" className="text-lg font-bold text-emerald-800">
            Valimenta
          </Link>
          <nav
            aria-label="Navegação principal"
            className="flex flex-wrap items-center gap-4 text-sm"
          >
            <Link to="/alimentos" className="font-medium text-slate-700 hover:text-emerald-700">
              Despensa
            </Link>
            <Link to="/historico" className="font-medium text-slate-700 hover:text-emerald-700">
              Histórico
            </Link>
            <Link to="/desperdicio" className="font-medium text-slate-700 hover:text-emerald-700">
              Desperdício
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {conta && (
            <span className="text-xs font-medium text-slate-600" aria-label="Conta autenticada">
              {conta.email}
            </span>
          )}
          <button
            type="button"
            onClick={handleLogout}
            disabled={isLoggingOut}
            aria-label="Sair"
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 transition-colors hover:bg-slate-100 focus:ring-2 focus:ring-emerald-600 focus:outline-none disabled:opacity-60"
          >
            <LogOut className="h-3.5 w-3.5 text-slate-700" aria-hidden="true" />
            <span>{isLoggingOut ? 'Saindo...' : 'Sair'}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
