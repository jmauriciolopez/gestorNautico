import { useState, useEffect } from 'react';
import { useGuarderias } from '../hooks/useGuarderias';
import { httpClient } from '../../../shared/api/HttpClient';
import { useAuth } from '../../auth/hooks/useAuth';
import { useQueryClient } from '@tanstack/react-query';
import { Building2, ChevronDown } from 'lucide-react';
import { Role } from '../../../types';

/**
 * Componente que permite a los SUPERADMIN cambiar de guardería (tenant) dinámicamente.
 */
export const GuarderiaSelector = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const { data: guarderias, isLoading } = useGuarderias();
    
    // El guarderiaId actual viene del localStorage
    const [selectedId, setSelectedId] = useState<string>(localStorage.getItem('guarderiaId') || '');

    // Sincronizar si cambia externamente (ej: logout/login)
    useEffect(() => {
        const checkStorage = () => {
            const current = localStorage.getItem('guarderiaId') || '';
            if (current !== selectedId) {
                setSelectedId(current);
            }
        };

        window.addEventListener('storage', checkStorage);
        return () => window.removeEventListener('storage', checkStorage);
    }, [selectedId]);

    // Solo mostrar para SUPERADMIN
    if (user?.role !== Role.SUPERADMIN) return null;

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newId = e.target.value;
        setSelectedId(newId);
        
        // 5.4 Persistir guarderiaIdActivo en localStorage vía HttpClient
        httpClient.setGuarderiaActiva(newId);
        
        // 5.5 Forzar refetch al cambiar de guardería invalidando todas las queries
        // Esto hará que todas las tablas y dashboards se recarguen con el nuevo x-guarderia-id
        queryClient.invalidateQueries();
    };

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-primary)] transition-all hover:border-[var(--border-strong)] shadow-sm">
            <Building2 size={15} className="text-[var(--accent-primary)] shrink-0" />
            <div className="relative flex items-center">
                <select
                    value={selectedId}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="appearance-none bg-transparent border-none outline-none text-[12px] font-bold text-[var(--text-primary)] cursor-pointer pr-5 h-6"
                    style={{ minWidth: '140px' }}
                >
                    <option value="" className="bg-[var(--bg-secondary)] text-[var(--text-primary)]">
                        Todas las Sedes (Global)
                    </option>
                    {guarderias?.map((g) => (
                        <option 
                            key={g.id} 
                            value={g.id.toString()}
                            className="bg-[var(--bg-secondary)] text-[var(--text-primary)]"
                        >
                            {g.nombre}
                        </option>
                    ))}
                </select>
                <ChevronDown 
                    size={13} 
                    className="absolute right-0 text-[var(--text-muted)] pointer-events-none" 
                />
            </div>
        </div>
    );
};
