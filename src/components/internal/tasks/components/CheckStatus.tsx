import * as React from 'react';
import {Circle, CircleCheck} from "lucide-react";

interface CheckStatusProps {
    isCompleted: boolean
    taskID: number;
}


export const CheckStatus: React.FC<CheckStatusProps> = ({isCompleted, taskID}) => {
    const [status, setStatus] = React.useState<boolean>(isCompleted);

    const CircleOnClick = (isCompleted: boolean) => {
        console.log(taskID);
        setStatus(isCompleted);
    }

    return (
        <>
            {status ? (
                <CircleCheck
                    onClick={() => {
                        CircleOnClick(false)
                    }}
                    className="text-green-500 cursor-pointer"
                    size="20"
                />
            ) : (
                <Circle
                    onClick={() => {
                        CircleOnClick(true)
                    }}
                    className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    size="20"
                />
            )}
        </>
    )
}