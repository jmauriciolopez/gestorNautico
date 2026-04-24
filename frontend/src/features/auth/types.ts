import { type User } from '../../types';

export interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isInitializing: boolean;
    login: (token?: string) => Promise<void>;
    logout: () => void;
}
