import { useEffect, useState } from "react";

export const useDelayedLoading = (isLoading: boolean, delay: number = 400) => {
    const [showLoader, setShowLoader] = useState(false);

    useEffect(() => {
        let timeoutId: NodeJS.Timeout;

        if (isLoading) {
            timeoutId = setTimeout(() => {
                setShowLoader(true);
            }, delay);
        } else {
            setShowLoader(false);
        }

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
        };
    }, [isLoading, delay]);

    return showLoader;
};
