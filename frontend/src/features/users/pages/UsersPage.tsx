import { useState } from 'react';
import { User } from '../../../types';
import { useUsers } from '../hooks/useUsers';
import { UserList } from './UserList';
import { UserForm } from './UserForm';
import { Loader2 } from 'lucide-react';

export default function UsersPage() {
    const { users, loading, error, actions } = useUsers();
    const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
    const [editingUser, setEditingUser] = useState<User | null>(null);

    const handleCreateClick = () => {
        setEditingUser(null);
        setViewMode('form');
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setViewMode('form');
    };

    const handleFormSubmit = async (data: Partial<User>) => {
        const success = await actions.save(data, editingUser?.id);
        if (success) {
            setViewMode('list');
            setEditingUser(null);
        }
    };

    const handleFormCancel = () => {
        setViewMode('list');
        setEditingUser(null);
    };

    if (loading && viewMode === 'list') {
        return (
            <div className="flex flex-col items-center justify-center py-32 bg-[var(--bg-primary)]/20 rounded-[2.5rem] border border-[var(--border-primary)]">
                <Loader2 className="w-12 h-12 text-indigo-500 animate-spin" />
                <p className="mt-4 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest animate-pulse">
                    Autenticando Permisos Globales...
                </p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center p-8 text-rose-500 bg-rose-500/10 rounded-2xl border border-rose-500/20">
                <p className="font-bold">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {viewMode === 'list' && (
                <UserList
                    users={users}
                    onEdit={handleEditClick}
                    onDelete={actions.delete}
                    onCreateClick={handleCreateClick}
                />
            )}
            
            {viewMode === 'form' && (
                <UserForm
                    initialData={editingUser}
                    onSubmit={handleFormSubmit}
                    onCancel={handleFormCancel}
                />
            )}
        </div>
    );
}
