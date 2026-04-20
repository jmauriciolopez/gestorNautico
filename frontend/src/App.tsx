import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './api/queryClient';
import { AuthProvider, useAuth } from './features/auth/context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Role } from './types';
import AppLayout from './components/layout/AppLayout';
import { Login } from './features/auth/Login';
import { ThemeProvider } from './context/ThemeContext';
import { Toaster } from 'react-hot-toast';
import { ConfirmProvider } from './shared/context/ConfirmContext';

// === Feature Pages ===
import DashboardRouter from './features/dashboard/pages/DashboardRouter';
import ClientesList from './features/clientes/pages/ClientesList';
import ClienteForm from './features/clientes/pages/ClienteForm';
import EmbarcacionesList from './features/embarcaciones/pages/EmbarcacionesList';
import EmbarcacionForm from './features/embarcaciones/pages/EmbarcacionForm';
import OperacionesPage from './features/operaciones/pages/OperacionesPage';
import InfraestructuraPage from './features/infraestructura/pages/InfraestructuraPage';
import FinanzasPage from './features/finanzas/pages/FinanzasPage';
import ServiciosPage from './features/servicios/pages/ServiciosPage';
import FacturacionPage from './features/facturacion/pages/FacturacionPage';
import UsersPage from './features/users/pages/UsersPage';
import SolicitudBajadaPublica from './features/operaciones/pages/SolicitudBajadaPublica';
import ConfiguracionPage from './features/configuracion/pages/ConfiguracionPage';
import UserHelp from './features/help/components/UserHelp';
import ReportesPage from './features/reportes/pages/ReportesPage';

// Componente simple para Login Helper
const LoginWrapper = () => {
  const { login, isAuthenticated } = useAuth();
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Login onLoginSuccess={login} />;
};

// Componente Unauthorized
const Unauthorized = () => (
  <div className="flex h-screen items-center justify-center bg-[var(--bg-primary)] text-[var(--text-primary)] font-sans">
    <div className="text-center p-8 bg-[var(--bg-secondary)]/50 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl">
      <h1 className="text-4xl font-bold text-red-500 mb-4">403</h1>
      <p className="text-[var(--text-secondary)] mb-6 font-medium">No tienes permisos para acceder a esta sección.</p>
      <button
        onClick={() => window.location.href = '/'}
        className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors font-bold"
      >
        Volver al Inicio
      </button>
    </div>
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <Toaster 
            position="top-right"
            toastOptions={{
              className: 'dark:bg-slate-900 dark:text-white border border-slate-800',
              duration: 4000,
            }}
          />
          <AuthProvider>
            <ConfirmProvider>
              <Routes>
                <Route path="/login" element={<LoginWrapper />} />
                <Route path="/bajada-publica" element={<SolicitudBajadaPublica />} />
                <Route path="/unauthorized" element={<Unauthorized />} />

                {/* Rutas Protegidas */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<DashboardRouter />} />

                    {/* Operativo — todos los roles */}
                    <Route path="clientes" element={<ClientesList />} />
                    <Route path="clientes/nuevo" element={<ClienteForm />} />
                    <Route path="clientes/editar/:id" element={<ClienteForm />} />

                    <Route path="embarcaciones" element={<EmbarcacionesList />} />
                    <Route path="embarcaciones/nueva" element={<EmbarcacionForm />} />
                    <Route path="embarcaciones/editar/:id" element={<EmbarcacionForm />} />

                    <Route path="operaciones" element={<OperacionesPage />} />
                    <Route path="infraestructura" element={<InfraestructuraPage />} />
                    <Route path="servicios" element={<ServiciosPage />} />
                    <Route path="ayuda" element={<UserHelp />} />

                    {/* Finanzas y Facturación — Supervisor en adelante */}
                    <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN, Role.SUPERADMIN, Role.SUPERVISOR]} />}>
                      <Route path="finanzas" element={<FinanzasPage />} />
                      <Route path="facturacion" element={<FacturacionPage />} />
                      <Route path="reportes" element={<ReportesPage />} />
                    </Route>

                    {/* Configuración — Admin en adelante */}
                    <Route element={<ProtectedRoute allowedRoles={[Role.ADMIN, Role.SUPERADMIN]} />}>
                      <Route path="configuracion" element={<ConfiguracionPage />} />
                    </Route>

                    {/* Usuarios — solo SuperAdmin */}
                    <Route element={<ProtectedRoute allowedRoles={[Role.SUPERADMIN]} />}>
                      <Route path="usuarios/*" element={<UsersPage />} />
                    </Route>
                  </Route>
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </ConfirmProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
