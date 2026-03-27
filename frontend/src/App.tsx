import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { queryClient } from './api/queryClient';
import { AuthProvider } from './features/auth/context/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import ClientesList from './pages/ClientesList';
import ClienteForm from './pages/ClienteForm';
import EmbarcacionesList from './pages/EmbarcacionesList';
import EmbarcacionForm from './pages/EmbarcacionForm';
import Operaciones from './pages/Operaciones';
import Finanzas from './pages/Finanzas';

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Dashboard />} />
              <Route path="clientes" element={<ClientesList />} />
              <Route path="clientes/nuevo" element={<ClienteForm />} />
              <Route path="clientes/editar/:id" element={<ClienteForm />} />
              <Route path="embarcaciones" element={<EmbarcacionesList />} />
              <Route path="embarcaciones/nueva" element={<EmbarcacionForm />} />
              <Route path="embarcaciones/editar/:id" element={<EmbarcacionForm />} />
              <Route path="operaciones" element={<Operaciones />} />
              <Route path="finanzas" element={<Finanzas />} />
            </Route>
          </Routes>
        </AuthProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}

export default App;
