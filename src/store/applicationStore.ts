import { create } from 'zustand';
import { Application, ApplicationStatus } from '@/types';
import { mockApplications } from '@/lib/mockData';

interface ApplicationStore {
    applications: Application[];

    // Actions
    moveApplication: (id: string, newStatus: ApplicationStatus) => void;
    addApplication: (application: Application) => void;
    updateApplication: (id: string, data: Partial<Application>) => void;
    deleteApplication: (id: string) => void;

    // Selectors
    getApplicationsByStatus: (status: ApplicationStatus) => Application[];
}

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
    applications: mockApplications,

    moveApplication: (id, newStatus) => {
        set((state) => ({
            applications: state.applications.map((app) => {
                if (app.id === id) {
                    const updates: Partial<Application> = {
                        status: newStatus,
                        updatedAt: new Date(),
                    };

                    // Auto-set appliedDate when moving from WISHLIST to APPLIED
                    if (app.status === 'WISHLIST' && newStatus === 'APPLIED' && !app.appliedDate) {
                        updates.appliedDate = new Date();
                    }

                    return { ...app, ...updates };
                }
                return app;
            }),
        }));
    },

    addApplication: (application) => {
        set((state) => ({
            applications: [...state.applications, application],
        }));
    },

    updateApplication: (id, data) => {
        set((state) => ({
            applications: state.applications.map((app) =>
                app.id === id ? { ...app, ...data, updatedAt: new Date() } : app
            ),
        }));
    },

    deleteApplication: (id) => {
        set((state) => ({
            applications: state.applications.filter((app) => app.id !== id),
        }));
    },

    getApplicationsByStatus: (status) => {
        return get().applications.filter((app) => app.status === status);
    },
}));
