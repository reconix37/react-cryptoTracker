import { STORAGE_KEYS } from "@/configs/constants";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { IAuthContext } from "@/types/AuthContext";
import type { User } from "@/types/User";
import { createContext, useContext, useState } from "react";

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useLocalStorage<User | null>(STORAGE_KEYS.USER, null);
    const [allUsers, setAllUsers] = useLocalStorage<User[]>(STORAGE_KEYS.USERS_LIST, []);

    const login = async (email: string, pass: string) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const foundUser = allUsers.find(u => u.email === email && u.passwordHash === pass);
            if (foundUser) {
                setUser(foundUser);
            } else {
                throw new Error("Invalid email or password");
            }
        } catch (error) {
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    }

    const register = async (formData: User) => {
        setIsLoading(true);
        try {
            await new Promise((resolve) => setTimeout(resolve, 1000));
            const users = [...allUsers];
            const foundUser = users.find(u => u.email === formData.email);
            if (!foundUser) {
                const newUser: User = {
                    id: crypto.randomUUID(),
                    email: formData.email,
                    name: formData.name,
                    userName: formData.userName,
                    passwordHash: formData.passwordHash,
                }
                setAllUsers([...users, newUser]);
                setUser(newUser);
            } else {
                throw new Error("User with this email already exists");
            }
        } catch (error) {
            throw error;
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
        register,
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