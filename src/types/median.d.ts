export interface MedianOneSignal {
    register: () => void;
    getInfo: (callback: (data: any) => void) => void;
    enableForegroundNotifications: (enabled: boolean) => void;
    login: (externalId: string) => void;
    logout: () => void;
}

export interface MedianLocalNotifications {
    create: (data: { title: string; message: string; at: string }) => void;
    cancelAll: () => void;
    requestPermission: () => void;
}

export interface Median {
    onesignal: MedianOneSignal;
    localNotifications: MedianLocalNotifications;
    isRegistered?: boolean;
}

declare global {
    interface Window {
        median?: Median;
    }
}
