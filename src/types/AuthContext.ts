import type { User } from "./User";

export interface IAuthContext {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (email: string, password: string, name: string, userName: string) => Promise<void>;
    getToken: () => string | null;
}