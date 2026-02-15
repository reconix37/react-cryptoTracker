import type { IAuthContext } from "@/types/AuthContext";
import type { User } from "@/types/User";
import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/services/firebase";
import { createUserWithEmailAndPassword, onAuthStateChanged, signOut, signInWithEmailAndPassword } from "firebase/auth";
import { toast } from "sonner";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);


    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const userDocRef = doc(db, "users", firebaseUser.uid);
                    const userDocSnap = await getDoc(userDocRef);

                    if (userDocSnap.exists()) {
                        const userData = userDocSnap.data();
                        setUser({
                            id: firebaseUser.uid,
                            email: userData.email,
                            name: userData.name,
                            userName: userData.userName,
                        });
                        setIsLoading(false);
                    } else {
                        setIsLoading(false);
                    }

                } catch (error) {
                    setIsLoading(false);
                }
            }
            else {
                setUser(null);
                setIsLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const login = async (email: string, pass: string) => {
        setIsLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, pass);
            toast.success("Login successful!");
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    }

    const register = async (email: string, password: string, name: string, userName: string) => {
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
            setUser({
                id: user.uid,
                email: newUserData.email || '',
                name: newUserData.name,
                userName: newUserData.userName,
            });

            toast.success("Registration successful!");

        } catch (error) {
            switch ((error as any).code) {
                case 'auth/email-already-in-use':
                    throw new Error("Email is already in use");
                case 'auth/invalid-email':
                    throw new Error("Invalid email format");
                case 'auth/weak-password':
                    throw new Error("Password should be at least 6 characters");
                default:
                    throw error;
            }
        } finally {
            setIsLoading(false);
        }
    }

    const logout = async () => {
        try {
            await signOut(auth);
            toast.success("Logged out");
        } catch (error) {
            toast.error("Something went wrong..")
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