export interface MedianOneSignal {
    register: () => void;
    getInfo: (callback: (data: any) => void) => void;
    enableForegroundNotifications: (enabled: boolean) => void;
    login: (externalId: string) => void;
    logout: () => void;
}

export interface MedianLocalNotifications {
    create: (data: {
        id?: number;
        title: string;
        message: string;
        at: string;
        recurring?: 'daily' | 'weekly' | 'monthly' | 'yearly';
        sound?: string;
        vibrate?: boolean;
        priority?: number;
    }) => void;
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
