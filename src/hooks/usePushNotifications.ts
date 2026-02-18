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

            // Request local permissions explicitly if available
            if (window.median.localNotifications?.requestPermission) {
                window.median.localNotifications.requestPermission();
            }

            window.median.onesignal.register();
            toast.success("Mencoba mendaftarkan perangkat...");

            // Poll for info several times - increased to 20 attempts (40 seconds)
            let attempts = 0;
            const interval = setInterval(() => {
                checkInfo();
                attempts++;
                if (attempts > 20) {
                    clearInterval(interval);
                    setIsRegistering(false);
                    toast.error("Pendaftaran memakan waktu lama. Silakan cek koneksi atau restart aplikasi.");
                }
            }, 2000);
        } catch (error) {
            console.error("Median Registration Error:", error);
            toast.error("Gagal mendaftarkan notifikasi.");
            setIsRegistering(false);
        }
    }, [checkInfo]);

    const syncMealReminders = useCallback((meals: Meal[]) => {
        if (!window.median || !window.median.localNotifications) {
            console.log("Median Local Notifications not available");
            return;
        }

        try {
            console.log("Syncing meal reminders with meals:", meals);
            // 1. Clear existing alarms to avoid duplicates
            window.median.localNotifications.cancelAll();

            // 2. Schedule each meal with recurring daily setting
            meals.forEach((meal, index) => {
                const [hours, minutes] = meal.time.split(":").map(Number);

                const scheduledDate = new Date();
                scheduledDate.setHours(hours, minutes, 0, 0);

                // If the time has already passed for today, scheduled for tomorrow
                // But keep 'at' as today's time because 'recurring' handles the logic
                // and the OS might need the base time. However, to be safe:
                if (scheduledDate.getTime() <= Date.now()) {
                    scheduledDate.setDate(scheduledDate.getDate() + 1);
                }

                // Format as 'yyyy-MM-dd HH:mm:ss'
                const year = scheduledDate.getFullYear();
                const month = String(scheduledDate.getMonth() + 1).padStart(2, '0');
                const day = String(scheduledDate.getDate()).padStart(2, '0');
                const hh = String(scheduledDate.getHours()).padStart(2, '0');
                const mm = String(scheduledDate.getMinutes()).padStart(2, '0');
                const ss = '00';
                const localFormat = `${year}-${month}-${day} ${hh}:${mm}:${ss}`;

                // Consistent ID for each meal slot (100, 101, etc)
                const notificationId = 100 + index;

                window.median!.localNotifications.create({
                    id: notificationId,
                    title: `Waktunya ${meal.name}! 🍽️`,
                    message: `Ayo makan sesuai jadwal (Jam HP: ${meal.time}). Semangat bulking!`,
                    at: localFormat,
                    recurring: 'daily',
                    sound: 'default',
                    vibrate: true,
                    priority: 2, // High priority
                });
            });

            console.log(`Successfully synced ${meals.length} meals as recurring alarms.`);
            toast.success("Alarm jadwal makan telah diperbarui di HP!");
        } catch (error) {
            console.error("Failed to sync meal reminders:", error);
            toast.error("Gagal sinkronisasi alarm.");
        }
    }, []);

    const testAlarm = useCallback(() => {
        if (!window.median || !window.median.localNotifications) {
            toast.error("Median Bridge tidak terdeteksi!");
            return;
        }

        // Schedule for 10 seconds from now
        const testDate = new Date(Date.now() + 10000);
        const year = testDate.getFullYear();
        const month = String(testDate.getMonth() + 1).padStart(2, '0');
        const day = String(testDate.getDate()).padStart(2, '0');
        const hh = String(testDate.getHours()).padStart(2, '0');
        const mm = String(testDate.getMinutes()).padStart(2, '0');
        const ss = String(testDate.getSeconds()).padStart(2, '0');
        const localFormat = `${year}-${month}-${day} ${hh}:${mm}:${ss}`;

        try {
            window.median.localNotifications.create({
                title: "Tes Bulking Buddy! 🚀",
                message: "Ini adalah notifikasi tes. Jika suara/getar muncul, alarm sudah aktif!",
                at: localFormat,
                sound: 'default',
                vibrate: true,
                priority: 2,
            });
            toast.success(`Tes alarm dikirim (akan muncul dalam 10 detik di jam ${hh}:${mm}:${ss})`);
            console.log("Test alarm scheduled at:", localFormat);
        } catch (err) {
            console.error("Test notification error:", err);
            toast.error("Gagal mengirim tes alarm.");
        }
    }, []);

    return {
        isMedian,
        oneSignalId,
        isSubscribed,
        isRegistering,
        registerDevice,
        syncMealReminders,
        testAlarm,
    };
};
