import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserSettings {
    firstName: string;
    lastName: string;
    email: string;
    currency: string;
    stalledDays: number;
}

interface SettingsState {
    settings: UserSettings;
    updateSettings: (updates: Partial<UserSettings>) => void;
}

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            settings: {
                firstName: '',
                lastName: '',
                email: '',
                currency: 'INR', // Default to INR
                stalledDays: 14,
            },
            updateSettings: (updates) =>
                set((state) => ({
                    settings: { ...state.settings, ...updates },
                })),
        }),
        {
            name: 'careerflow-settings',
        }
    )
);
