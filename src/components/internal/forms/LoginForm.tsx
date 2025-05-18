import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useTranslation} from 'react-i18next';
import React, {useState, useCallback} from "react";

interface LoginFormProps extends React.ComponentPropsWithoutRef<"form"> {
    onLoginSuccess?: (accessToken: string) => void;
    onLoginError?: (error: string) => void;
}

async function loginUser(credentials: Record<string, string>): Promise<string> {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(credentials),
    });

    const data = await response.json();

    if (!response.ok) {
        console.log(data);
        throw new Error(data?.error || `Ошибка входа: ${response.status}`);
    }

    return data.data.access_token;
}

export function LoginForm({
                              className,
                              onLoginSuccess,
                              onLoginError,
                          }: LoginFormProps) {
    const [t] = useTranslation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleInputChange = useCallback((
        event: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
        setter(event.target.value);
    }, []);

    const handleLoginClick = useCallback(async () => {
        setIsLoading(true);
        setErrorMessage(null);

        try {
            const accessToken = await loginUser({email, password});
            localStorage.setItem('accessToken', accessToken);
            alert(accessToken);
            onLoginSuccess?.(accessToken);
        } catch (error: any) {
            setErrorMessage(error.message || t('An error occurred during login'));
            onLoginError?.(error.message || t('An error occurred during login'));
        } finally {
            setIsLoading(false);
        }

        // if (errorMessage === null) {
        //     window.location.href = "/";
        // }
    }, [email, password, t, onLoginSuccess, onLoginError]);

    return (
        <div className={cn("flex flex-col gap-6", className)}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{t('Login to your account')}</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    {t('Enter your email below to login to your account')}
                </p>
            </div>
            <div className="grid gap-6">
                {errorMessage && (
                    <div className="p-2 text-sm text-red-600 bg-red-100 rounded-md">
                        {errorMessage}
                    </div>
                )}
                <div className="grid gap-2">
                    <Label htmlFor="email">{t('Email')}</Label>
                    <Input
                        onChange={(e) => handleInputChange(e, setEmail)}
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                    />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">{t('Password')}</Label>
                        <a
                            href="#"
                            className="ml-auto text-sm underline-offset-4 hover:underline"
                        >

                        </a>
                    </div>
                    <Input
                        onChange={(e) => handleInputChange(e, setPassword)}
                        id="password"
                        type="password"
                        required
                    />
                </div>
                <Button type="submit" className="w-full" onClick={handleLoginClick} disabled={isLoading}>
                    {isLoading ? t('Logging in...') : t('Login')}
                </Button>
            </div>
            <div className="text-center text-sm">
                {t('Don`t have an account?')}{" "}
                <a href="/auth/register" className="underline underline-offset-4">
                    {t('Sign up')}
                </a>
            </div>
        </div>
    );
}