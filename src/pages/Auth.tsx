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
        <form className="min-h-screen flex items-center justify-center bg-background text-foreground" onSubmit={handleSubmit}>
            <FieldSet>
                <FieldLegend className="text-3xl font-bold">{isLogin ? "Welcome Back" : "Create Account"}</FieldLegend>
                <FieldGroup>
                    {!isLogin && (
                        <>
                            <Field>
                                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                                <Input id="name" value={formData.name} onChange={handleChange} aria-invalid={!!errors.name} />
                                {errors.name && <FieldError>{errors.name}</FieldError>}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="userName">User Name</FieldLabel>
                                <Input id="userName" value={formData.userName}
                                    onChange={handleChange} autoComplete="off" aria-invalid={!!errors.userName} placeholder="Evil Rabbit" />
                                {errors.userName && <FieldError>{errors.userName}</FieldError>}
                            </Field>
                        </>
                    )}
                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input id="email" value={formData.email}
                            onChange={handleChange} autoComplete="off" aria-invalid={!!errors.email} placeholder="exmaple@gmail.com" />
                        {errors.email && <FieldError>{errors.email}</FieldError>}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input type="password" id="password" value={formData.password}
                            onChange={handleChange} autoComplete="off" aria-invalid={!!errors.password} />
                        {errors.password && <FieldError>{errors.password}</FieldError>}
                    </Field>
                </FieldGroup>
                {errors.form && <FieldError className="text-center font-bold">{errors.form}</FieldError>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Sending..." : (isLogin ? "Sign In" : "Sign Up")}
                </Button>
                <p onClick={() => setIsLogin(!isLogin)} className="cursor-pointer text-sm underline text-center mt-2">
                    {isLogin ? "Need an account? Register" : "Already have an account? Login"}
                </p>
            </FieldSet>
        </form>
    );
}