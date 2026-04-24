// Refreshed after context refactor
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './api/queryClient';
import { AuthProvider } from './features/auth/context/AuthProvider';
import { useAuth } from './features/auth/hooks/useAuth';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Role } from './types';
import AppLayout from './components/layout/AppLayout';
import { Login } from './features/auth/Login';
import { ThemeProvider } from './context/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import { ConfirmProvider } from './shared/context/ConfirmProvider';

// === Lazy Loaded Pages ===
const DashboardRouter = lazy(() => import('./features/dashboard/pages/DashboardRouter'));
const ClientesList = lazy(() => import('./features/clientes/pages/ClientesList'));
const ClienteForm = lazy(() => import('./features/clientes/pages/ClienteForm'));
const EmbarcacionesList = lazy(() => import('./features/embarcaciones/pages/EmbarcacionesList'));
const EmbarcacionForm = lazy(() => import('./features/embarcaciones/pages/EmbarcacionForm'));
const OperacionesPage = lazy(() => import('./features/operaciones/pages/OperacionesPage'));
const InfraestructuraPage = lazy(() => import('./features/infraestructura/pages/InfraestructuraPage'));
const FinanzasPage = lazy(() => import('./features/finanzas/pages/FinanzasPage'));
const ServiciosPage = lazy(() => import('./features/servicios/pages/ServiciosPage'));
const FacturacionPage = lazy(() => import('./features/facturacion/pages/FacturacionPage'));
const UsersPage = lazy(() => import('./features/users/pages/UsersPage'));
const SolicitudBajadaPublica = lazy(() => import('./features/operaciones/pages/SolicitudBajadaPublica'));
const ConfiguracionPage = lazy(() => import('./features/configuracion/pages/ConfiguracionPage'));
const UserHelp = lazy(() => import('./features/help/components/UserHelp'));
const ReportesPage = lazy(() => import('./features/reportes/pages/ReportesPage'));

// Componente de Carga Premium
const LoadingScreen = () => (
  <div className="flex h-screen w-screen items-center justify-center bg-[var(--bg-primary)]">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-16 h-16 border-4 border-[var(--accent-primary-soft)] rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-t-[var(--accent-primary)] rounded-full animate-spin" />
      </div>
      <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] animate-pulse">
        Cargando Experiencia...
      </p>
    </div>
  </div>
);

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
            position="top-center"
            toastOptions={{
              className: 'dark:bg-slate-900 dark:text-white border border-slate-800',
              duration: 4000,
            }}
          />
          <AuthProvider>
            <ConfirmProvider>
              <Suspense fallback={<LoadingScreen />}>
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
              </Suspense>
            </ConfirmProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
