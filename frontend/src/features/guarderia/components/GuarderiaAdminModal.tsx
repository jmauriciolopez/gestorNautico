import { useState } from 'react';
import { X, UserPlus, ShieldCheck, Mail, Lock, User } from 'lucide-react';
import { httpClient } from '../../../shared/api/HttpClient';
import { toast } from 'react-hot-toast';
import { Role } from '../../../types';

interface GuarderiaAdminModalProps {
    isOpen: boolean;
    onClose: () => void;
    guarderiaId: number;
    guarderiaNombre: string;
}

export function GuarderiaAdminModal({ isOpen, onClose, guarderiaId, guarderiaNombre }: GuarderiaAdminModalProps) {
    const [formData, setFormData] = useState({
        nombre: '',
        usuario: '',
        clave: '',
        email: '',
        role: Role.ADMIN,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await httpClient.post('/users', {
                ...formData,
                guarderiaId,
            });
            toast.success(`Administrador creado para ${guarderiaNombre}`);
            onClose();
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Error al crear el administrador');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl w-full max-w-md shadow-2xl overflow-hidden scale-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-bottom border-[var(--border-primary)]">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                            <ShieldCheck size={20} />
                        </div>
                        <div>
                            <h2 className="text-lg font-black text-[var(--text-primary)]">Asignar Administrador</h2>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{guarderiaNombre}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-soft)] transition-colors">
                        <X size={20} className="text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Nombre Completo</label>
                            <div className="relative">
                                <User className="absolute left-4 top-3.5 text-[var(--text-muted)]" size={18} />
                                <input
                                    required
                                    type="text"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="Ej: Juan Pérez"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Nombre de Usuario</label>
                            <input
                                required
                                type="text"
                                value={formData.usuario}
                                onChange={e => setFormData({ ...formData, usuario: e.target.value.toLowerCase() })}
                                className="w-full px-4 py-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="juan.perez"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Email Corporativo</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-3.5 text-[var(--text-muted)]" size={18} />
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="admin@sede.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Contraseña Temporal</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-3.5 text-[var(--text-muted)]" size={18} />
                                <input
                                    required
                                    type="password"
                                    value={formData.clave}
                                    onChange={e => setFormData({ ...formData, clave: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-4">
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="w-full py-4 rounded-xl bg-[var(--accent-primary)] text-sm font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                            <UserPlus size={18} />
                            {isSubmitting ? 'Creando...' : 'Crear Administrador'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full mt-3 py-3 rounded-xl text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
