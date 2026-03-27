import { httpClient } from '../../../shared/api/HttpClient';
import type { User } from '../../../types';

export const userService = {
    getAll: () =>
        httpClient.get<User[]>('/users'),

    save: (data: Partial<User>, id?: number) => {
        if (id) {
            return httpClient.patch<User>(`/users/${id}`, data);
        }
        return httpClient.post<User>('/users', data);
    },

    delete: (id: number) =>
        httpClient.delete(`/users/${id}`),
};
