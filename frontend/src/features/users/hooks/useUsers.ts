import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../services/userService';
import type { User } from '../../../types';

export const useUsers = () => {
    const queryClient = useQueryClient();

    const { 
        data: users = [], 
        isLoading: loading, 
        error: queryError,
        refetch 
    } = useQuery({
        queryKey: ['users'],
        queryFn: () => userService.getAll(),
    });

    const saveMutation = useMutation({
        mutationFn: ({ data, id }: { data: Partial<User>; id?: number }) => 
            userService.save(data, id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => userService.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const handleSave = async (data: Partial<User>, id?: number) => {
        try {
            await saveMutation.mutateAsync({ data, id });
            return true;
        } catch (err) {
            console.error('Error saving user:', err);
            return false;
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            await deleteMutation.mutateAsync(id);
        } catch (err) {
            console.error('Error deleting user:', err);
            alert('No se pudo eliminar el usuario.');
        }
    };

    return {
        users,
        loading: loading || saveMutation.isPending || deleteMutation.isPending,
        error: queryError ? 'Error al cargar usuarios' : null,
        actions: {
            refresh: async () => { await refetch(); },
            save: handleSave,
            delete: handleDelete,
        },
    };
};
