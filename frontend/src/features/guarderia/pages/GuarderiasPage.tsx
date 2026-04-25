import { useState } from 'react';
import { useGuarderiasManagement } from '../hooks/useGuarderiasManagement';
import { 
    Building2, Plus, Users, Edit2, Trash2, MapPin, Phone, Mail, Globe, 
    ArrowRight, LayoutGrid, CheckCircle2, AlertCircle 
} from 'lucide-react';
import { GuarderiaFormModal } from '../components/GuarderiaFormModal';
import { GuarderiaAdminModal } from '../components/GuarderiaAdminModal';
import { Guarderia } from '../../../types';

export default function GuarderiasPage() {
    const { 
        guarderias, 
        isLoading, 
        createGuarderia, 
        updateGuarderia, 
        removeGuarderia 
    } = useGuarderiasManagement();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isAdminOpen, setIsAdminOpen] = useState(false);
    const [selectedGuarderia, setSelectedGuarderia] = useState<Guarderia | null>(null);

    const handleEdit = (g: Guarderia) => {
        setSelectedGuarderia(g);
        setIsFormOpen(true);
    };

    const handleCreate = () => {
        setSelectedGuarderia(null);
        setIsFormOpen(true);
    };

    const handleAssignAdmin = (g: Guarderia) => {
        setSelectedGuarderia(g);
        setIsAdminOpen(true);
    };

    const handleSave = (data: Partial<Guarderia>) => {
        if (selectedGuarderia) {
            updateGuarderia.mutate({ id: selectedGuarderia.id, ...data });
        } else {
            createGuarderia.mutate(data);
        }
        setIsFormOpen(false);
    };

    return (
        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Gestión de Sedes</h1>
                    <p className="text-[var(--text-secondary)] mt-1 font-medium">Administra las guarderías del sistema multi-tenant</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="flex items-center justify-center gap-2 px-6 py-3.5 bg-[var(--accent-primary)] text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/25 hover:brightness-110 active:scale-95 transition-all"
                >
                    <Plus size={20} />
                    Nueva Sede
                </button>
            </div>

            {/* Stats / Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bento-card p-6 bg-gradient-to-br from-indigo-500/10 to-transparent border-indigo-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-indigo-500 text-white shadow-lg">
                            <Building2 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Total Sedes</p>
                            <h3 className="text-2xl font-black text-[var(--text-primary)]">{guarderias.length}</h3>
                        </div>
                    </div>
                </div>
                
                <div className="bento-card p-6 bg-gradient-to-br from-emerald-500/10 to-transparent border-emerald-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-emerald-500 text-white shadow-lg">
                            <CheckCircle2 size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Activas</p>
                            <h3 className="text-2xl font-black text-[var(--text-primary)]">
                                {guarderias.filter(g => g.activo).length}
                            </h3>
                        </div>
                    </div>
                </div>

                <div className="bento-card p-6 bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/20">
                    <div className="flex items-center gap-4">
                        <div className="p-3 rounded-2xl bg-amber-500 text-white shadow-lg">
                            <LayoutGrid size={24} />
                        </div>
                        <div>
                            <p className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest">Infraestructura</p>
                            <h3 className="text-2xl font-black text-[var(--text-primary)]">Global</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bento-card h-64 animate-pulse bg-[var(--bg-soft)]" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {guarderias.map(g => (
                        <div key={g.id} className="bento-card group hover:border-[var(--accent-primary)] transition-all duration-300 overflow-hidden">
                            <div className="p-6 space-y-4">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-[var(--bg-primary)] border border-[var(--border-primary)] flex items-center justify-center text-2xl font-black text-[var(--accent-primary)] overflow-hidden">
                                            {g.logo ? (
                                                <img src={g.logo} alt={g.nombre} className="w-full h-full object-cover" />
                                            ) : (
                                                g.nombre.charAt(0)
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-lg text-[var(--text-primary)] group-hover:text-[var(--accent-primary)] transition-colors">
                                                {g.nombre}
                                            </h3>
                                            <div className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                                                <Users size={10} />
                                                {g.contacto}
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                                        g.activo ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                    }`}>
                                        {g.activo ? 'Activa' : 'Inactiva'}
                                    </div>
                                </div>

                                <div className="space-y-2.5 pt-2 border-t border-[var(--border-primary)]/50">
                                    <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)] font-medium">
                                        <MapPin size={14} className="text-[var(--text-muted)] flex-shrink-0" />
                                        <span className="truncate">
                                            {g.direccion || 'Sin dirección'}
                                            {(g.ciudad || g.pais) && (
                                                <span className="text-[var(--text-muted)] ml-1">
                                                    • {g.ciudad}{g.ciudad && g.pais ? ', ' : ''}{g.pais}
                                                </span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)] font-medium">
                                        <Phone size={14} className="text-[var(--text-muted)]" />
                                        <span>{g.telefono || 'Sin teléfono'}</span>
                                    </div>
                                    <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)] font-medium">
                                        <Mail size={14} className="text-[var(--text-muted)] flex-shrink-0" />
                                        <span className="truncate">{g.email || 'Sin email'}</span>
                                    </div>
                                    {g.trialStartedAt && (
                                        <div className="flex items-center gap-2.5 text-sm text-[var(--text-secondary)] font-medium">
                                            <Globe size={14} className="text-[var(--text-muted)] flex-shrink-0" />
                                            <span>Trial: {new Date(g.trialStartedAt).toLocaleDateString('es-AR')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 pt-4">
                                    <button 
                                        onClick={() => handleAssignAdmin(g)}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-amber-500/10 text-amber-500 hover:bg-amber-500 text-xs font-black uppercase tracking-wider hover:text-white transition-all"
                                    >
                                        <Users size={14} />
                                        Admin
                                    </button>
                                    <button 
                                        onClick={() => handleEdit(g)}
                                        className="p-2.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-secondary)] hover:text-[var(--accent-primary)] hover:border-[var(--accent-primary)] transition-all"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    {g.activo ? (
                                        <button 
                                            onClick={() => removeGuarderia.mutate(g.id)}
                                            className="p-2.5 rounded-xl bg-red-500/5 border border-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                                            title="Desactivar Sede"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={() => updateGuarderia.mutate({ id: g.id, activo: true })}
                                            className="p-2.5 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all"
                                            title="Reactivar Sede"
                                        >
                                            <CheckCircle2 size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!isLoading && guarderias.length === 0 && (
                <div className="bento-card py-20 flex flex-col items-center justify-center text-center">
                    <div className="p-6 rounded-3xl bg-[var(--bg-primary)] mb-6 text-[var(--text-muted)]">
                        <Building2 size={48} strokeWidth={1.5} />
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-primary)]">No hay sedes registradas</h3>
                    <p className="text-[var(--text-secondary)] mt-2 max-w-sm">
                        Comienza creando la primera guardería para habilitar el sistema multi-tenant.
                    </p>
                    <button
                        onClick={handleCreate}
                        className="mt-8 px-8 py-3.5 bg-[var(--accent-primary)] text-white rounded-2xl font-bold shadow-lg shadow-indigo-500/25 flex items-center gap-2"
                    >
                        <Plus size={20} />
                        Crear Primera Sede
                    </button>
                </div>
            )}

            {/* Modals */}
            <GuarderiaFormModal 
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSave}
                guarderia={selectedGuarderia}
                isSubmitting={createGuarderia.isPending || updateGuarderia.isPending}
            />

            {selectedGuarderia && (
                <GuarderiaAdminModal 
                    isOpen={isAdminOpen}
                    onClose={() => setIsAdminOpen(false)}
                    guarderiaId={selectedGuarderia.id}
                    guarderiaNombre={selectedGuarderia.nombre}
                />
            )}
        </div>
    );
}
