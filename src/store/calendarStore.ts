import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type EventType = 'interview' | 'oa' | 'deadline' | 'followup';

export interface CalendarEvent {
    id: string;
    applicationId?: string;
    companyName: string;
    title: string;
    type: EventType;
    date: Date;
    time?: string;
    notes?: string;
    completed: boolean;
}

interface CalendarState {
    events: CalendarEvent[];
    addEvent: (event: CalendarEvent) => void;
    updateEvent: (id: string, updates: Partial<CalendarEvent>) => void;
    deleteEvent: (id: string) => void;
    toggleCompleted: (id: string) => void;
}

export const useCalendarStore = create<CalendarState>()(
    persist(
        (set) => ({
            events: [
                {
                    id: '1',
                    companyName: 'Google',
                    title: 'Technical Interview Round 2',
                    type: 'interview',
                    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
                    time: '10:00 AM',
                    notes: 'System design focus',
                    completed: false,
                },
                {
                    id: '2',
                    companyName: 'Stripe',
                    title: 'Online Assessment',
                    type: 'oa',
                    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
                    time: '2:00 PM',
                    notes: '90 minutes, 3 coding problems',
                    completed: false,
                },
                {
                    id: '3',
                    companyName: 'Notion',
                    title: 'Follow up on application',
                    type: 'followup',
                    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
                    completed: false,
                },
            ],
            addEvent: (event) =>
                set((state) => ({
                    events: [...state.events, event],
                })),
            updateEvent: (id, updates) =>
                set((state) => ({
                    events: state.events.map((e) =>
                        e.id === id ? { ...e, ...updates } : e
                    ),
                })),
            deleteEvent: (id) =>
                set((state) => ({
                    events: state.events.filter((e) => e.id !== id),
                })),
            toggleCompleted: (id) =>
                set((state) => ({
                    events: state.events.map((e) =>
                        e.id === id ? { ...e, completed: !e.completed } : e
                    ),
                })),
        }),
        {
            name: 'careerflow-calendar',
        }
    )
);
