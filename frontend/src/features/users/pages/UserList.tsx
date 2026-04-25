import { User, Role } from '../../../types';
import { Edit3, Trash2, Plus, User as UserIcon } from 'lucide-react';

interface Props {
    users: User[];
    onEdit: (u: User) => void;
    onDelete: (id: number) => void;
    onCreateClick: () => void;
}

export function UserList({ users, onEdit, onDelete, onCreateClick }: Props) {
    const getRoleBadgeClass = (rol: Role) => {
        switch (rol) {
            case Role.SUPERADMIN: return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            case Role.ADMIN: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            case Role.SUPERVISOR: return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            case Role.OPERADOR: return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            default: return 'bg-slate-500/10 text-[var(--text-secondary)] border-slate-500/20';
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-primary)]/50">
                <div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] tracking-tight">Personal de la Empresa</h3>
                    <p className="text-sm text-[var(--text-secondary)]">Gestión de accesos y roles del sistema</p>
                </div>
                <button
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-[var(--text-primary)] font-bold rounded-xl shadow-lg shadow-blue-600/20 transition-all group"
                    onClick={onCreateClick}
                >
                    <Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" />
                    Nuevo Usuario
                </button>
            </div>

            <div className="bg-[var(--bg-secondary)]/40 backdrop-blur-md border border-[var(--border-primary)]/50 rounded-3xl overflow-hidden shadow-xl">
                <table className="w-full border-collapse">
                    <thead>
                        <tr className="bg-[var(--bg-primary)]/30 border-b border-[var(--border-primary)]/50">
                            <th className="text-left px-8 py-5 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Usuario</th>
                            <th className="text-left px-8 py-5 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Rol</th>
                            <th className="text-left px-8 py-5 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Marina / Sede</th>
                            <th className="text-center px-8 py-5 text-xs font-bold text-[var(--text-secondary)] uppercase tracking-widest">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-slate-800/20 transition-colors group">
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-800/50 flex items-center justify-center border border-slate-700/30 text-[var(--text-secondary)] group-hover:text-blue-400 transition-colors">
                                            <UserIcon size={18} />
                                        </div>
                                        <div className="flex flex-col">
                                            <div className="flex items-center gap-2">
                                                <span className={`font-bold transition-colors ${!u.activo ? 'text-[var(--text-muted)] italic' : 'text-[var(--text-primary)] group-hover:text-blue-400'}`}>
                                                    {u.nombre}
                                                </span>
                                                {!u.activo && (
                                                    <span className="px-1.5 py-0.5 bg-red-500/10 text-red-500 border border-red-500/20 rounded text-[9px] font-black uppercase tracking-tighter">
                                                        Inactivo
                                                    </span>
                                                )}
                                            </div>
                                            <span className={`text-xs ${!u.activo ? 'text-[var(--text-muted)]/50' : 'text-[var(--text-secondary)]'}`}>
                                                {u.usuario} | {u.email}
                                            </span>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getRoleBadgeClass(u.role)}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-[var(--text-primary)]">
                                            {u.guarderia 
                                                ? (u.guarderia.nombre || `Marina #${u.guarderiaId}`) 
                                                : (u.role === Role.SUPERADMIN ? 'Acceso Global' : 'n/a')}
                                        </span>
                                        {u.guarderiaId && (
                                            <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">
                                                ID: {u.guarderiaId}
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            className="p-2 bg-slate-800/50 hover:bg-blue-600 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-all border border-slate-700/30 shadow-sm"
                                            onClick={() => onEdit(u)}
                                            title="Editar"
                                        >
                                            <Edit3 size={16} />
                                        </button>
                                        <button
                                            className="p-2 bg-slate-800/50 hover:bg-red-500 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl transition-all border border-slate-700/30 shadow-sm"
                                            onClick={() => onDelete(u.id)}
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={4} className="px-8 py-16 text-center text-[var(--text-secondary)] italic">
                                    No hay usuarios registrados en el sistema.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
