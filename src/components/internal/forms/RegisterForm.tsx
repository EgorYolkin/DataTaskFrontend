import {cn} from "@/lib/utils";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {useTranslation} from "react-i18next";
import React, {useState, useCallback} from "react";
import {FetchResponse} from "@/interfaces/FetchResponse.tsx";

interface RegisterFormProps extends Omit<React.ComponentPropsWithoutRef<"div">, "onError"> {
    onSuccess?: (accessToken: string) => void;
    onError?: (error: string) => void;
}

async function createUser(userData: Record<string, string>, t: (tr: string) => string): Promise<FetchResponse> {
    const apiUrl = import.meta.env.VITE_API_URL;
    const apiVersion = import.meta.env.VITE_API_VERSION;

    const response = await fetch(`${apiUrl}/api/${apiVersion}/user/create`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        credentials: 'include',
        body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
        console.log(data);
        throw new Error(data?.message || `${t("Sign up error")}: ${response.status}`);
    }

    return data;
}

export function RegisterForm({
                                 className,
                                 onSuccess,
                                 onError,
                                 ...props
                             }: RegisterFormProps) {
    const [t] = useTranslation();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleInputChange = useCallback((
        event: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<string>>
    ) => {
        setter(event.target.value);
    }, []);

    const isFormValid = email && password && name && surname;

    const handleRegisterClick = useCallback(async () => {
        if (!isFormValid) {
            setErrorMessage(t('Please fill in all required fields'));
            return;
        }

        setIsLoading(true);
        setErrorMessage(null);

        try {
            const userData = {name, surname, email, password};
            await createUser(userData, t);
            window.location.href = "/auth/login";
        } catch (err: any) {
            setErrorMessage(err.message || t('An error occurred during registration'));
            onError?.(err.message || t('An error occurred during registration'));
        } finally {
            setIsLoading(false);
        }
    }, [email, name, password, surname, t, onSuccess, onError, isFormValid]);

    return (
        <div onSubmit={(e) => e.preventDefault()} className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{t('Register your account')}</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    {t('Enter your data below to create your account')}
                </p>
            </div>
            <div className="grid gap-6">
                {errorMessage && (
                    <div className="p-2 text-sm text-red-600 bg-red-100 rounded-md">
                        {t(errorMessage)}
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
                        aria-invalid={!!errorMessage}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="name">{t('Name')}</Label>
                    <Input
                        onChange={(e) => handleInputChange(e, setName)}
                        id="name"
                        type="text"
                        placeholder={t('Vitaly')}
                        required
                        aria-invalid={!!errorMessage}
                    />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="surname">{t('Surname')}</Label>
                    <Input
                        onChange={(e) => handleInputChange(e, setSurname)}
                        id="surname"
                        type="text"
                        placeholder={t('Chernov')}
                        required
                        aria-invalid={!!errorMessage}
                    />
                </div>
                <div className="grid gap-2">
                    <div className="flex items-center">
                        <Label htmlFor="password">{t('Password')}</Label>
                    </div>
                    <Input
                        onChange={(e) => handleInputChange(e, setPassword)}
                        id="password"
                        type="password"
                        required
                        aria-invalid={!!errorMessage}
                    />
                </div>
                <Button type="submit" className="w-full" onClick={handleRegisterClick} disabled={isLoading}>
                    {isLoading ? t('Registering...') : t('Register')}
                </Button>
            </div>
            <div className="text-center text-sm">
                {t('Already have an account?')}{" "}
                <a href="/auth/login" className="underline underline-offset-4">
                    {t('Login')}
                </a>
            </div>
        </div>
    );
}