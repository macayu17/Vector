'use client';

import { useApplicationStore } from '@/store/applicationStore';
import { APPLICATION_STATUSES, STATUS_CONFIG } from '@/types';
import { Card } from '@/components/ui/card';
import {
    BarChart3,
    TrendingUp,
    TrendingDown,
    Target,
    Clock,
    CheckCircle2,
    XCircle,
    AlertTriangle
} from 'lucide-react';

export default function AnalyticsPage() {
    const { applications } = useApplicationStore();

    // Calculate stats
    const total = applications.length;
    const applied = applications.filter(a => a.status !== 'WISHLIST').length;
    const interviews = applications.filter(a => a.status === 'INTERVIEW_SCHEDULED').length;
    const offers = applications.filter(a => a.status === 'OFFER').length;
    const rejected = applications.filter(a => a.status === 'REJECTED').length;

    const conversionRate = applied > 0 ? Math.round((interviews / applied) * 100) : 0;
    const offerRate = applied > 0 ? Math.round((offers / applied) * 100) : 0;

    // Applications per status
    const statusCounts = APPLICATION_STATUSES.map(status => ({
        status,
        count: applications.filter(a => a.status === status).length,
        label: STATUS_CONFIG[status].label
    }));

    const stats = [
        {
            label: 'Total Applications',
            value: total,
            icon: Target,
            color: 'text-primary',
            bgColor: 'bg-primary/10'
        },
        {
            label: 'Interview Rate',
            value: `${conversionRate}%`,
            icon: TrendingUp,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10'
        },
        {
            label: 'Offer Rate',
            value: `${offerRate}%`,
            icon: CheckCircle2,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10'
        },
        {
            label: 'Rejected',
            value: rejected,
            icon: XCircle,
            color: 'text-red-500',
            bgColor: 'bg-red-500/10'
        },
    ];

    return (
        <main className="flex-1 overflow-auto glass">
            <div className="max-w-6xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 border border-primary/20">
                            <BarChart3 className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Analytics</h1>
                            <p className="text-sm text-muted-foreground">
                                Track your job search performance
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat) => (
                        <Card key={stat.label} className="glass-card hover-glow p-5">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold">{stat.value}</p>
                                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>

                {/* Pipeline Breakdown */}
                <Card className="glass-card p-6 mb-8">
                    <h2 className="text-lg font-semibold mb-6">Pipeline Breakdown</h2>
                    <div className="space-y-4">
                        {statusCounts.map(({ status, count, label }) => {
                            const percentage = total > 0 ? (count / total) * 100 : 0;
                            return (
                                <div key={status} className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="font-medium">{label}</span>
                                        <span className="text-muted-foreground">{count} ({Math.round(percentage)}%)</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-blue-500 rounded-full transition-all duration-500"
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Tips Card */}
                <Card className="glass-card p-6 border-primary/20">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-xl bg-amber-500/10">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                        </div>
                        <div>
                            <h3 className="font-semibold mb-1">Tips to Improve</h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Follow up on applications after 1-2 weeks</li>
                                <li>• Tailor your resume for each application</li>
                                <li>• Network with employees at target companies</li>
                                <li>• Keep track of interview feedback</li>
                            </ul>
                        </div>
                    </div>
                </Card>
            </div>
        </main>
    );
}
