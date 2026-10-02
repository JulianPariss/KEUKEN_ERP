'use client';

import { useAuth } from "@/contexts/AuthContext";

const Welcome = () => {
    const { user } = useAuth();

    return (
        <div className="bg-linear-to-r from-primary-500/80 to-primary-0/80 backdrop-blur-xl rounded-dx p-4 flex flex-col gap-3 shadow-lg w-full ">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary-0 flex items-center justify-center shadow-primary-900-md">
                    <i className="dx-icon dx-icon-user text-2xl" />
                </div>
                <div>
                    <div className="text-xl font-semibold">Bienvenido {user?.name || ''}!</div>
                </div>
            </div>
        </div>
    )
};

export default Welcome;