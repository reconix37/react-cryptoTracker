import { STORAGE_KEYS } from "@/configs/constants";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { IAuthContext } from "@/types/AuthContext";
import type { User } from "@/types/User";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useLocalStorage<User | null>(STORAGE_KEYS.USER, null);

    const login = async (email: string, pass: string) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const fakeUser: User = {
                id: "1",
                name: "John Doe",
                email,
                passwordHash: pass,
                userName: "johndoe"
            };
            setUser(fakeUser);
        } catch (error) {
            console.error("Login failed:", error);
        } finally {
            setIsLoading(false);
        }
    }

    const logout = () => {
        setUser(null)
    }

    const value: IAuthContext = {
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        getToken: () => null,
    };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};