
import {LoginForm} from "@/components/internal/forms/LoginForm.tsx"

import logo from "/DataTask.svg"
import loginGradient from "/loginGradient.jpeg"

export const LoginPage = () => {


    return (
        <div className="grid min-h-svh lg:grid-cols-2">
            <div className="flex flex-col gap-4 p-6 md:p-10">
                <div className="flex justify-center gap-2 md:justify-start">
                    <a href="#" className="flex items-center gap-2 font-medium bg-gray-600 rounded-2xl p-4">
                        <img src={logo} width="150px" alt=""/>
                    </a>
                </div>
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-xs">
                        <LoginForm/>
                    </div>
                </div>
            </div>
            <div className="relative hidden bg-muted lg:block">
                <img
                    src={loginGradient}
                    alt="Image"
                    className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
                />
            </div>
        </div>
    )
}
