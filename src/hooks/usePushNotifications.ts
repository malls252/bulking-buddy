import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

import { Meal } from "@/types/bulking";

export const usePushNotifications = () => {
    const [isMedian, setIsMedian] = useState(false);
    const [isWebNotificationSupported, setIsWebNotificationSupported] = useState(false);
    const [oneSignalId, setOneSignalId] = useState<string | null>(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    const checkInfo = useCallback(() => {
        // Check for Median
        if (window.median && window.median.onesignal) {
            window.median.onesignal.getInfo((data) => {
                if (data && data.oneSignalUserId) {
                    setOneSignalId(data.oneSignalUserId);
                    setIsSubscribed(data.isSubscribed);
                    if (data.isSubscribed) setIsRegistering(false);
                }
            });
        }
        // Check for Web Notifications
        else if ('Notification' in window) {
            setIsWebNotificationSupported(true);
            if (Notification.permission === 'granted') {
                setIsSubscribed(true);
            }
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
        // Median Native Registration
        if (window.median) {
            try {
                setIsRegistering(true);

                if (window.median.localNotifications?.requestPermission) {
                    window.median.localNotifications.requestPermission();
                }

                window.median.onesignal.register();
                toast.success("Mencoba mendaftarkan perangkat native...");

                let attempts = 0;
                const interval = setInterval(() => {
                    checkInfo();
                    attempts++;
                    if (attempts > 20) {
                        clearInterval(interval);
                        setIsRegistering(false);
                        toast.error("Pendaftaran native lama. Cek koneksi.");
                    }
                }, 2000);
            } catch (error) {
                console.error("Median Registration Error:", error);
                toast.error("Gagal mendaftarkan notifikasi native.");
                setIsRegistering(false);
            }
            return;
        }

        // Web PWA Notification Registration
        if ('Notification' in window) {
            setIsRegistering(true);
            Notification.requestPermission().then(permission => {
                setIsRegistering(false);
                if (permission === 'granted') {
                    setIsSubscribed(true);
                    toast.success("Notifikasi browser diizinkan!");
                } else {
                    toast.error("Izin notifikasi ditolak oleh browser.");
                }
            });
        } else {
            toast.error("Browser Anda tidak mendukung notifikasi.");
        }
    }, [checkInfo]);

    const syncMealReminders = useCallback((meals: Meal[]) => {
        // Native Logic (Median)
        if (window.median && window.median.localNotifications) {
            try {
                console.log("Syncing meal reminders for native bridge...");
                window.median.localNotifications.cancelAll();
                meals.forEach(meal => {
                    const [hours, minutes] = meal.time.split(":").map(Number);
                    for (let i = 0; i < 7; i++) {
                        const scheduledDate = new Date();
                        scheduledDate.setDate(scheduledDate.getDate() + i);
                        scheduledDate.setHours(hours, minutes, 0, 0);
                        if (i === 0 && scheduledDate.getTime() <= Date.now()) continue;

                        const year = scheduledDate.getFullYear();
                        const month = String(scheduledDate.getMonth() + 1).padStart(2, '0');
                        const day = String(scheduledDate.getDate()).padStart(2, '0');
                        const hh = String(scheduledDate.getHours()).padStart(2, '0');
                        const mm = String(scheduledDate.getMinutes()).padStart(2, '0');
                        const ss = '00';
                        const localFormat = `${year}-${month}-${day} ${hh}:${mm}:${ss}`;

                        window.median!.localNotifications.create({
                            title: `Waktunya ${meal.name}! 🍽️`,
                            message: `Ayo makan tepat waktu (Jam HP: ${meal.time}). Semangat bulking!`,
                            at: localFormat,
                        });
                    }
                });
                toast.success("Jadwal makan sinkron ke HP!");
            } catch (error) {
                console.error("Native sync error:", error);
                toast.error("Gagal sinkronisasi native.");
            }
            return;
        }

        // PWA/Web Fallback
        if ('Notification' in window && Notification.permission === 'granted') {
            toast.info("Jadwal tersimpan. (Notifikasi browser butuh tab tetap terbuka)");
        }
    }, []);

    const testAlarm = useCallback(() => {
        // Local/Web Notification Test
        if (!window.median && 'Notification' in window) {
            if (Notification.permission === 'granted') {
                setTimeout(() => {
                    new Notification("Tes Bulking Buddy! 🚀", {
                        body: "Ini adalah notifikasi tes browser. Berhasil!",
                        icon: "/pwa-192x192.png"
                    });
                }, 5000);
                toast.success("Tes notifikasi browser dikirim (5 detik)...");
            } else {
                toast.error("Izinkan notifikasi browser terlebih dahulu.");
            }
            return;
        }

        // Native Test (Median)
        if (window.median && window.median.localNotifications) {
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
                    title: "Tes Bulking Native! 🚀",
                    message: "Jika Anda melihat ini, alarm native berfungsi!",
                    at: localFormat,
                });
                toast.success(`Tes alarm native dikirim (10 detik)...`);
            } catch (err) {
                console.error("Test notification error:", err);
                toast.error("Gagal tes alarm native.");
            }
        }
    }, []);

    return {
        isMedian,
        isWebNotificationSupported,
        oneSignalId,
        isSubscribed,
        isRegistering,
        registerDevice,
        syncMealReminders,
        testAlarm,
    };
};
