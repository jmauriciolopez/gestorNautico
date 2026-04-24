import { GuarderiaSelector } from '../components/GuarderiaSelector';
import { useAuth } from '../../auth/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Role } from '../../../types';
import { Anchor } from 'lucide-react';

/**
 * Página de aterrizaje para seleccionar tenant (usada como fallback en errores 403/404 de multi-tenancy)
 */
export default function SelectTenantPage() {
    const { user } = useAuth();

    // Si no es SuperAdmin, redirigir al inicio (su tenant se inicializa automáticamente)
    if (user && user.role !== Role.SUPERADMIN) {
        return <Navigate to="/" replace />;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-primary)] p-6">
            <div className="w-full max-w-md p-8 rounded-3xl bg-[var(--bg-secondary)] border border-[var(--border-primary)] shadow-2xl text-center">
                <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-2xl bg-[var(--accent-primary)] shadow-lg shadow-indigo-500/20">
                        <Anchor size={32} className="text-white" />
                    </div>
                </div>
                
                <h1 className="text-2xl font-black mb-2 text-[var(--text-primary)]">Seleccionar Sede</h1>
                <p className="text-[var(--text-secondary)] mb-8 text-sm leading-relaxed">
                    Has intentado acceder a un recurso restringido. <br />
                    Selecciona una guardería válida o utiliza el modo <b>Global</b>.
                </p>

                <div className="flex flex-col gap-4 items-center">
                    {/* Reutilizamos el selector premium */}
                    <div className="scale-110 py-2">
                        <GuarderiaSelector />
                    </div>
                    
                    <button 
                        onClick={() => window.location.href = '/'}
                        className="mt-6 w-full py-3 rounded-xl bg-[var(--accent-primary)] text-sm font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all shadow-lg shadow-indigo-500/20"
                    >
                        Ir al Panel de Control
                    </button>
                </div>
            </div>
        </div>
    );
}
