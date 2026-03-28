import { useState } from 'react';
import { User, Role } from '../../../types';

interface Props {
    initialData?: User | null;
    onSubmit: (data: Partial<User>) => void;
    onCancel: () => void;
}

const emptyForm = {
    nombre: '',
    usuario: '',
    email: '',
    clave: '',
    repetirClave: '',
    role: Role.OPERADOR,
};

function userToFormData(u: User | null | undefined): typeof emptyForm {
    if (!u) return emptyForm;
    return {
        nombre: u.nombre ?? '',
        usuario: u.usuario ?? '',
        email: u.email ?? '',
        clave: '',
        repetirClave: '',
        role: u.role ?? Role.OPERADOR,
    };
}

export function UserForm({ initialData, onSubmit, onCancel }: Props) {
    const [formData, setFormData] = useState(() => userToFormData(initialData));

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.clave !== formData.repetirClave) {
            alert('Las contraseñas no coinciden');
            return;
        }

        const payload: any = { ...formData };
        delete payload.repetirClave;

        // Al editar, si la clave está vacía, no la enviamos para no sobrescribir con vacío
        if (initialData && !payload.clave) {
            delete payload.clave;
        }
        
        onSubmit(payload as Partial<User>);
    };

    return (
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-8 rounded-3xl animate-fade-in shadow-2xl">
            <div className="flex items-center gap-4 mb-8">
                <button 
                  className="p-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all border border-slate-700/30" 
                  onClick={onCancel}
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
                </button>
                <h3 className="text-xl font-bold text-white tracking-tight">
                  {initialData ? 'Editar Usuario' : 'Nuevo Usuario'}
                </h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                      <input
                          type="text"
                          required
                          className="w-full bg-slate-950/40 border border-slate-800/60 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
                          value={formData.nombre}
                          onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                          placeholder="Ej: Juan Pérez"
                      />
                  </div>

                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                      <input
                          type="email"
                          required
                          className="w-full bg-slate-950/40 border border-slate-800/60 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
                          value={formData.email}
                          onChange={e => setFormData({ ...formData, email: e.target.value })}
                          placeholder="juan@ejemplo.com"
                      />
                  </div>

                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre de Usuario</label>
                      <input
                          type="text"
                          required
                          className="w-full bg-slate-950/40 border border-slate-800/60 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
                          value={formData.usuario}
                          onChange={e => setFormData({ ...formData, usuario: e.target.value })}
                          placeholder="juan.perez"
                      />
                  </div>

                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Rol en la Empresa</label>
                      <select
                          required
                          className="w-full bg-slate-950/40 border border-slate-800/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all appearance-none cursor-pointer"
                          value={formData.role}
                          onChange={e => setFormData({ ...formData, role: e.target.value as Role })}
                      >
                          <option value={Role.OPERADOR}>Operador</option>
                          <option value={Role.ADMIN}>Administrador</option>
                          <option value={Role.SUPERADMIN}>Super Admin</option>
                      </select>
                  </div>

                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Contraseña {initialData && '(Opcional)'}</label>
                      <input
                          type="password"
                          required={!initialData}
                          className="w-full bg-slate-950/40 border border-slate-800/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
                          value={formData.clave}
                          onChange={e => setFormData({ ...formData, clave: e.target.value })}
                      />
                  </div>

                  <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Repetir Contraseña</label>
                      <input
                          type="password"
                          required={!initialData}
                          className="w-full bg-slate-950/40 border border-slate-800/60 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 transition-all"
                          value={formData.repetirClave}
                          onChange={e => setFormData({ ...formData, repetirClave: e.target.value })}
                      />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button 
                      type="button" 
                      className="flex-1 px-6 py-3 bg-slate-800/50 hover:bg-slate-800 text-slate-300 font-bold rounded-xl transition-all border border-slate-700/30" 
                      onClick={onCancel}
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all"
                    >
                      {initialData ? 'Guardar Cambios' : 'Crear Usuario'}
                    </button>
                </div>
            </form>
        </div>
    );
}
