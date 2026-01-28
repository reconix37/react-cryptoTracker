
import { Button } from "@/components/ui/button";
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/contexts/AuthProvider";
import { useState } from "react";

export default function Auth() {

    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        userName: '',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const { login } = useAuth();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));

        setErrors((prev) => {
            if(!prev) return prev

            const next = {...prev}
            delete next[id]
            return next
        })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        validate()
        if (validate()) {
            console.log("Success! Sending data...");
            login(formData.email, formData.password);
        } else {
            console.log("Validation failed");
        }
    };

    const validate = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.email.includes("@")) {
            newErrors.email = "Incorrect email format";
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
        <form className="min-h-screen flex items-center justify-center bg-background text-foreground">
            <FieldSet>
                <FieldLegend className="text-3xl font-bold">{isLogin ? "Welcome Back" : "Create Account"}</FieldLegend>
                <FieldDescription>This appears on invoices and emails.</FieldDescription>
                <FieldGroup>
                    {!isLogin && (
                        <>
                            <Field>
                                <FieldLabel htmlFor="name">Full Name</FieldLabel>
                                <Input id="name" value={formData.name} onChange={handleChange} />
                                {errors.name && <FieldError>{errors.name}</FieldError>}
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="userName">User Name</FieldLabel>
                                <Input id="userName" value={formData.userName}
                                    onChange={handleChange} autoComplete="off" placeholder="Evil Rabbit" />
                                {errors.userName && <FieldError>{errors.userName}</FieldError>}
                            </Field>
                        </>
                    )}
                    <Field>
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input id="email" value={formData.email}
                            onChange={handleChange} autoComplete="off" aria-invalid={!!errors.email} />
                        {errors.email && <FieldError>{errors.email}</FieldError>}
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="password">Password</FieldLabel>
                        <Input id="password" value={formData.password}
                            onChange={handleChange} autoComplete="off" aria-invalid={!!errors.email} />
                            {errors.password && <FieldError>{errors.password}</FieldError>}
                    </Field>
                </FieldGroup>
                <Button type="submit" className="w-full" onClick={handleSubmit}>
                    {isLogin ? "Sign In" : "Sign Up"}
                </Button>
                <p onClick={() => setIsLogin(!isLogin)} className="cursor-pointer text-sm underline text-center mt-4">
                    {isLogin ? "Need an account? Register" : "Already have an account? Login"}
                </p>
            </FieldSet>
        </form>
    );
}