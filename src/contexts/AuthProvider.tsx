import { STORAGE_KEYS } from "@/configs/constants";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { IAuthContext } from "@/types/AuthContext";
import type { User } from "@/types/User";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/configs/firebase";
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut } from "firebase/auth";
import { toast } from "sonner";
import { doc, setDoc } from "@firebase/firestore";

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(false)
    const [user, setUser] = useLocalStorage<User | null>(STORAGE_KEYS.USER, null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            console.log("Auth State Changed:", firebaseUser);
            if (firebaseUser) {
                setUser({
                    id: firebaseUser.uid,
                    email: firebaseUser.email || '',
                    name: firebaseUser.displayName || '',
                    userName: firebaseUser.email ? firebaseUser.email.split('@')[0] : '',
                })
            }
            else {
                setUser(null);
            }
            setIsLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        setIsLoading(true);
        try {
            
        } catch (error) {
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    }

    const register = async (email: string, password: string, name: string, userName: string) => {
        console.log("Registered data:", {email, type: typeof email, password})
        setIsLoading(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user

            const newUserData = {
                id: user.uid,
                email: user.email,
                name: name,
                userName: userName,
                createdAt: new Date().toISOString(),
                assets: []
            }
            await setDoc(doc(db, "users", user.uid), newUserData);
            toast.success("Registration successful!");
        } catch (error) {
            console.error(error);
            switch ((error as any).code) {
                case 'auth/email-already-in-use':
                    throw new Error("Email is already in use");
                case 'auth/invalid-email':
                    throw new Error("Invalid email format");
                case 'auth/weak-password':
                    throw new Error("Password should be at least 6 characters");
            }
            throw error;
        }
        finally {
            setIsLoading(false);
        }
    }

    const logout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out");
        } catch (error) {
            console.error(error);
        }
    }

    const value: IAuthContext = {
        isAuthenticated: !!user,
        user,
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