import { useState } from 'react';
import { LayoutDashboard, Wrench } from 'lucide-react';
import { useAuth } from '../../auth/context/AuthContext';
import { Role } from '../../../types';
import Dashboard from './Dashboard';
import DashboardOperativo from './DashboardOperativo';

/**
 * OPERADOR     → siempre ve DashboardOperativo, sin toggle
 * SUPERVISOR / ADMIN / SUPERADMIN → alternan entre ambas vistas
 */
const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  const isOperador = user?.role === Role.OPERADOR;

  const [view, setView] = useState<'completo' | 'operativo'>(
    isOperador ? 'operativo' : 'completo'
  );

  if (isOperador) {
    return <DashboardOperativo />;
  }

  return (
    <div>

      {/* ── VIEW TOGGLE (solo roles superiores) ────────────────── */}
      <div
        className="flex items-center gap-1 mb-4 w-fit p-1 rounded-xl"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-primary)',
        }}
      >
        <button
          onClick={() => setView('completo')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: view === 'completo'
              ? 'linear-gradient(135deg, #534AB7, #3C3489)'
              : 'transparent',
            color: view === 'completo' ? '#EEEDFE' : 'var(--text-secondary)',
          }}
        >
          <LayoutDashboard size={13} />
          Gerencial
        </button>

        <button
          onClick={() => setView('operativo')}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          style={{
            background: view === 'operativo'
              ? 'linear-gradient(135deg, #1D9E75, #0F6E56)'
              : 'transparent',
            color: view === 'operativo' ? '#E1F5EE' : 'var(--text-secondary)',
          }}
        >
          <Wrench size={13} />
          Operativo
        </button>
      </div>

      {/* ── CONTENIDO ───────────────────────────────────────────── */}
      {view === 'completo' ? <Dashboard /> : <DashboardOperativo />}

    </div>
  );
};

export default DashboardRouter;
