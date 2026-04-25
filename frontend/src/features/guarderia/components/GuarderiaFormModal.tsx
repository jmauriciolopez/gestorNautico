import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Guarderia } from '../../../types';

interface GuarderiaFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: Partial<Guarderia>) => void;
    guarderia?: Guarderia | null;
    isSubmitting: boolean;
}

export function GuarderiaFormModal({ isOpen, onClose, onSave, guarderia, isSubmitting }: GuarderiaFormModalProps) {
    const [formData, setFormData] = useState<Partial<Guarderia>>({
        nombre: '',
        contacto: '',
        direccion: '',
        telefono: '',
        email: '',
        ciudad: '',
        pais: '',
        logo: '',
        latitud: 0,
        longitud: 0,
        trialStartedAt: '',
        activo: true,
    });

    useEffect(() => {
        if (guarderia) {
            setFormData(guarderia);
        } else {
            setFormData({
                nombre: '',
                contacto: '',
                direccion: '',
                telefono: '',
                email: '',
                ciudad: '',
                pais: '',
                logo: '',
                latitud: 0,
                longitud: 0,
                trialStartedAt: '',
                activo: true,
            });
        }
    }, [guarderia, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Solo enviar los campos que el DTO del backend espera
        const { 
            nombre, contacto, direccion, telefono, email, 
            ciudad, pais, logo, latitud, longitud, 
            trialStartedAt, activo 
        } = formData;

        onSave({ 
            nombre, contacto, direccion, telefono, email, 
            ciudad, pais, logo, latitud, longitud, 
            trialStartedAt, activo 
        });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[var(--bg-secondary)] border border-[var(--border-primary)] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden scale-in duration-200">
                <div className="flex items-center justify-between px-6 py-4 border-bottom border-[var(--border-primary)]">
                    <h2 className="text-xl font-black text-[var(--text-primary)]">
                        {guarderia ? 'Editar Sede' : 'Nueva Sede'}
                    </h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--bg-soft)] transition-colors">
                        <X size={20} className="text-[var(--text-muted)]" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Nombre de la Sede</label>
                            <input
                                required
                                type="text"
                                value={formData.nombre}
                                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="Ej: Guardería del Sol"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Persona de Contacto</label>
                            <input
                                required
                                type="text"
                                value={formData.contacto}
                                onChange={e => setFormData({ ...formData, contacto: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="Nombre del responsable"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Teléfono</label>
                            <input
                                type="text"
                                value={formData.telefono}
                                onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="+54..."
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Email de contacto</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="contacto@sede.com"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Inicio de Trial</label>
                            <input
                                type="date"
                                value={formData.trialStartedAt ? new Date(formData.trialStartedAt).toISOString().split('T')[0] : ''}
                                onChange={e => setFormData({ ...formData, trialStartedAt: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Dirección</label>
                            <input
                                type="text"
                                value={formData.direccion}
                                onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="Av. Libertador 1234..."
                            />
                        </div>

                        {/* Nuevos campos importantes */}
                        <div>
                            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Ciudad</label>
                            <input
                                type="text"
                                value={formData.ciudad}
                                onChange={e => setFormData({ ...formData, ciudad: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="Ej: San Isidro"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">País</label>
                            <input
                                type="text"
                                value={formData.pais}
                                onChange={e => setFormData({ ...formData, pais: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="Ej: Argentina"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">URL del Logo</label>
                            <input
                                type="text"
                                value={formData.logo}
                                onChange={e => setFormData({ ...formData, logo: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                placeholder="https://..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 col-span-2">
                            <div>
                                <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Latitud</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.latitud}
                                    onChange={e => setFormData({ ...formData, latitud: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="-34.4..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-wider mb-1.5 ml-1">Longitud</label>
                                <input
                                    type="number"
                                    step="any"
                                    value={formData.longitud}
                                    onChange={e => setFormData({ ...formData, longitud: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-primary)] text-[var(--text-primary)] focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                                    placeholder="-58.5..."
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3.5 rounded-xl border border-[var(--border-primary)] text-sm font-bold text-[var(--text-secondary)] hover:bg-[var(--bg-soft)] transition-all"
                        >
                            Cancelar
                        </button>
                        <button
                            disabled={isSubmitting}
                            type="submit"
                            className="flex-1 py-3.5 rounded-xl bg-[var(--accent-primary)] text-sm font-bold text-white hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-50"
                        >
                            <Save size={18} />
                            {isSubmitting ? 'Guardando...' : 'Guardar Sede'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
