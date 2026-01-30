import type { User } from "./User";

export interface IAuthContext {
    isAuthenticated: boolean;
    isLoading: boolean;
    user: User | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (formData: User) => Promise<void>;
    getToken: () => string | null;
}