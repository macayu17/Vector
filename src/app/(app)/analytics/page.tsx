'use client';

import { useMemo } from 'react';
import { useApplicationStore } from '@/store/applicationStore';
import { APPLICATION_STATUSES, PRIORITY_LEVELS, STATUS_CONFIG } from '@/types';
import { Card } from '@/components/ui/card';
import {
    AlertTriangle,
    CheckCircle2,
    Clock3,
    MessageSquare,
    Target,
    TrendingUp,
    XCircle,
} from 'lucide-react';

const daysBetween = (start?: Date, end = new Date()) => {
    if (!start) return null;
    const diff = end.getTime() - new Date(start).getTime();
    return Math.max(0, Math.round(diff / 86_400_000));
};

export default function AnalyticsPage() {
    const { applications, followUps, activityLog } = useApplicationStore();

    const analytics = useMemo(() => {
        const total = applications.length;
        const submitted = applications.filter((app) => app.status !== 'WISHLIST');
        const interviews = applications.filter((app) => app.status === 'INTERVIEW_SCHEDULED').length;
        const oaReceived = applications.filter((app) => app.status === 'OA_RECEIVED').length;
        const rejected = applications.filter((app) => app.status === 'REJECTED').length;
        const stalled = applications.filter((app) => app.status === 'STALLED').length;
        const responses = interviews + oaReceived + rejected;
        const dueFollowUps = applications.filter((app) => {
            const followUp = followUps[app.id];
            return followUp && !followUp.completed && new Date(followUp.dueDate) <= new Date();
        }).length;

        const ages = submitted
            .map((app) => daysBetween(app.appliedDate || app.createdAt))
            .filter((age): age is number => age !== null);
        const averageAge = ages.length ? Math.round(ages.reduce((sum, age) => sum + age, 0) / ages.length) : 0;

        const companyCounts = applications.reduce<Record<string, number>>((acc, app) => {
            acc[app.companyName] = (acc[app.companyName] || 0) + 1;
            return acc;
        }, {});

        const topCompanies = Object.entries(companyCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        const last30 = new Date();
        last30.setDate(last30.getDate() - 30);
        const recentActivity = activityLog.filter((entry) => new Date(entry.createdAt) >= last30).length;

        return {
            total,
            submitted: submitted.length,
            interviews,
            rejected,
            stalled,
            dueFollowUps,
            averageAge,
            responseRate: submitted.length ? Math.round((responses / submitted.length) * 100) : 0,
            interviewRate: submitted.length ? Math.round((interviews / submitted.length) * 100) : 0,
            activeRate: submitted.length ? Math.round(((submitted.length - rejected - stalled) / submitted.length) * 100) : 0,
            recentActivity,
            topCompanies,
        };
    }, [activityLog, applications, followUps]);

    const statusCounts = APPLICATION_STATUSES.map(status => ({
        status,
        count: applications.filter(a => a.status === status).length,
        label: STATUS_CONFIG[status].label,
    }));

    const priorityCounts = PRIORITY_LEVELS.map(priority => ({
        priority,
        count: applications.filter((app) => app.priority === priority).length,
    }));

    const stats = [
        { label: 'Total', value: analytics.total, icon: Target, color: 'text-primary' },
        { label: 'Response Rate', value: `${analytics.responseRate}%`, icon: MessageSquare, color: 'text-[#7f8f69]' },
        { label: 'Interview Rate', value: `${analytics.interviewRate}%`, icon: TrendingUp, color: 'text-[#d69f57]' },
        { label: 'Due Follow-ups', value: analytics.dueFollowUps, icon: AlertTriangle, color: 'text-[#c14f3c]' },
        { label: 'Active Rate', value: `${analytics.activeRate}%`, icon: CheckCircle2, color: 'text-[#7f8f69]' },
        { label: 'Rejected', value: analytics.rejected, icon: XCircle, color: 'text-destructive' },
        { label: 'Avg Age', value: `${analytics.averageAge}d`, icon: Clock3, color: 'text-muted-foreground' },
        { label: '30d Activity', value: analytics.recentActivity, icon: TrendingUp, color: 'text-primary' },
    ];

    return (
        <main className="flex-1 overflow-auto bg-background">
            <div className="mx-auto max-w-6xl px-6 py-8">
                <div className="mb-8 border-b border-border pb-6">
                    <p className="editorial-label mb-1">§ II — The count</p>
                    <h1 className="text-3xl font-semibold">Analytics</h1>
                    <p className="text-sm text-muted-foreground">
                        Pipeline, response, follow-up, and activity performance.
                    </p>
                </div>

                <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="p-5 hover-glow">
                            <div className="flex items-center gap-4">
                                <div className="border border-border p-3">
                                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                </div>
                                <div className="min-w-0">
                                    <p className="font-serif text-3xl font-semibold">{stat.value}</p>
                                    <p className="editorial-label text-[10px]">{stat.label}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                    <Card className="p-6">
                        <p className="editorial-label mb-2">Status distribution</p>
                        <h2 className="mb-6 text-2xl font-semibold">Pipeline Breakdown</h2>
                        <div className="space-y-4">
                            {statusCounts.map(({ status, count, label }) => {
                                const percentage = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                                return (
                                    <div key={status} className="space-y-2">
                                        <div className="flex justify-between gap-4 text-sm">
                                            <span className="font-medium">{label}</span>
                                            <span className="text-muted-foreground">{count} ({Math.round(percentage)}%)</span>
                                        </div>
                                        <div className="h-2 overflow-hidden bg-muted">
                                            <div
                                                className="h-full bg-primary transition-all duration-500"
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <p className="editorial-label mb-2">Priority load</p>
                        <h2 className="mb-6 text-2xl font-semibold">Focus Split</h2>
                        <div className="space-y-4">
                            {priorityCounts.map(({ priority, count }) => {
                                const percentage = analytics.total > 0 ? (count / analytics.total) * 100 : 0;
                                return (
                                    <div key={priority} className="border-b border-border pb-3 last:border-b-0">
                                        <div className="flex items-center justify-between">
                                            <span className="editorial-label text-[10px]">{priority.toLowerCase()}</span>
                                            <span className="font-serif text-2xl font-semibold">{count}</span>
                                        </div>
                                        <div className="mt-2 h-px bg-border">
                                            <div className="h-px bg-primary" style={{ width: `${percentage}%` }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Card>

                    <Card className="p-6">
                        <p className="editorial-label mb-2">Company concentration</p>
                        <h2 className="mb-6 text-2xl font-semibold">Top Companies</h2>
                        {analytics.topCompanies.length === 0 ? (
                            <p className="text-sm text-muted-foreground">No applications yet.</p>
                        ) : (
                            <div className="space-y-3">
                                {analytics.topCompanies.map(([company, count], index) => (
                                    <div key={company} className="flex items-center justify-between border-b border-border pb-3 last:border-b-0">
                                        <span className="text-sm">{index + 1}. {company}</span>
                                        <span className="editorial-label text-primary">{count}</span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Card className="p-6 border-primary/40">
                        <p className="editorial-label mb-2">Next actions</p>
                        <h2 className="mb-4 text-2xl font-semibold">Work Queue</h2>
                        <div className="space-y-3 text-sm text-muted-foreground">
                            <p>{analytics.dueFollowUps} follow-ups are due or overdue.</p>
                            <p>{analytics.stalled} applications are marked stalled.</p>
                            <p>{analytics.submitted} submitted applications are included in conversion rates.</p>
                        </div>
                    </Card>
                </div>
            </div>
        </main>
    );
}
