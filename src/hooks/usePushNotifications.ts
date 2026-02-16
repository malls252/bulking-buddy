import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { Meal } from "@/types/bulking";

export const usePushNotifications = () => {
    const [isMedian, setIsMedian] = useState(false);
    const [oneSignalId, setOneSignalId] = useState<string | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);

    useEffect(() => {
        // Check if running in Median
        if (window.median && window.median.onesignal) {
            setIsMedian(true);

            // Get initial info
            window.median.onesignal.getInfo((data) => {
                if (data && data.oneSignalUserId) {
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

    const syncMealReminders = useCallback((meals: Meal[]) => {
        if (!window.median || !window.median.scheduling) {
            console.log("Median Scheduling not available");
            return;
        }

        try {
            // 1. Clear existing alarms to avoid duplicates
            window.median.scheduling.cancelAll();

            // 2. Schedule each meal
            meals.forEach(meal => {
                const [hours, minutes] = meal.time.split(":").map(Number);
                const now = new Date();
                const scheduledDate = new Date();
                scheduledDate.setHours(hours, minutes, 0, 0);

                // If the time has already passed today, schedule for tomorrow
                if (scheduledDate.getTime() <= now.getTime()) {
                    scheduledDate.setDate(scheduledDate.getDate() + 1);
                }

                window.median!.scheduling.create({
                    title: `Waktunya ${meal.name}! 🍽️`,
                    body: `Ayo makan tepat waktu untuk hasil bulking maksimal.`,
                    date: scheduledDate.toISOString(),
                });
            });

            console.log(`Successfully synced ${meals.length} meal reminders.`);
        } catch (error) {
            console.error("Failed to sync meal reminders:", error);
        }
    }, []);

    return {
        isMedian,
        oneSignalId,
        isSubscribed,
        registerDevice,
        syncMealReminders,
    };
};
