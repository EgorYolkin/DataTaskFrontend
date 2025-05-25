import {NotificationInterface} from "@/interfaces/NotificationInterface.tsx";
import React, {useEffect} from "react";
import {FetchResponse} from "@/interfaces/FetchResponse.tsx";

const apiUrl = import.meta.env.VITE_API_URL
const apiVersion = import.meta.env.VITE_API_VERSION

const createHeaders = () => ({
    Authorization: localStorage.getItem("accessToken") || "",
    "Content-Type": "application/json",
})

const fetchWithErrorHandling = async (
    url: string,
    method: string = "PATCH"
) => {
    const response = await fetch(url, {
        method,
        credentials: "include",
        headers: createHeaders(),
    })

    if (!response.ok) {
        try {
            const errorData = await response.json()
            console.error("Server error:", errorData)
            throw new Error(
                errorData?.message || `Request failed: ${response.status}`
            )
        } catch (e) {
            console.error("Error parsing response:", e)
            throw new Error(`Request failed: ${response.status}`)
        }
    }

    return response.json()
}


interface NotificationProps {
    notification: NotificationInterface;
    key: number;
}

export const Notification: React.FC<NotificationProps> = ({notification, key}) => {
    useEffect(() => {
        fetchWithErrorHandling(
            `${apiUrl}/api/${apiVersion}/notification/${notification.id}/read`,
            "PATCH"
        )
    }, []);

    return (
        <div key={key}
             className="border flex flex-row rounded-lg p-3 bg-white cursor-pointer hover:shadow-md transition-shadow items-start gap-4 w-full">
            < div
                className="flex flex-col items-start justify-between gap-1 sm:gap-5 w-full">
                < div
                    className="flex flex-col items-start gap-2 w-full sm:w-auto sm:flex-grow sm:min-w-0">

                    < div
                        className="font-semibold text-sm">
                        < div
                            className="min-w-0 break-words">
                            {notification.title}
                        </div>
                    </div>
                    <div className="text-gray-600 text-sm flex-grow">
                        <div className="min-w-0 break-words">
                            {notification.description}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}