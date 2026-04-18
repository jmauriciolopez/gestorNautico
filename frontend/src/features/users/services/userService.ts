import { httpClient } from '../../../shared/api/HttpClient';
import type { User } from '../../../types';
import type { Paginated } from '../../../api/pagination';

export const userService = {
    getAll: () =>
        httpClient.get<Paginated<User>>('/users').then(res => res.data),

    save: (data: Partial<User>, id?: number) => {
        if (id) {
            return httpClient.patch<User>(`/users/${id}`, data);
        }
        return httpClient.post<User>('/users', data);
    },

    delete: (id: number) =>
        httpClient.delete(`/users/${id}`),
};
