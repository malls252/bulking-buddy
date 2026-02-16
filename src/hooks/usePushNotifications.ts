import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { Meal } from "@/types/bulking";

export const usePushNotifications = () => {
    const [isMedian, setIsMedian] = useState(false);
    const [oneSignalId, setOneSignalId] = useState<string | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const checkInfo = useCallback(() => {
        if (window.median && window.median.onesignal) {
            window.median.onesignal.getInfo((data) => {
                if (data && data.oneSignalUserId) {
                    setOneSignalId(data.oneSignalUserId);
                    setIsSubscribed(data.isSubscribed);
                    if (data.isSubscribed) setIsRegistering(false);
                }
            });
        }
    }, []);

    useEffect(() => {
        // Check if running in Median
        if (window.median && window.median.onesignal) {
            setIsMedian(true);
            checkInfo();
        }
    }, [checkInfo]);

    const registerDevice = useCallback(() => {
        if (!window.median) {
            toast.error("Fitur ini hanya tersedia di aplikasi mobile.");
            return;
        }

        try {
            setIsRegistering(true);
            window.median.onesignal.register();
            toast.success("Mencoba mendaftarkan perangkat...");

            // Poll for info several times
            let attempts = 0;
            const interval = setInterval(() => {
                checkInfo();
                attempts++;
                if (attempts > 5) {
                    clearInterval(interval);
                    setIsRegistering(false);
                }
            }, 2000);
        } catch (error) {
            console.error("Median Registration Error:", error);
            toast.error("Gagal mendaftarkan notifikasi.");
            setIsRegistering(false);
        }
    }, [checkInfo]);

    const syncMealReminders = useCallback((meals: Meal[]) => {
        if (!window.median || !window.median.scheduling) {
            console.log("Median Scheduling not available");
            return;
        }

        try {
            // 1. Clear existing alarms to avoid duplicates
            window.median.scheduling.cancelAll();

            // 2. Schedule each meal for the next 7 days to ensure daily recurrence
            meals.forEach(meal => {
                const [hours, minutes] = meal.time.split(":").map(Number);

                for (let i = 0; i < 7; i++) {
                    const scheduledDate = new Date();
                    scheduledDate.setDate(scheduledDate.getDate() + i);
                    scheduledDate.setHours(hours, minutes, 0, 0);

                    // If it's today and the time has already passed, skip to next day
                    if (i === 0 && scheduledDate.getTime() <= Date.now()) {
                        continue;
                    }

                    window.median!.scheduling.create({
                        title: `Waktunya ${meal.name}! 🍽️`,
                        body: `Ayo makan tepat waktu (Jam HP: ${meal.time}). Semangat bulking!`,
                        date: scheduledDate.toISOString(),
                    });
                }
            });

            console.log(`Successfully synced ${meals.length} meals for the next 7 days using device local time: ${new Date().toString()}`);
        } catch (error) {
            console.error("Failed to sync meal reminders:", error);
        }
    }, []);

    return {
        isMedian,
        oneSignalId,
        isSubscribed,
        isRegistering,
        registerDevice,
        syncMealReminders,
    };
};
