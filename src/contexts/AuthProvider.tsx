import type { IAuthContext } from "@/types/AuthContext";
import type { User } from "@/types/User";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(false)


    const login = async () => {
        setIsLoading(true)
        setTimeout(() => {
            setUser({id: "1", name: "Farmer", email: "farmer300", passwordHash: "hashedpassword"})
            setIsLoading(false)
        }, 1500);
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