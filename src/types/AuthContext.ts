export interface IAuthContext {
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    getToken: () => string | null;
}