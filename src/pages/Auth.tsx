import { Button } from "@/components/ui/button";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User, UserCircle, ArrowRight, Sparkles } from "lucide-react";

export default function Auth() {

    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        userName: '',
        id: '',
    });

    const navigate = useNavigate();

    const [errors, setErrors] = useState<Record<string, string>>({});

    const { login, register, isLoading, isAuthenticated } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        setErrors((prev) => {
            if (!prev) return prev

            const next = { ...prev }
            delete next[id]
            return next
        })
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validate()) return;

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                await register(formData.email, formData.password, formData.name, formData.userName);
            }
        } catch (error) {
            setErrors({ form: (error as Error).message });
        }
    };

    useEffect(() => {
        document.title = isLogin ? "Login - CryptoTracker" : "Register - CryptoTracker";
        setErrors({});
    }, [isLogin]);

    useEffect(() => {
        if (isAuthenticated) {
            navigate("/profile");
        }
    }, [isAuthenticated]);

    const validate = () => {
        const newErrors: Record<string, string> = {};

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(formData.email)) {
            newErrors.email = "Please enter a valid email address (e.g., user@domain.com)";
        }

        if (formData.password.length < 6) {
            newErrors.password = "Minimum 6 characters required";
        }

        if (!isLogin) {
            if (!formData.name.trim()) newErrors.name = "Name is required";
            if (!formData.userName.trim()) newErrors.userName = "Username is required";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-secondary/20 text-foreground p-4 relative overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
            </div>

            <form 
                onSubmit={handleSubmit}
                className="relative w-full max-w-md"
            >
                <FieldSet className="bg-card border border-border rounded-2xl shadow-2xl p-8 space-y-6 backdrop-blur-sm">
                    <div className="text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 mb-4">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <FieldLegend className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {isLogin ? "Welcome Back" : "Create Account"}
                        </FieldLegend>
                        <p className="text-sm text-muted-foreground">
                            {isLogin 
                                ? "Sign in to continue to CryptoTracker" 
                                : "Join CryptoTracker today"}
                        </p>
                    </div>

                    <FieldGroup className="space-y-4">
                        {!isLogin && (
                            <Field>
                                <FieldLabel htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                                    <User className="w-4 h-4" />
                                    Full Name
                                </FieldLabel>
                                <div className="relative">
                                    <Input 
                                        id="name" 
                                        value={formData.name} 
                                        onChange={handleChange} 
                                        aria-invalid={!!errors.name}
                                        placeholder="John Doe"
                                        className="pl-10 h-11 border-2 focus:border-blue-500 transition-colors"
                                    />
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                </div>
                                {errors.name && (
                                    <FieldError className="text-xs animate-in slide-in-from-top-1">
                                        {errors.name}
                                    </FieldError>
                                )}
                            </Field>
                        )}

                        {!isLogin && (
                            <Field>
                                <FieldLabel htmlFor="userName" className="text-sm font-medium flex items-center gap-2">
                                    <UserCircle className="w-4 h-4" />
                                    Username
                                </FieldLabel>
                                <div className="relative">
                                    <Input 
                                        id="userName" 
                                        value={formData.userName}
                                        onChange={handleChange} 
                                        autoComplete="off" 
                                        aria-invalid={!!errors.userName} 
                                        placeholder="evilrabbit"
                                        className="pl-10 h-11 border-2 focus:border-blue-500 transition-colors"
                                    />
                                    <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                </div>
                                {errors.userName && (
                                    <FieldError className="text-xs animate-in slide-in-from-top-1">
                                        {errors.userName}
                                    </FieldError>
                                )}
                            </Field>
                        )}

                        <Field>
                            <FieldLabel htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email
                            </FieldLabel>
                            <div className="relative">
                                <Input 
                                    id="email" 
                                    type="email"
                                    value={formData.email}
                                    onChange={handleChange} 
                                    autoComplete="off" 
                                    aria-invalid={!!errors.email} 
                                    placeholder="example@gmail.com"
                                    className="pl-10 h-11 border-2 focus:border-blue-500 transition-colors"
                                />
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            </div>
                            {errors.email && (
                                <FieldError className="text-xs animate-in slide-in-from-top-1">
                                    {errors.email}
                                </FieldError>
                            )}
                        </Field>

                        <Field>
                            <FieldLabel htmlFor="password" className="text-sm font-medium flex items-center gap-2">
                                <Lock className="w-4 h-4" />
                                Password
                            </FieldLabel>
                            <div className="relative">
                                <Input 
                                    type="password" 
                                    id="password" 
                                    value={formData.password}
                                    onChange={handleChange} 
                                    autoComplete="off" 
                                    aria-invalid={!!errors.password}
                                    placeholder="••••••••"
                                    className="pl-10 h-11 border-2 focus:border-blue-500 transition-colors"
                                />
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            </div>
                            {errors.password && (
                                <FieldError className="text-xs animate-in slide-in-from-top-1">
                                    {errors.password}
                                </FieldError>
                            )}
                        </Field>
                    </FieldGroup>

                    {errors.form && (
                        <FieldError className="text-center font-semibold p-3 bg-destructive/10 border border-destructive/20 rounded-lg animate-in fade-in slide-in-from-top-2">
                            {errors.form}
                        </FieldError>
                    )}
                    <Button 
                        type="submit" 
                        className="w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group" 
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Processing...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                {isLogin ? "Sign In" : "Sign Up"}
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </span>
                        )}
                    </Button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors underline underline-offset-4"
                        >
                            {isLogin 
                                ? "Need an account? Sign up" 
                                : "Already have an account? Sign in"}
                        </button>
                    </div>
                </FieldSet>
            </form>
        </div>
    );
}