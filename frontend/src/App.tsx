import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './api/queryClient';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Role } from './types';
import AppLayout from './components/layout/AppLayout';
import { Login } from './features/auth/Login';
import Dashboard from './pages/Dashboard';
import ClientesList from './pages/ClientesList';
import ClienteForm from './pages/ClienteForm';
import EmbarcacionesList from './pages/EmbarcacionesList';
import EmbarcacionForm from './pages/EmbarcacionForm';
import Operaciones from './pages/Operaciones';
import Finanzas from './pages/Finanzas';
import Infraestructura from './pages/Infraestructura';

// Componente simple para Login Helper
const LoginWrapper = () => {
  const { login, isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Login onLoginSuccess={login} />;
};

// Componente Unauthorized
const Unauthorized = () => (
    <div className="flex h-screen items-center justify-center bg-slate-950 text-white">
        <div className="text-center p-8 bg-slate-900/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl">
            <h1 className="text-4xl font-bold text-red-500 mb-4">403</h1>
            <p className="text-slate-400 mb-6">No tienes permisos para acceder a esta sección.</p>
            <button 
                onClick={() => window.location.href = '/'}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors"
            >
                Volver al Inicio
            </button>
        </div>
    </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<LoginWrapper />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Rutas Protegidas */}
            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<AppLayout />}>
                <Route index element={<Dashboard />} />
                
                {/* Gestión General (Admin & Operador) */}
                <Route path="clientes" element={<ClientesList />} />
                <Route path="clientes/nuevo" element={<ClienteForm />} />
                <Route path="clientes/editar/:id" element={<ClienteForm />} />
                
                <Route path="embarcaciones" element={<EmbarcacionesList />} />
                <Route path="embarcaciones/nueva" element={<EmbarcacionForm />} />
                <Route path="embarcaciones/editar/:id" element={<EmbarcacionForm />} />
                
                <Route path="operaciones" element={<Operaciones />} />
                <Route path="infraestructura" element={<Infraestructura />} />

                {/* Ruta de Finanzas (Solo Admin/SuperAdmin) */}
                <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN, Role.SUPERADMIN]} />}>
                    <Route path="finanzas" element={<Finanzas />} />
                </Route>
              </Route>
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
