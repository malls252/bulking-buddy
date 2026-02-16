import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

export const usePushNotifications = () => {
    const [isMedian, setIsMedian] = useState(false);
    const [oneSignalId, setOneSignalId] = useState<string | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        // Check if running in Median
        if (window.median) {
            setIsMedian(true);

            // Get initial info
            window.median.onesignal.getInfo((data) => {
                if (data.oneSignalUserId) {
                    setOneSignalId(data.oneSignalUserId);
                    setIsSubscribed(data.isSubscribed);
                }
            });
        }
    }, []);

    const registerDevice = useCallback(() => {
        if (!window.median) {
            toast.error("Fitur ini hanya tersedia di aplikasi mobile.");
            return;
        }

        try {
            window.median.onesignal.register();
            toast.success("Mencoba mendaftarkan perangkat...");

            // Re-check info after a delay
            setTimeout(() => {
                window.median?.onesignal.getInfo((data) => {
                    if (data.oneSignalUserId) {
                        setOneSignalId(data.oneSignalUserId);
                        setIsSubscribed(data.isSubscribed);
                    }
                });
            }, 5000);
        } catch (error) {
            console.error("Median Registration Error:", error);
            toast.error("Gagal mendaftarkan notifikasi.");
        }
    }, []);

    return {
        isMedian,
        oneSignalId,
        isSubscribed,
        registerDevice,
    };
};
