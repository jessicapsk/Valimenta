import { BrowserRouter, Link, Route, Routes } from 'react-router-dom';
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

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomeRedirectView />} />
        <Route path="/cadastro" element={<RegisterPage />} />
        <Route path="/alimentos" element={<FoodsEmptyPlaceholderView />} />
      </Routes>
    </BrowserRouter>
  );
}
