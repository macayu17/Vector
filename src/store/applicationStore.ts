import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import {
    ActivityEntry,
    Application,
    ApplicationFilters,
    ApplicationStatus,
    DEFAULT_FILTERS,
    FollowUpReminder,
    Priority,
    SavedView,
    Tag,
    UndoAction,
} from '@/types';
import { getSupabase } from '@/lib/supabase';

const SAVED_VIEWS_KEY = 'careerflow:saved-views';
const FOLLOW_UPS_KEY = 'careerflow:follow-ups';
const ACTIVITY_KEY = 'careerflow:activity-log';
const MAX_ACTIVITY_ENTRIES = 500;

interface DbApplication {
    id: string;
    user_id: string;
    company_name: string;
    job_title: string;
    job_url: string | null;
    location: string | null;
    remote_policy: string | null;
    status: ApplicationStatus;
    priority: Priority;
    job_type: 'FULL_TIME' | 'PART_TIME' | 'INTERNSHIP' | 'CONTRACT';
    salary_min: number | null;
    salary_max: number | null;
    currency: string;
    applied_date: string | null;
    notes: string | null;
    resume_id: string | null;
    created_at: string;
    updated_at: string;
}

const isBrowser = () => typeof window !== 'undefined';

const readJson = <T>(key: string, fallback: T): T => {
    if (!isBrowser()) return fallback;

    try {
        const value = window.localStorage.getItem(key);
        return value ? (JSON.parse(value) as T) : fallback;
    } catch {
        return fallback;
    }
};

const writeJson = (key: string, value: unknown) => {
    if (!isBrowser()) return;
    window.localStorage.setItem(key, JSON.stringify(value));
};

const reviveFilters = (filters: Partial<ApplicationFilters> | undefined): ApplicationFilters => ({
    ...DEFAULT_FILTERS,
    ...(filters || {}),
    dateFrom: filters?.dateFrom ? new Date(filters.dateFrom) : undefined,
    dateTo: filters?.dateTo ? new Date(filters.dateTo) : undefined,
});

const readSavedViews = (): SavedView[] =>
    readJson<Array<Omit<SavedView, 'createdAt' | 'filters'> & { createdAt: string; filters: Partial<ApplicationFilters> }>>(SAVED_VIEWS_KEY, [])
        .map((view) => ({
            ...view,
            filters: reviveFilters(view.filters),
            createdAt: new Date(view.createdAt),
        }));

const readFollowUps = (): Record<string, FollowUpReminder> => readJson(FOLLOW_UPS_KEY, {});

const readActivity = (): ActivityEntry[] => readJson(ACTIVITY_KEY, []);

const createActivity = (
    applicationId: string,
    type: ActivityEntry['type'],
    label: string,
    detail?: string
): ActivityEntry => ({
    id: uuidv4(),
    applicationId,
    type,
    label,
    detail,
    createdAt: new Date().toISOString(),
});

const nextActivityLog = (current: ActivityEntry[], entry: ActivityEntry) =>
    [entry, ...current].slice(0, MAX_ACTIVITY_ENTRIES);

function dbToApp(row: DbApplication, tags?: Tag[]): Application {
    return {
        id: row.id,
        userId: row.user_id,
        companyName: row.company_name,
        jobTitle: row.job_title,
        jobUrl: row.job_url ?? undefined,
        location: row.location ?? undefined,
        remotePolicy: row.remote_policy ?? undefined,
        status: row.status,
        priority: row.priority,
        jobType: row.job_type,
        salaryMin: row.salary_min ?? undefined,
        salaryMax: row.salary_max ?? undefined,
        currency: row.currency,
        appliedDate: row.applied_date ? new Date(row.applied_date) : undefined,
        notes: row.notes ?? undefined,
        resumeId: row.resume_id ?? undefined,
        tags: tags || [],
        createdAt: new Date(row.created_at),
        updatedAt: new Date(row.updated_at),
    };
}

function appToDb(app: Partial<Application> & { userId?: string }): Partial<DbApplication> {
    const result: Partial<DbApplication> = {};
    if (app.id !== undefined) result.id = app.id;
    if (app.userId !== undefined) result.user_id = app.userId;
    if (app.companyName !== undefined) result.company_name = app.companyName;
    if (app.jobTitle !== undefined) result.job_title = app.jobTitle;
    if (app.jobUrl !== undefined) result.job_url = app.jobUrl ?? null;
    if (app.location !== undefined) result.location = app.location ?? null;
    if (app.remotePolicy !== undefined) result.remote_policy = app.remotePolicy ?? null;
    if (app.status !== undefined) result.status = app.status;
    if (app.priority !== undefined) result.priority = app.priority;
    if (app.jobType !== undefined) result.job_type = app.jobType;
    if (app.salaryMin !== undefined) result.salary_min = app.salaryMin ?? null;
    if (app.salaryMax !== undefined) result.salary_max = app.salaryMax ?? null;
    if (app.currency !== undefined) result.currency = app.currency;
    if (app.appliedDate !== undefined) result.applied_date = app.appliedDate?.toISOString() ?? null;
    if (app.notes !== undefined) result.notes = app.notes ?? null;
    if (app.resumeId !== undefined) result.resume_id = app.resumeId ?? null;
    if (app.createdAt !== undefined) result.created_at = app.createdAt.toISOString();
    if (app.updatedAt !== undefined) result.updated_at = app.updatedAt.toISOString();
    return result;
}

interface ApplicationStore {
    applications: Application[];
    loading: boolean;
    error: string | null;
    selectedIds: string[];
    filters: ApplicationFilters;
    savedViews: SavedView[];
    followUps: Record<string, FollowUpReminder>;
    activityLog: ActivityEntry[];
    lastUndo: UndoAction | null;

    loadWorkspaceMetadata: () => void;
    fetchApplications: () => Promise<void>;
    moveApplication: (id: string, newStatus: ApplicationStatus) => Promise<void>;
    addApplication: (application: Omit<Application, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateApplication: (id: string, data: Partial<Application>) => Promise<void>;
    deleteApplication: (id: string) => Promise<void>;
    bulkUpdateStatus: (ids: string[], status: ApplicationStatus) => Promise<void>;
    bulkUpdatePriority: (ids: string[], priority: Priority) => Promise<void>;
    bulkDelete: (ids: string[]) => Promise<void>;
    undoLastAction: () => Promise<void>;
    clearUndo: () => void;
    toggleSelection: (id: string) => void;
    selectAll: (ids: string[]) => void;
    clearSelection: () => void;
    isSelected: (id: string) => boolean;
    setFilters: (filters: Partial<ApplicationFilters>) => void;
    clearFilters: () => void;
    setSearchQuery: (query: string) => void;
    saveCurrentView: (name: string, activeStatus: ApplicationStatus) => void;
    applySavedView: (id: string) => SavedView | undefined;
    deleteSavedView: (id: string) => void;
    setFollowUp: (applicationId: string, dueDate: string, note?: string) => void;
    completeFollowUp: (applicationId: string) => void;
    snoozeFollowUp: (applicationId: string, days: number) => void;
    clearFollowUp: (applicationId: string) => void;
    getDueFollowUps: () => Application[];
    getActivityForApplication: (applicationId: string) => ActivityEntry[];
    getApplicationsByStatus: (status: ApplicationStatus) => Application[];
    getFilteredApplications: () => Application[];
}

export const useApplicationStore = create<ApplicationStore>((set, get) => ({
    applications: [],
    loading: false,
    error: null,
    selectedIds: [],
    filters: DEFAULT_FILTERS,
    savedViews: [],
    followUps: {},
    activityLog: [],
    lastUndo: null,

    loadWorkspaceMetadata: () => {
        set({
            savedViews: readSavedViews(),
            followUps: readFollowUps(),
            activityLog: readActivity(),
        });
    },

    fetchApplications: async () => {
        set({ loading: true, error: null });
        try {
            const supabase = getSupabase();
            const { data: apps, error: appsError } = await supabase
                .from('applications')
                .select('*')
                .order('created_at', { ascending: false });

            if (appsError) throw appsError;

            const { data: appTags, error: tagsError } = await supabase
                .from('application_tags')
                .select('application_id, tags(*)');

            if (tagsError) throw tagsError;

            const tagsByApp: Record<string, Tag[]> = {};
            // @ts-expect-error - Supabase join types are dynamically inferred
            (appTags || []).forEach((at: { application_id: string; tags: { id: string; user_id: string; name: string; color: string; created_at: string } | null }) => {
                if (!tagsByApp[at.application_id]) tagsByApp[at.application_id] = [];
                if (at.tags) {
                    tagsByApp[at.application_id].push({
                        id: at.tags.id,
                        userId: at.tags.user_id,
                        name: at.tags.name,
                        color: at.tags.color,
                        createdAt: new Date(at.tags.created_at),
                    });
                }
            });

            const applications = (apps || []).map((app: DbApplication) =>
                dbToApp(app, tagsByApp[app.id] || [])
            );

            set({ applications, loading: false });
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    moveApplication: async (id, newStatus) => {
        const prev = get().applications;
        const app = prev.find((item) => item.id === id);
        if (!app || app.status === newStatus) return;

        const updatedAt = new Date();
        const activityLog = nextActivityLog(
            get().activityLog,
            createActivity(id, 'moved', `Moved to ${newStatus.replaceAll('_', ' ').toLowerCase()}`, `${app.status} -> ${newStatus}`)
        );
        writeJson(ACTIVITY_KEY, activityLog);
        set({
            applications: prev.map((item) =>
                item.id === id ? { ...item, status: newStatus, updatedAt } : item
            ),
            activityLog,
            lastUndo: {
                id: uuidv4(),
                type: 'move',
                label: `Moved ${app.companyName}`,
                applications: [app],
                createdAt: new Date().toISOString(),
            },
        });

        try {
            const supabase = getSupabase();
            const updates: Partial<DbApplication> = {
                status: newStatus,
                updated_at: updatedAt.toISOString(),
            };

            if (app.status === 'WISHLIST' && newStatus === 'APPLIED' && !app.appliedDate) {
                updates.applied_date = updatedAt.toISOString();
            }

            const { error } = await supabase.from('applications').update(updates).eq('id', id);
            if (error) throw error;
        } catch (error) {
            set({ applications: prev, error: (error as Error).message, lastUndo: null });
        }
    },

    addApplication: async (application) => {
        set({ loading: true, error: null });
        try {
            const supabase = getSupabase();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error('Not authenticated');

            const { data, error } = await supabase
                .from('applications')
                .insert({ ...appToDb(application), user_id: user.id })
                .select()
                .single();

            if (error) throw error;

            const created = dbToApp(data, application.tags || []);
            const activityLog = nextActivityLog(
                get().activityLog,
                createActivity(created.id, 'created', 'Created application', `${created.companyName} - ${created.jobTitle}`)
            );
            writeJson(ACTIVITY_KEY, activityLog);
            set((state) => ({
                applications: [created, ...state.applications],
                activityLog,
                loading: false,
            }));
        } catch (error) {
            set({ error: (error as Error).message, loading: false });
        }
    },

    updateApplication: async (id, data) => {
        const prev = get().applications;
        const app = prev.find((item) => item.id === id);
        if (!app) return;

        const updatedApp = { ...app, ...data, updatedAt: new Date() };
        const activityLog = nextActivityLog(
            get().activityLog,
            createActivity(id, 'updated', 'Updated application', app.companyName)
        );
        writeJson(ACTIVITY_KEY, activityLog);
        set({
            applications: prev.map((item) => item.id === id ? updatedApp : item),
            activityLog,
            lastUndo: {
                id: uuidv4(),
                type: 'update',
                label: `Updated ${app.companyName}`,
                applications: [app],
                createdAt: new Date().toISOString(),
            },
        });

        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('applications')
                .update({ ...appToDb(data), updated_at: updatedApp.updatedAt.toISOString() })
                .eq('id', id);

            if (error) throw error;
        } catch (error) {
            set({ applications: prev, error: (error as Error).message, lastUndo: null });
        }
    },

    deleteApplication: async (id) => {
        const prev = get().applications;
        const deleted = prev.find((app) => app.id === id);
        if (!deleted) return;

        const activityLog = nextActivityLog(
            get().activityLog,
            createActivity(id, 'deleted', 'Deleted application', deleted.companyName)
        );
        writeJson(ACTIVITY_KEY, activityLog);
        set({
            applications: prev.filter((app) => app.id !== id),
            selectedIds: get().selectedIds.filter((sid) => sid !== id),
            activityLog,
            lastUndo: {
                id: uuidv4(),
                type: 'delete',
                label: `Deleted ${deleted.companyName}`,
                applications: [deleted],
                createdAt: new Date().toISOString(),
            },
        });

        try {
            const supabase = getSupabase();
            const { error } = await supabase.from('applications').delete().eq('id', id);
            if (error) throw error;
        } catch (error) {
            set({ applications: prev, error: (error as Error).message, lastUndo: null });
        }
    },

    bulkUpdateStatus: async (ids, status) => {
        const prev = get().applications;
        const changed = prev.filter((app) => ids.includes(app.id));
        if (changed.length === 0) return;

        const activityLog = changed.reduce(
            (log, app) => nextActivityLog(log, createActivity(app.id, 'moved', `Moved to ${status.replaceAll('_', ' ').toLowerCase()}`, app.companyName)),
            get().activityLog
        );
        writeJson(ACTIVITY_KEY, activityLog);
        set({
            applications: prev.map((app) =>
                ids.includes(app.id) ? { ...app, status, updatedAt: new Date() } : app
            ),
            selectedIds: [],
            activityLog,
            lastUndo: {
                id: uuidv4(),
                type: 'bulk-move',
                label: `Moved ${changed.length} applications`,
                applications: changed,
                createdAt: new Date().toISOString(),
            },
        });

        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('applications')
                .update({ status, updated_at: new Date().toISOString() })
                .in('id', ids);

            if (error) throw error;
        } catch (error) {
            set({ applications: prev, error: (error as Error).message, lastUndo: null });
        }
    },

    bulkUpdatePriority: async (ids, priority) => {
        const prev = get().applications;
        const changed = prev.filter((app) => ids.includes(app.id));
        if (changed.length === 0) return;

        set({
            applications: prev.map((app) =>
                ids.includes(app.id) ? { ...app, priority, updatedAt: new Date() } : app
            ),
            selectedIds: [],
            lastUndo: {
                id: uuidv4(),
                type: 'bulk-priority',
                label: `Changed priority for ${changed.length}`,
                applications: changed,
                createdAt: new Date().toISOString(),
            },
        });

        try {
            const supabase = getSupabase();
            const { error } = await supabase
                .from('applications')
                .update({ priority, updated_at: new Date().toISOString() })
                .in('id', ids);

            if (error) throw error;
        } catch (error) {
            set({ applications: prev, error: (error as Error).message, lastUndo: null });
        }
    },

    bulkDelete: async (ids) => {
        const prev = get().applications;
        const deleted = prev.filter((app) => ids.includes(app.id));
        if (deleted.length === 0) return;

        const activityLog = deleted.reduce(
            (log, app) => nextActivityLog(log, createActivity(app.id, 'deleted', 'Deleted application', app.companyName)),
            get().activityLog
        );
        writeJson(ACTIVITY_KEY, activityLog);
        set({
            applications: prev.filter((app) => !ids.includes(app.id)),
            selectedIds: [],
            activityLog,
            lastUndo: {
                id: uuidv4(),
                type: 'bulk-delete',
                label: `Deleted ${deleted.length} applications`,
                applications: deleted,
                createdAt: new Date().toISOString(),
            },
        });

        try {
            const supabase = getSupabase();
            const { error } = await supabase.from('applications').delete().in('id', ids);
            if (error) throw error;
        } catch (error) {
            set({ applications: prev, error: (error as Error).message, lastUndo: null });
        }
    },

    undoLastAction: async () => {
        const undo = get().lastUndo;
        if (!undo) return;

        const current = get().applications;
        const previousById = new Map(undo.applications.map((app) => [app.id, app]));
        const restoreDeleted = undo.type === 'delete' || undo.type === 'bulk-delete';
        const restoredApplications = restoreDeleted
            ? [...undo.applications, ...current.filter((app) => !previousById.has(app.id))]
            : current.map((app) => previousById.get(app.id) || app);

        const activityLog = undo.applications.reduce(
            (log, app) => nextActivityLog(log, createActivity(app.id, 'restored', 'Undo applied', undo.label)),
            get().activityLog
        );
        writeJson(ACTIVITY_KEY, activityLog);
        set({ applications: restoredApplications, activityLog, lastUndo: null });

        try {
            const supabase = getSupabase();
            if (restoreDeleted) {
                const { error } = await supabase.from('applications').upsert(undo.applications.map(appToDb));
                if (error) throw error;
            } else {
                await Promise.all(undo.applications.map((app) =>
                    supabase.from('applications').update(appToDb(app)).eq('id', app.id)
                ));
            }
        } catch (error) {
            set({ error: (error as Error).message });
        }
    },

    clearUndo: () => set({ lastUndo: null }),

    toggleSelection: (id) => {
        set((state) => ({
            selectedIds: state.selectedIds.includes(id)
                ? state.selectedIds.filter((sid) => sid !== id)
                : [...state.selectedIds, id],
        }));
    },

    selectAll: (ids) => set({ selectedIds: ids }),
    clearSelection: () => set({ selectedIds: [] }),
    isSelected: (id) => get().selectedIds.includes(id),

    setFilters: (newFilters) => {
        set((state) => ({ filters: { ...state.filters, ...newFilters } }));
    },

    clearFilters: () => set({ filters: DEFAULT_FILTERS }),
    setSearchQuery: (query) => set((state) => ({ filters: { ...state.filters, searchQuery: query } })),

    saveCurrentView: (name, activeStatus) => {
        const trimmedName = name.trim();
        if (!trimmedName) return;
        const savedViews = [
            {
                id: uuidv4(),
                name: trimmedName,
                filters: get().filters,
                activeStatus,
                createdAt: new Date(),
            },
            ...get().savedViews,
        ].slice(0, 12);
        writeJson(SAVED_VIEWS_KEY, savedViews);
        set({ savedViews });
    },

    applySavedView: (id) => {
        const view = get().savedViews.find((savedView) => savedView.id === id);
        if (!view) return undefined;
        set({ filters: view.filters });
        return view;
    },

    deleteSavedView: (id) => {
        const savedViews = get().savedViews.filter((view) => view.id !== id);
        writeJson(SAVED_VIEWS_KEY, savedViews);
        set({ savedViews });
    },

    setFollowUp: (applicationId, dueDate, note) => {
        const followUps = {
            ...get().followUps,
            [applicationId]: {
                applicationId,
                dueDate,
                note,
                completed: false,
                updatedAt: new Date().toISOString(),
            },
        };
        const activityLog = nextActivityLog(
            get().activityLog,
            createActivity(applicationId, 'followup', 'Follow-up scheduled', dueDate)
        );
        writeJson(FOLLOW_UPS_KEY, followUps);
        writeJson(ACTIVITY_KEY, activityLog);
        set({ followUps, activityLog });
    },

    completeFollowUp: (applicationId) => {
        const existing = get().followUps[applicationId];
        if (!existing) return;
        const followUps = {
            ...get().followUps,
            [applicationId]: { ...existing, completed: true, updatedAt: new Date().toISOString() },
        };
        const activityLog = nextActivityLog(
            get().activityLog,
            createActivity(applicationId, 'followup', 'Follow-up completed')
        );
        writeJson(FOLLOW_UPS_KEY, followUps);
        writeJson(ACTIVITY_KEY, activityLog);
        set({ followUps, activityLog });
    },

    snoozeFollowUp: (applicationId, days) => {
        const existing = get().followUps[applicationId];
        if (!existing) return;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + days);
        const dueDate = nextDate.toISOString().slice(0, 10);
        const followUps = {
            ...get().followUps,
            [applicationId]: { ...existing, dueDate, completed: false, updatedAt: new Date().toISOString() },
        };
        const activityLog = nextActivityLog(
            get().activityLog,
            createActivity(applicationId, 'followup', `Snoozed ${days} days`, dueDate)
        );
        writeJson(FOLLOW_UPS_KEY, followUps);
        writeJson(ACTIVITY_KEY, activityLog);
        set({ followUps, activityLog });
    },

    clearFollowUp: (applicationId) => {
        const followUps = { ...get().followUps };
        delete followUps[applicationId];
        writeJson(FOLLOW_UPS_KEY, followUps);
        set({ followUps });
    },

    getDueFollowUps: () => {
        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const followUps = get().followUps;
        return get().applications.filter((application) => {
            const followUp = followUps[application.id];
            return followUp && !followUp.completed && new Date(followUp.dueDate) <= today;
        });
    },

    getActivityForApplication: (applicationId) =>
        get().activityLog.filter((entry) => entry.applicationId === applicationId),

    getApplicationsByStatus: (status) =>
        get().applications.filter((app) => app.status === status),

    getFilteredApplications: () => {
        const { applications, filters } = get();

        return applications.filter((app) => {
            if (filters.searchQuery) {
                const query = filters.searchQuery.toLowerCase();
                const matchesSearch =
                    app.companyName.toLowerCase().includes(query) ||
                    app.jobTitle.toLowerCase().includes(query) ||
                    (app.notes?.toLowerCase().includes(query) ?? false) ||
                    (app.location?.toLowerCase().includes(query) ?? false);
                if (!matchesSearch) return false;
            }

            if (filters.statuses.length > 0 && !filters.statuses.includes(app.status)) return false;
            if (filters.priorities.length > 0 && !filters.priorities.includes(app.priority)) return false;
            if (filters.jobTypes.length > 0 && !filters.jobTypes.includes(app.jobType)) return false;
            if (filters.location && !app.location?.toLowerCase().includes(filters.location.toLowerCase())) return false;
            if (filters.salaryMin !== undefined && (app.salaryMax ?? 0) < filters.salaryMin) return false;
            if (filters.salaryMax !== undefined && (app.salaryMin ?? Infinity) > filters.salaryMax) return false;

            if (filters.tags.length > 0) {
                const appTagIds = app.tags?.map(t => t.id) || [];
                if (!filters.tags.every(tagId => appTagIds.includes(tagId))) return false;
            }

            if (filters.dateFrom && app.appliedDate && new Date(app.appliedDate) < filters.dateFrom) return false;
            if (filters.dateTo && app.appliedDate && new Date(app.appliedDate) > filters.dateTo) return false;

            return true;
        });
    },
}));
