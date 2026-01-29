import type { User } from "./User";

export interface IAuthContext {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    register: (formData: User) => Promise<void>;
    getToken: () => string | null;
}