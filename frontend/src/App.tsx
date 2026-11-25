import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
import { ProtectedRoute } from './features/auth/components/ProtectedRoute.tsx';
import { AuthProvider } from './features/auth/context/AuthContext.tsx';
import { LoginPage } from './pages/LoginPage.tsx';
import { RegisterPage } from './pages/RegisterPage.tsx';

function HomeRedirectView() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-slate-900">Valimenta</h1>
      <p className="mt-2 text-sm text-slate-600">
        Sistema de Controle Doméstico de Validade de Alimentos
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          to="/login"
          className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-100"
        >
          Entrar
        </Link>
        <Link
          to="/cadastro"
          className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
        >
          Criar conta
        </Link>
      </div>
    </main>
  );
}

function FoodsEmptyPlaceholderView() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-slate-900">Minha Despensa</h1>
      <p className="mt-2 text-sm text-slate-600">Nenhum alimento cadastrado no momento.</p>
    </main>
  );
}

function HistoryPlaceholderView() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-slate-900">Histórico de Movimentações</h1>
    </main>
  );
}

function WastePlaceholderView() {
  return (
    <main className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold text-slate-900">Painel de Desperdício</h1>
    </main>
  );
}

export function App() {
  return (
    <AuthProvider skipInitialCheck>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirectView />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/cadastro" element={<RegisterPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/alimentos" element={<FoodsEmptyPlaceholderView />} />
            <Route path="/historico" element={<HistoryPlaceholderView />} />
            <Route path="/desperdicio" element={<WastePlaceholderView />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
