import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { httpClient } from '../../../shared/api/HttpClient';
import { Guarderia } from '../../../types';
import { toast } from 'react-hot-toast';

/**
 * Hook para la gestión administrativa de Guarderías (Sedes) por parte del SuperAdmin.
 */
export function useGuarderiasManagement() {
    const queryClient = useQueryClient();

    const { data: guarderias = [], isLoading, error } = useQuery<Guarderia[]>({
        queryKey: ['guarderias-admin'],
        queryFn: async () => {
            const response = await httpClient.get<Guarderia[]>('/guarderias');
            return response;
        },
    });

    const createGuarderia = useMutation({
        mutationFn: async (data: Partial<Guarderia>) => {
            return await httpClient.post<Guarderia>('/guarderias', data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guarderias-admin'] });
            queryClient.invalidateQueries({ queryKey: ['guarderias'] }); // Invalida también la lista del selector
            toast.success('Sede creada correctamente');
        },
        onError: (err: any) => {
            toast.error(err.response?.data?.message || 'Error al crear la sede');
        },
    });

    const updateGuarderia = useMutation({
        mutationFn: async ({ id, ...data }: Partial<Guarderia> & { id: number }) => {
            return await httpClient.patch<Guarderia>(`/guarderias/${id}`, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guarderias-admin'] });
            queryClient.invalidateQueries({ queryKey: ['guarderias'] });
            toast.success('Sede actualizada correctamente');
        },
    });

    const removeGuarderia = useMutation({
        mutationFn: async (id: number) => {
            return await httpClient.delete(`/guarderias/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['guarderias-admin'] });
            queryClient.invalidateQueries({ queryKey: ['guarderias'] });
            toast.success('Sede eliminada');
        },
    });

    return {
        guarderias,
        isLoading,
        error,
        createGuarderia,
        updateGuarderia,
        removeGuarderia,
    };
}
