export interface MedianOneSignal {
    register: () => void;
    getInfo: (callback: (data: any) => void) => void;
    enableForegroundNotifications: (enabled: boolean) => void;
    login: (externalId: string) => void;
    logout: () => void;
}

export interface Median {
    onesignal: MedianOneSignal;
    isRegistered?: boolean;
}

declare global {
    interface Window {
        median?: Median;
    }
}
