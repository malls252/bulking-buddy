export interface MedianOneSignal {
    register: () => void;
    getInfo: (callback: (data: any) => void) => void;
    enableForegroundNotifications: (enabled: boolean) => void;
    login: (externalId: string) => void;
    logout: () => void;
}

export interface MedianScheduling {
    create: (data: { title: string; body: string; date: string }) => void;
    cancelAll: () => void;
}

export interface Median {
    onesignal: MedianOneSignal;
    scheduling: MedianScheduling;
    isRegistered?: boolean;
}

declare global {
    interface Window {
        median?: Median;
    }
}
