import {cn} from "@/lib/utils"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {useTranslation} from "react-i18next";

export function RegisterForm({
                                 className,
                                 ...props
                             }: React.ComponentPropsWithoutRef<"form">) {
    const [t] = useTranslation();

    return (
        <form className={cn("flex flex-col gap-6", className)} {...props}>
            <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">{t('Register your account')}</h1>
                <p className="text-balance text-sm text-muted-foreground">
                    {t('Enter your data below to create your account')}
                </p>
            </div>
            <div className="grid gap-6">
                <div className="grid gap-2">
                    <Label htmlFor="email">{t('Email')}</Label>
                    <Input id="email" type="email" placeholder="m@example.com" required/>
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
                    <Input id="password" type="password" required/>
                </div>
                <Button type="submit" className="w-full">
                    {t('Login')}
                </Button>

            </div>
            <div className="text-center text-sm">
                {t('Already have an account?')}{" "}
                <a href="/auth/login" className="underline underline-offset-4">
                    {t('Login')}
                </a>
            </div>
        </form>
    )
}
